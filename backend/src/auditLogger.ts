/**
 * @fileoverview Audit logging for security-critical operations
 * Copyright © 2026 NexusChain. All rights reserved.
 *
 * Proprietary - Unauthorized use or reverse-engineering prohibited.
 * Logs all sensitive operations for compliance and incident investigation.
 */

import * as admin from "firebase-admin";

interface AuditLog {
  timestamp: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: string;
  actor: string;
  resource: string;
  details: Record<string, unknown>;
  result: "SUCCESS" | "FAILURE";
  errorMessage?: string;
}

class AuditLogger {
  private collectionName = "_audit_logs";

  async log(
    severity: AuditLog["severity"],
    action: string,
    actor: string,
    resource: string,
    details: Record<string, unknown>,
    result: AuditLog["result"] = "SUCCESS",
    errorMessage?: string
  ): Promise<void> {
    const entry: AuditLog = {
      timestamp: new Date().toISOString(),
      severity,
      action,
      actor,
      resource,
      details,
      result,
      errorMessage,
    };

    try {
      const db = admin.firestore();
      await db.collection(this.collectionName).add(entry);

      // Also log to stdout with appropriate level
      if (severity === "CRITICAL") {
        console.error("[AUDIT CRITICAL]", JSON.stringify(entry));
      } else if (severity === "HIGH") {
        console.warn("[AUDIT HIGH]", JSON.stringify(entry));
      } else {
        console.log("[AUDIT]", JSON.stringify(entry));
      }
    } catch (err) {
      // Fail gracefully - don't block operations if logging fails
      console.error("[AUDIT LOG FAILED]", err);
    }
  }

  // Convenience methods for common operations
  async logFeeCollection(
    payer: string,
    amount: number,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.log(
      "MEDIUM",
      "FEE_COLLECTION",
      payer,
      `fee:${amount}`,
      { amount, payer },
      success ? "SUCCESS" : "FAILURE",
      error
    );
  }

  async logAdminAction(
    admin: string,
    action: string,
    details: Record<string, unknown>,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.log(
      "HIGH",
      action,
      admin,
      "admin_action",
      details,
      success ? "SUCCESS" : "FAILURE",
      error
    );
  }

  async logBotExecution(
    botType: "VOLUME" | "SNIPER",
    mintAddress: string,
    details: Record<string, unknown>,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.log(
      "MEDIUM",
      `${botType}_BOT_EXECUTION`,
      "system:bot",
      mintAddress,
      { botType, mintAddress, ...details },
      success ? "SUCCESS" : "FAILURE",
      error
    );
  }

  async logTokenCreation(
    creator: string,
    tokenName: string,
    mintAddress: string,
    details: Record<string, unknown>,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.log(
      "HIGH",
      "TOKEN_CREATION",
      creator,
      mintAddress,
      { tokenName, creator, ...details },
      success ? "SUCCESS" : "FAILURE",
      error
    );
  }

  async logSecurityEvent(
    eventType: string,
    severity: AuditLog["severity"],
    details: Record<string, unknown>,
    errorMessage?: string
  ): Promise<void> {
    await this.log(
      severity,
      eventType,
      "system:security",
      "security_event",
      details,
      errorMessage ? "FAILURE" : "SUCCESS",
      errorMessage
    );
  }

  async logRateLimitExceeded(
    clientId: string,
    endpoint: string,
    limit: number
  ): Promise<void> {
    await this.log(
      "LOW",
      "RATE_LIMIT_EXCEEDED",
      clientId,
      endpoint,
      { clientId, endpoint, limit },
      "FAILURE"
    );
  }

  async logUnauthorizedAccess(
    actor: string,
    resource: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.log(
      "HIGH",
      "UNAUTHORIZED_ACCESS_ATTEMPT",
      actor,
      resource,
      details,
      "FAILURE"
    );
  }
}

export const auditLogger = new AuditLogger();
