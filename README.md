# Bank Account Management System

This is a C program for managing bank accounts using random-access file handling. It allows users to perform various operations on account records stored in a binary file.

## Features

1. **Create Formatted Text File**: Generates `accounts.txt` with all account details in a readable format.
2. **Update Account Balance**: Modify an account's balance by entering charges (+) or payments (-).
3. **Add New Account**: Create a new account with full details (name, address, phone, DOB, balance).
4. **Delete Account**: Remove an existing account.
5. **Show Total Balances**: Calculate and display the sum of all account balances.
6. **Show Transaction History**: View the log of all transactions in `trans.log`.

## Account Structure

Each account record contains:
- Account Number (unsigned int)
- Last Name (15 chars)
- First Name (10 chars)
- Address (50 chars)
- Phone Number (15 chars)
- Date of Birth (dd/mm/yyyy, 11 chars)
- Balance (double)

## Files Used

- `credit.dat`: Binary file storing account records (up to 100 fixed-size records).
- `accounts.txt`: Formatted text output of account data.
- `trans.log`: Transaction history log.

## Compilation

Compile using GCC:
```
gcc trans.c -o trans.exe
```

## Usage

Run the executable:
```
./trans.exe
```

Follow the on-screen menu to select operations. All result outputs are appended to `accounts.txt`.

### Menu Options

1. Store a formatted text file of accounts called "accounts.txt" for printing
2. Update an account
3. Add a new account
4. Delete an account
5. Show total balances
6. Show transaction history
7. Exit

## Input Formats

- When adding a new account, enter details separated by spaces: `lastname firstname address phone dob balance`
- Balance updates: Enter positive for charges, negative for payments
- Account numbers: 1-100

## Notes

- The program initializes with 100 blank records if `credit.dat` doesn't exist.
- Due to fixed-size records, struct changes may require recreating the data file.
- All outputs are redirected to `accounts.txt` for record-keeping.

## Requirements

- C compiler (GCC recommended)
- Standard C libraries (stdio.h, stdlib.h)</content>
<parameter name="filePath">README.md