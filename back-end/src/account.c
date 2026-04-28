#include "account.h"
#include "storage.h"
#include "utils.h"
#include "transaction.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Creates a new account, prompting the user for details
void account_create(void) {
    int acctNum;
    if (!get_int_input("Enter new account number (1-100): ", &acctNum)) return;
    
    Account acc;
    // Check if account is already in use
    if (storage_read_account(acctNum, &acc) && acc.acctNum != 0) {
        printf("Account #%d already exists.\n", acctNum);
        return;
    }

    acc.acctNum = acctNum;
    get_string_input("Enter Last Name: ", acc.lastName, sizeof(acc.lastName));
    get_string_input("Enter First Name: ", acc.firstName, sizeof(acc.firstName));
    get_string_input("Enter Address: ", acc.address, sizeof(acc.address));
    get_string_input("Enter Phone: ", acc.phone, sizeof(acc.phone));
    get_string_input("Enter DOB (dd/mm/yyyy): ", acc.dob, sizeof(acc.dob));
    
    int type, branch;
    get_int_input("Enter Type (0=Savings, 1=Checking, 2=Fixed): ", &type);
    get_int_input("Enter Branch ID: ", &branch);
    acc.type = (AccountType)type;
    acc.branchId = branch;
    
    get_double_input("Enter Initial Balance: ", &acc.balance);

    if (storage_write_account(acctNum, &acc)) {
        printf("Account created successfully.\n");
        char logmsg[128];
        snprintf(logmsg, sizeof(logmsg), "Account %d created.", acctNum);
        transaction_log_system(logmsg);
        send_notification(&acc, "Welcome to the Bank!");
    } else printf("Failed to create account.\n");
}

void account_update(void) {
    int acctNum;
    if (!get_int_input("Enter account to update: ", &acctNum)) return;

    Account acc;
    if (!storage_read_account(acctNum, &acc) || acc.acctNum == 0) {
        printf("Account #%d does not exist.\n", acctNum);
        return;
    }

    printf("Current Balance: %.2f\n", acc.balance);
    double amt;
    get_double_input("Enter charge (+) or payment (-): ", &amt);
    
    acc.balance += amt;
    if (storage_write_account(acctNum, &acc)) {
        printf("Account updated. New Balance: %.2f\n", acc.balance);
        char logmsg[128];
        snprintf(logmsg, sizeof(logmsg), "Account %d balance updated by %.2f.", acctNum, amt);
        transaction_log_system(logmsg);
        send_notification(&acc, "Your account balance has been updated.");
    }
}

void account_delete(void) {
    int acctNum;
    if (!get_int_input("Enter account to delete: ", &acctNum)) return;

    Account acc;
    if (!storage_read_account(acctNum, &acc) || acc.acctNum == 0) {
        printf("Account #%d does not exist.\n", acctNum);
        return;
    }

    Account blank = {0};
    if (storage_write_account(acctNum, &blank)) {
        printf("Account deleted.\n");
        char logmsg[128];
        snprintf(logmsg, sizeof(logmsg), "Account %d deleted.", acctNum);
        transaction_log_system(logmsg);
    }
}

void account_display_all(void) {
    printf("%-6s%-16s%-11s%-10s%-8s%-8s\n", "Acct", "Last Name", "First Name", "Balance", "Type", "Branch");
    double total = 0.0;
    
    for (int i = 1; i <= MAX_RECORDS; i++) {
        Account acc;
        if (storage_read_account(i, &acc) && acc.acctNum != 0) {
            printf("%-6d%-16s%-11s%10.2f%-8d%-8d\n", 
                acc.acctNum, acc.lastName, acc.firstName, acc.balance, acc.type, acc.branchId);
            total += acc.balance;
        }
    }
    printf("\nTotal of all balances: %.2f\n", total);
}

void account_search(void) {
    char name[32];
    get_string_input("Enter First or Last Name to search: ", name, sizeof(name));
    
    printf("\nSearch Results:\n");
    for (int i = 1; i <= MAX_RECORDS; i++) {
        Account acc;
        if (storage_read_account(i, &acc) && acc.acctNum != 0) {
            if (strstr(acc.firstName, name) || strstr(acc.lastName, name)) {
                 printf("Acct %d: %s %s, Balance: %.2f\n", acc.acctNum, acc.firstName, acc.lastName, acc.balance);
            }
        }
    }
}

static int compare_accounts(const void *a, const void *b) {
    Account *accA = (Account *)a;
    Account *accB = (Account *)b;
    if (accA->balance < accB->balance) return 1;
    if (accA->balance > accB->balance) return -1;
    return 0;
}

void account_sort_and_report(void) {
    Account accounts[MAX_RECORDS];
    int count = 0;
    
    for (int i = 1; i <= MAX_RECORDS; i++) {
        Account acc;
        if (storage_read_account(i, &acc) && acc.acctNum != 0) {
            accounts[count++] = acc;
        }
    }
    
    qsort(accounts, count, sizeof(Account), compare_accounts);
    
    FILE *rep = fopen("report.txt", "w");
    if (!rep) return;
    
    fprintf(rep, "--- Sorted Account Report (By Balance Descending) ---\n");
    for (int i = 0; i < count; i++) {
        fprintf(rep, "Acct %d: %s %s - %.2f\n", accounts[i].acctNum, accounts[i].firstName, accounts[i].lastName, accounts[i].balance);
        printf("Acct %d: %s %s - %.2f\n", accounts[i].acctNum, accounts[i].firstName, accounts[i].lastName, accounts[i].balance);
    }
    fclose(rep);
    printf("Report saved to report.txt\n");
}

// Automatically calculate and add interest for eligible account types
void account_apply_interest(void) {
    for (int i = 1; i <= MAX_RECORDS; i++) {
        Account acc;
        if (storage_read_account(i, &acc) && acc.acctNum != 0) {
            double rate = (acc.type == ACCT_SAVINGS) ? 0.03 : (acc.type == ACCT_FIXED) ? 0.06 : 0;
            if (rate > 0) {
                acc.balance += acc.balance * rate;
                storage_write_account(i, &acc);
                send_notification(&acc, (acc.type == ACCT_SAVINGS) ? "Interest applied to your Savings account." : "Interest applied to your Fixed account.");
            }
        }
    }
    printf("Interest applied to all eligible accounts.\n");
    transaction_log_system("System applied monthly interest.");
}

void account_manage_loan(void) {
    int acctNum;
    if (!get_int_input("Enter account number for Loan Management: ", &acctNum)) return;
    
    Account acc;
    if (!storage_read_account(acctNum, &acc) || acc.acctNum == 0) {
        printf("Account not found.\n");
        return;
    }
    
    double loanAmt;
    get_double_input("Enter Loan Amount to issue: ", &loanAmt);
    
    acc.balance += loanAmt; // Grant loan to balance
    storage_write_account(acctNum, &acc);
    
    char logmsg[128];
    snprintf(logmsg, sizeof(logmsg), "Loan of %.2f issued to Acct %d", loanAmt, acctNum);
    transaction_log_system(logmsg);
    send_notification(&acc, "Your loan has been approved and credited.");
    printf("Loan approved.\n");
}
