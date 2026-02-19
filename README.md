# 🌊 Project Aarna — Decentralized MRV for India's Blue Carbon

> India's first blockchain-powered D-MRV (Decentralized Monitoring, Reporting & Verification) platform for coastal blue carbon ecosystems, built on **Algorand**.

[![Built with AlgoKit](https://img.shields.io/badge/Built%20with-AlgoKit-0A6DEB?style=for-the-badge)](https://algorand.co/algokit)
[![Algorand Testnet](https://img.shields.io/badge/Network-Algorand%20Testnet-09DE62?style=for-the-badge)](https://testnet.explorer.perawallet.app/)
[![RIFT 2026](https://img.shields.io/badge/Hackathon-RIFT%202026-FF5D13?style=for-the-badge)](https://rift2026.com)

---

## 🎯 Problem Statement

**PS4 — Build on Algorand: Carbon Credits & Sustainability**

Coastal ecosystems (mangroves, seagrasses, wetlands) sequester 5-10× more carbon per hectare than terrestrial forests. Yet there's no transparent, verifiable system to track India's blue carbon projects from monitoring to carbon credit issuance.

## 💡 Solution

**Project Aarna** provides an end-to-end D-MRV platform where:

1. **Developers/Communities** submit ecosystem data with IPFS evidence
2. **Validators (NCCR/experts)** review and verify project data on-chain
3. **AARNA tokens** (Algorand Standard Assets) are minted as carbon credits
4. The **Public Registry** provides transparency for all stakeholders

All project lifecycle events are recorded on the Algorand blockchain, ensuring immutability and auditability.

---

## 🏗️ Architecture

```
project-aarna/
├── projects/
│   ├── project-aarna-contracts/    # AlgoPy smart contract
│   │   └── smart_contracts/
│   │       └── aarna_registry/
│   │           └── contract.py     # AarnaRegistry ARC-4 contract
│   └── project-aarna-frontend/     # React + Vite + TailwindCSS
│       └── src/
│           ├── pages/              # Landing, Developer, Validator, Registry
│           ├── components/         # Navbar, ConnectWallet
│           ├── hooks/useAarna.ts   # Contract interaction hook
│           └── data/               # Mock Indian coastal project data
└── README.md
```

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Algorand (Testnet) |
| **Smart Contract** | AlgoPy (Puya compiler) |
| **Token** | AARNA ASA (Algorand Standard Asset) |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, daisyUI |
| **Wallet** | Pera Wallet, Defly, Exodus |
| **Data** | IPFS (via CID references) |
| **Tooling** | AlgoKit CLI |

## 🚀 Quick Start

### Prerequisites

- [Node.js ≥ 20](https://nodejs.org/)
- [Python ≥ 3.12](https://www.python.org/)
- [AlgoKit CLI](https://algorand.co/algokit)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for contract compilation)
- [Pera Wallet](https://perawallet.app/) (set to Testnet)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd project-aarna

# Install frontend dependencies
cd projects/project-aarna-frontend
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Building the Smart Contract

```bash
cd projects/project-aarna-contracts
poetry install
algokit compile python smart_contracts/aarna_registry/contract.py --out-dir=smart_contracts/artifacts/aarna_registry
```

## 📱 Features

### 🌊 Landing Page
- Animated ocean-themed hero with gradient background
- Real-time impact stats (verified projects, carbon credits, CO₂ sequestered)
- "What is Blue Carbon?" educational section
- D-MRV workflow visualization

### 🔬 Developer Dashboard
- Deploy AarnaRegistry contract to Testnet
- Create AARNA carbon credit token (ASA)
- Submit blue carbon projects with IPFS evidence
- Track submitted projects and their status

### ✅ Validator Dashboard
- Review pending project submissions
- Approve projects with carbon credit allocation
- Reject insufficient submissions
- Issue AARNA tokens to project submitters

### 🌍 Public Registry
- Browse all projects (verified, pending, rejected)
- Impact summary dashboard
- Carbon credit and CO₂ metrics per project
- Link to Algorand Testnet Explorer

### 🎮 Demo Mode
Built-in Demo mode for smooth presentations — all contract interactions return mock responses without requiring a wallet or Testnet connection.

## 🌿 Blue Carbon Projects (Demo Data)

| Project | Location | Ecosystem | Status |
|---|---|---|---|
| Sundarbans Mangrove Restoration | West Bengal | Mangrove | Verified |
| Pichavaram Mangrove Conservation | Tamil Nadu | Mangrove | Verified |
| Gulf of Kutch Seagrass Monitoring | Gujarat | Seagrass | Pending |
| Chilika Wetland Carbon Assessment | Odisha | Wetland | Pending |

## 🔗 Smart Contract — AarnaRegistry

The `AarnaRegistry` is an ARC-4 Algorand smart contract built with AlgoPy:

- **Multi-project tracking** — indexes up to 4 projects with metadata
- **Role-based access** — admin sets validators, validators approve/reject
- **AARNA ASA** — carbon credit token created via inner transactions
- **Project lifecycle** — Pending → Verified/Rejected → Credits Issued
- **Read methods** — full project data retrieval (name, location, ecosystem, CID, status, credits)

## 📋 Attribution

- Bootstrapped with [AlgoKit CLI](https://algorand.co/algokit) (Algorand Foundation)
- Wallet integration: [@txnlab/use-wallet-react](https://github.com/TxnLab/use-wallet)
- UI: React, Vite, [TailwindCSS](https://tailwindcss.com/), [daisyUI](https://daisyui.com/)
- Algorand Python SDK: [AlgoPy / Puya](https://github.com/algorandfoundation/puya)
- Testnet infrastructure: [AlgoNode](https://algonode.io/)

## 👤 Team

**Vishnu K** — Full-stack developer • RIFT 2026 Hackathon • PS4 Algorand

---

*Built with 🌊 for India's coastline at RIFT 2026*
