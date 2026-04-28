#include "utils.h"
#include "storage.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

void remove_newline(char *str) {
    size_t len = strlen(str);
    if (len > 0 && str[len - 1] == '\n') {
        str[len - 1] = '\0';
    }
}

bool get_string_input(const char *prompt, char *buffer, size_t size) {
    printf("%s", prompt);
    if (fgets(buffer, size, stdin) != NULL) {
        remove_newline(buffer);
        return true;
    }
    return false;
}

bool get_int_input(const char *prompt, int *val) {
    char buffer[128];
    if (get_string_input(prompt, buffer, sizeof(buffer))) {
        if (sscanf(buffer, "%d", val) == 1) {
            return true;
        }
    }
    return false;
}

bool get_double_input(const char *prompt, double *val) {
    char buffer[128];
    if (get_string_input(prompt, buffer, sizeof(buffer))) {
        if (sscanf(buffer, "%lf", val) == 1) {
            return true;
        }
    }
    return false;
}

void get_current_timestamp(char *buffer, size_t size) {
    time_t rawtime;
    struct tm *timeinfo;
    time(&rawtime);
    timeinfo = localtime(&rawtime);
    strftime(buffer, size, "%Y-%m-%d %H:%M:%S", timeinfo);
}

void export_to_csv(void) {
    FILE *fPtr = fopen("../db/credit.dat", "rb");
    if (!fPtr) {
        printf("Error: Could not open credit.dat for export.\n");
        return;
    }

    FILE *csvPtr = fopen("../db/accounts_export.csv", "w");
    if (!csvPtr) {
        printf("Error: Could not create accounts_export.csv.\n");
        fclose(fPtr);
        return;
    }

    fprintf(csvPtr, "AccountNum,LastName,FirstName,Address,Phone,DOB,Balance,Type,BranchID\n");

    Account acc;
    while (fread(&acc, sizeof(Account), 1, fPtr) == 1) {
        if (acc.acctNum != 0) {
            storage_decrypt_account(&acc);
            fprintf(csvPtr, "%u,%s,%s,%s,%s,%s,%.2f,%d,%u\n",
                    acc.acctNum, acc.lastName, acc.firstName,
                    acc.address, acc.phone, acc.dob,
                    acc.balance, acc.type, acc.branchId);
        }
    }

    fclose(fPtr);
    fclose(csvPtr);
    printf("Successfully exported accounts to accounts_export.csv\n");
}

void send_notification(const Account *acc, const char *msg) {
    FILE *log = fopen("../db/notifications.log", "a");
    if (log != NULL) {
        char ts[32];
        get_current_timestamp(ts, sizeof(ts));
        fprintf(log, "[%s] To %s (%s): %s\n", ts, acc->firstName, acc->phone, msg);
        fclose(log);
    }
}
