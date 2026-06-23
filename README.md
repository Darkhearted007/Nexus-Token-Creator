# NexusChain — Solana Token Launchpad

> ⚡ Launch, protect, and market your Solana SPL token in seconds.

Live App: **[nexus-token-creator.web.app](https://nexus-token-creator.web.app)**

---

## ⚖️ Intellectual Property Notice

**Copyright © 2026 NexusChain. All rights reserved.**

This repository contains **proprietary code** in addition to open-source components. Please review our complete IP policy:

- **[SECURITY.md](SECURITY.md)** — Vulnerability disclosure & proprietary code restrictions
- **[TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md)** — Usage terms & IP enforcement
- **[LICENSE](LICENSE)** — MIT license applies only to explicitly open-source components

**Key Restrictions**:
- ❌ **Do NOT** extract or reuse volume/sniper bot algorithms
- ❌ **Do NOT** reverse-engineer the smart contract for competing services
- ❌ **Do NOT** use "NexusChain" branding without permission
- ✅ **DO** audit the code and report security issues
- ✅ **DO** deploy tokens using our service
- ✅ **DO** read the code for educational purposes

---

## Features

| Feature | Description |
|---|---|
| 🪙 **Token Creation** | Deploy SPL tokens on Solana Mainnet with custom name, symbol, supply & decimals |
| 🔒 **Authority Revocation** | Revoke Mint, Freeze, and Update authorities for trust & safety |
| 🔥 **Volume Bot** | Market-maker bot to pump trading volume and hit DexScreener trending |
| 🎯 **Sniper Bot** | Bundle sniper to buy your own supply at block 0, preventing MEV attacks |
| 📊 **Firebase Indexing** | All launched tokens indexed in Firestore for a live trending feed |
| 🛡️ **DDoS Protection** | Edge rate-limiting, strict Firestore rules, and security headers |
| 💸 **Fee Vault (On-Chain)** | Anchor smart contract with PDA Vault and admin `withdraw_fees` instruction |

---

## Tech Stack

- **Frontend**: Next.js 16, TailwindCSS, Framer Motion
- **Blockchain**: Solana Web3.js, SPL Token, Anchor Framework
- **Backend**: TypeScript, Firebase Admin SDK, Node.js
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting (Web Frameworks / Cloud Functions)
- **RPC**: Helius Mainnet

---

## Project Structure

```
nexus_chain/
├── app/                   # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # UI components (Navbar, WalletProvider)
│   │   └── lib/
│   │       ├── firebase/  # Firestore client
│   │       └── solana/    # Mint transaction builder
│   ├── firestore.rules    # Firebase database security rules
│   └── firebase.json      # Firebase deployment config
├── backend/
│   ├── src/
│   │   ├── bots/          # Volume Bot & Sniper Bot
│   │   └── admin/         # Fee withdrawal script
│   └── .env               # Private keys & RPC (never commit!)
├── programs/
│   └── nexus_chain/
│       └── src/lib.rs     # Anchor smart contract (Config PDA, Vault, withdraw_fees)
└── Anchor.toml
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Rust & Anchor CLI (`cargo install --git https://github.com/coral-xyz/anchor anchor-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- Solana CLI

### 1. Install Dependencies
```bash
cd app && npm install
cd ../backend && npm install
```

### 2. Configure Environment

**`app/.env.local`**
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_TREASURY_WALLET=YOUR_ADMIN_WALLET_PUBKEY
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

**`backend/.env`**
```env
ADMIN_PRIVATE_KEY=YOUR_BASE58_PRIVATE_KEY
FEE_WALLET_ADDRESS=YOUR_ADMIN_WALLET_PUBKEY
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### 3. Run Frontend Locally
```bash
cd app && npm run dev
```

### 4. Build Smart Contract
```bash
anchor build
```

---

## Deployment

```bash
cd app
firebase login
firebase use nexus-token-creator
firebase deploy
```

---

## Fee Withdrawals

Fees are collected on-chain into a **PDA Vault** controlled by the Anchor smart contract. To withdraw:

1. Ensure `ADMIN_PRIVATE_KEY` is set in `backend/.env`
2. Run the admin withdrawal script:
```bash
cd backend
npx ts-node src/admin/withdraw.ts
```

> The `withdraw_fees` instruction in `programs/nexus_chain/src/lib.rs` validates the signer against the stored `Config.admin` pubkey before transferring any funds.

---

## Security

- **Firestore Rules**: Strict schema enforcement — bots cannot spam malformed entries
- **Edge Rate Limiting**: IP-based rate limiter (`proxy.ts`) drops requests exceeding 100/minute
- **HTTP Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **RPC Keys**: Always kept server-side in `.env` — never exposed to the client

---

## License

MIT © 2026 NexusChain
