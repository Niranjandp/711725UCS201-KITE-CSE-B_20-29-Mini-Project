# 👋 Welcome to FinVault!

FinVault is a sleek, secure, and fully-encrypted banking platform. We built it by combining a beautiful, modern React web dashboard with a lightning-fast, highly secure C-based backend. Whether you're managing accounts or visualizing financial data, FinVault keeps everything safe and simple.

## 📁 How It's Organized

We've kept the project structure super clean so you can easily find your way around:

```text
Root/
├── front-end/    # Our beautiful Vite + React UI Dashboard
├── back-end/     # The heavy lifter: Core C logic and banking operations
└── db/           # Safe storage: File-at-rest database (.dat, .log, .bak files)
```

## ✨ What Makes It Special?

### 💻 The Web Dashboard
- **Gorgeous UI**: We used a premium "glassmorphic" design that feels amazing to use.
- **True Privacy**: Your data is encrypted *inside your browser* using the **Web Crypto API (AES-256-GCM)**. The keys are derived securely from your password, meaning your data is never stored in plain text.
- **Live Analytics**: Watch your portfolio grow with beautiful, real-time charts powered by Recharts.

### 🛡️ The C Backend (Security First)
- **Modular & Clean**: The code is broken down into bite-sized, easy-to-read pieces.
- **Fort Knox Security**: 
  - Data is protected on disk with a rotating XOR-cipher.
  - No race conditions! We use Windows `_locking()` to keep data safe when multiple things happen at once.
  - Passwords are securely hashed before they ever touch the hard drive.

---

## 🛠️ Ready to Try It Out?

### 1. Fire up the Backend
Open your terminal, navigate to the `./back-end` directory, and compile the C code:
```bash
gcc -Wall -Wextra -Iinclude src/account.c src/api.c src/main.c src/plugin.c src/storage.c src/transaction.c src/ui.c src/user.c src/utils.c -o bank_sys.exe
```
*(Then simply run `./bank_sys.exe` to start the backend engine!)*

### 2. Launch the Dashboard
Next, let's get the beautiful UI running. Navigate to the `front-end` directory:
```bash
cd front-end
npm install
npm run dev
```

**🔑 Login Details to get you started:** 
Username: `admin` | Password: `admin`

Happy banking! 🎉