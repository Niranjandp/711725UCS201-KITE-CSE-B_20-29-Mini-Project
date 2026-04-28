# FinVault: Secure Bank Management System

FinVault is a state-of-the-art, secure, and encrypted full-stack banking platform that combines a modern React web frontend with a high-performance C-based backend architecture.

## 📁 Repository Structure

The project is organized neatly for robust microservices-style management:

```
Root/
├── front-end/    # Modern Vite + React UI Dashboard
├── back-end/     # Core C logic, multithreading, and banking operations
└── db/           # File-at-rest database storage (.dat, .log, .bak files)
```

## 🚀 Key Features

### 💻 Front-End (Web Dashboard)
- **Glassmorphic UI**: High-end user experience with customizable data tools.
- **Client-Side Encryption**: Uses **Web Crypto API (AES-256-GCM)** derived via PBKDF2. No local financial state persists unencrypted in browser stores.
- **Analytics Visualization**: Real-time Recharts monitoring of portfolio assets.

### 🛡️ Back-End & Security (C Layer)
- **Modular Framework**: Clear boundaries across components.
- **Multi-layered Guardrails**:
  - Rotating XOR-cipher data-at-rest encryption.
  - Windows low-level `_locking()` concurrency protection.
  - DJB2 password cryptographic hashing.

## 🛠️ Installation & Setup

### 1. The C Backend
Run the compiler from the `./back-end` directory:
```bash
gcc -Wall -Wextra -Iinclude src/account.c src/api.c src/main.c src/plugin.c src/storage.c src/transaction.c src/ui.c src/user.c src/utils.c -o bank_sys.exe
```

### 2. The React Frontend
Install local dependencies and spin up the internal dev-cluster:
```bash
cd front-end
npm install
npm run dev
```

**Access default profiles**: `admin` / `admin`