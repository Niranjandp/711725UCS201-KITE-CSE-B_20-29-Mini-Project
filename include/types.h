#ifndef TYPES_H
#define TYPES_H

#include <stdint.h>
#include <stdbool.h>

#define MAX_RECORDS 100
#define MAX_USERS 10

typedef enum {
    ACCT_SAVINGS = 0,
    ACCT_CHECKING,
    ACCT_FIXED
} AccountType;

typedef struct {
    unsigned int acctNum;
    char lastName[15];
    char firstName[10];
    char address[50];
    char phone[15];
    char dob[11];
    double balance;
    AccountType type;
    unsigned int branchId;
} Account;

typedef struct {
    char username[32];
    char password_hash[64]; // Simplified hash
    bool isAdmin;
} User;

typedef enum {
    TXN_DEPOSIT = 0,
    TXN_WITHDRAWAL,
    TXN_TRANSFER,
    TXN_BILLPAY
} TransactionType;

typedef struct {
    unsigned int txnId;
    unsigned int srcAcct;
    unsigned int dstAcct;
    double amount;
    TransactionType type;
    char timestamp[32];
    char performedBy[32];
} Transaction;

typedef struct {
    unsigned int acctNum;
    double principalAmount;
    double interestRate;
    int durationMonths;
} Loan;

#endif // TYPES_H
