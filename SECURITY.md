# Security Policy & Intellectual Property Protection

**NexusChain — Solana Token Launchpad**  
Copyright © 2026 NexusChain. All rights reserved.

---

## 1. Reporting Security Vulnerabilities

We take security seriously. If you discover a vulnerability, please **do NOT** open a public issue. Instead:

1. **Email**: Send details to `security@nexuschain.dev` (or security contact)
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your recommended fix (if any)
3. **Response Time**: We commit to responding within 48 hours
4. **Disclosure**: We will coordinate public disclosure with you before releasing a patch

### Bug Bounty
We may offer compensation for legitimate security reports depending on severity. Please include your preferred contact method and wallet address for rewards.

---

## 2. Intellectual Property & Proprietary Code

### 2.1 Ownership
- **NexusChain Smart Contract** (`programs/nexus_chain/src/lib.rs`): Proprietary Solana program with exclusive fee collection and admin controls
- **Volume Bot & Sniper Bot** (`backend/src/bots/`): Proprietary market-making algorithms. Reverse-engineering or reuse without permission is prohibited
- **Frontend UI/UX**: Proprietary design and implementation protected by copyright

### 2.2 Licensed Components
This project is released under the **MIT License** for:
- Frontend application source code
- Backend infrastructure code
- Configuration and tooling

**Exception**: The smart contract and bot algorithms contain proprietary logic not covered by MIT and are provided for **inspection and auditing purposes only**.

### 2.3 Restrictions on Use
You MAY:
- ✅ Read and audit the source code
- ✅ Deploy to Solana mainnet or testnet
- ✅ Modify for personal/internal use
- ✅ Report security issues
- ✅ Contribute bug fixes via pull requests

You MAY NOT:
- ❌ Extract and use the bot algorithms in other projects
- ❌ Reverse-engineer the smart contract fee structure for competing services
- ❌ Publish modified versions as your own
- ❌ Remove copyright headers or license notices
- ❌ Use "NexusChain" or confusingly similar branding without permission
- ❌ Circumvent rate limiting, authentication, or access controls

---

## 3. Code Audit & Review Process

### Before Merging to `main`:
1. All pull requests require **at least 2 approvals** from core maintainers
2. Security-critical changes require **external audit** before deployment
3. Smart contract changes require **on-chain simulation** on devnet
4. All dependencies must pass **npm audit** with no high/critical vulnerabilities

### Dependency Policy:
- Regular `npm audit` scans (CI/CD enforced)
- Pinned versions for security-critical libraries
- Automated dependabot PRs with mandatory review
- Monthly security audit of dependencies

---

## 4. Secure Deployment Practices

### Environment Variables
- ✅ All secrets managed via cloud provider secret managers (Firebase, Vercel, etc.)
- ✅ Never commit `.env`, `private_keys`, or credentials to version control
- ✅ Rotate keys quarterly and immediately after any incident
- ✅ Use minimal-privilege service accounts for backend operations

### Smart Contract Security
- On-chain code is immutable once deployed
- All upgrades require explicit admin approval
- Fee structure is transparent on-chain
- PDA accounts use proper seed derivation and bump constraints

### API Security
- Rate limiting: 100 requests/minute per IP
- CORS: Restricted to whitelisted domains
- CSRF tokens on state-changing operations
- Content Security Policy headers enforced
- All endpoints require HTTPS (TLS 1.3+)

---

## 5. Data Privacy & User Protection

- **No user tracking**: We do not collect personal data beyond on-chain wallet addresses
- **Firestore Security**: All reads restricted, writes validated by Firestore rules
- **RLS Enforcement**: Database-level row security prevents unauthorized access
- **Audit Logs**: All sensitive operations logged with timestamp, actor, and action

---

## 6. Incident Response

If a security incident occurs:
1. We will immediately disable affected systems
2. Notify affected users within 24 hours
3. Post-mortem analysis within 48 hours
4. Public advisory on GitHub Security tab
5. Patch release within 72 hours (target)

---

## 7. Third-Party Audit

We welcome independent security audits. If you represent an auditing firm:
- Contact: `audit@nexuschain.dev`
- Provide: Scope, timeline, and audit focus areas
- NDA: Can be arranged upon request

---

## 8. Anti-Circumvention & DMCA Notice

This software implements technical measures to:
- Verify smart contract integrity
- Enforce rate limiting and access controls
- Prevent unauthorized bot execution

**Circumventing these measures to:**
- Deploy competing services using proprietary algorithms
- Access rate-limited endpoints without authorization
- Extract fee collection mechanisms
- ...may violate the DMCA (in the United States) and constitute breach of contract

---

## 9. Compliance & Legal

- **No Warranty**: Software provided AS-IS. See LICENSE file.
- **Indemnification**: Users assume all risk of deploying code on Solana mainnet
- **Regulatory**: User responsible for regulatory compliance in their jurisdiction
- **Terms of Service**: See app terms at nexus-token-creator.web.app/terms

---

## 10. Contact & Escalation

| Issue Type | Contact | Response Time |
|---|---|---|
| Security Vulnerability | `security@nexuschain.dev` | 48 hours |
| Code Audit Request | `audit@nexuschain.dev` | 1 week |
| Legal / IP Infringement | `legal@nexuschain.dev` | 2 business days |
| Bug Report (Public) | GitHub Issues | Best effort |

---

**Last Updated**: June 22, 2026  
**Version**: 1.0
