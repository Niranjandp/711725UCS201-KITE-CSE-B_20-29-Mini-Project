#include "transaction.h"
#include "storage.h"
#include "utils.h"
#include "user.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TRANS_LOG_FILE "transactions.dat"

static unsigned int get_next_txn_id() {
    FILE *f = fopen(TRANS_LOG_FILE, "rb");
    if (!f) return 1;
    
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fclose(f);
    
    return (unsigned int)(size / sizeof(Transaction)) + 1;
}

static void log_transaction(Transaction *txn) {
    FILE *f = fopen(TRANS_LOG_FILE, "ab");
    if (f) {
        fwrite(txn, sizeof(Transaction), 1, f);
        fclose(f);
    }
    
    FILE *txtLog = fopen("trans.log", "a");
    if (txtLog) {
        fprintf(txtLog, "[%s] TXN %u: Src: %u, Dst: %u, Amt: %.2f, Type: %d, By: %s\n",
                txn->timestamp, txn->txnId, txn->srcAcct, txn->dstAcct,
                txn->amount, txn->type, txn->performedBy);
        fclose(txtLog);
    }
}

void transaction_transfer(void) {
    int src, dst;
    double amount;
    
    if (!get_int_input("Enter Source Account: ", &src)) return;
    if (!get_int_input("Enter Destination Account: ", &dst)) return;
    if (!get_double_input("Enter Amount to Transfer: ", &amount)) return;
    if (amount <= 0) {
        printf("Invalid amount.\n");
        return;
    }

    Account accSrc, accDst;
    if (!storage_read_account(src, &accSrc) || accSrc.acctNum == 0) {
        printf("Source account does not exist.\n");
        return;
    }
    if (!storage_read_account(dst, &accDst) || accDst.acctNum == 0) {
        printf("Destination account does not exist.\n");
        return;
    }
    
    if (accSrc.balance < amount) {
        printf("Insufficient funds in source account.\n");
        return;
    }
    
    accSrc.balance -= amount;
    accDst.balance += amount;
    
    storage_write_account(src, &accSrc);
    storage_write_account(dst, &accDst);
    
    Transaction txn;
    txn.txnId = get_next_txn_id();
    txn.srcAcct = src;
    txn.dstAcct = dst;
    txn.amount = amount;
    txn.type = TXN_TRANSFER;
    get_current_timestamp(txn.timestamp, sizeof(txn.timestamp));
    strncpy(txn.performedBy, currentUser.username, sizeof(txn.performedBy) - 1);
    
    log_transaction(&txn);
    
    printf("Transfer successful.\n");
    send_notification(&accSrc, "Transfer out successful.");
    send_notification(&accDst, "Transfer in received.");
}

void transaction_show_history(void) {
    FILE *f = fopen("trans.log", "r");
    if (!f) {
        printf("No transaction history available.\n");
        return;
    }
    
    printf("\n--- Transaction History ---\n");
    char buffer[256];
    while (fgets(buffer, sizeof(buffer), f)) {
        printf("%s", buffer);
    }
    fclose(f);
    printf("--- End of History ---\n");
}

void transaction_log_system(const char *msg) {
    FILE *log = fopen("trans.log", "a");
    if (log != NULL) {
        char ts[32];
        get_current_timestamp(ts, sizeof(ts));
        fprintf(log, "[%s] SYSTEM: %s\n", ts, msg);
        fclose(log);
    }
}
