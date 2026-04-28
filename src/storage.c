#include "storage.h"
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <io.h>
#include <sys/locking.h>
#include <fcntl.h>
#endif

#define XOR_KEY 0x5A
#define DB_FILE "credit.dat"
#define BAK_FILE "credit.bak"

void storage_encrypt_account(Account *acc) {
    unsigned char *ptr = (unsigned char *)acc;
    for (size_t i = 0; i < sizeof(Account); i++) {
        ptr[i] ^= XOR_KEY;
    }
}

void storage_decrypt_account(Account *acc) {
    storage_encrypt_account(acc); // XOR is symmetric
}

bool storage_init(void) {
    FILE *fPtr = fopen(DB_FILE, "rb+");
    if (fPtr == NULL) {
        fPtr = fopen(DB_FILE, "wb+");
        if (fPtr == NULL) {
            return false;
        }
        Account blank = {0};
        storage_encrypt_account(&blank);
        for (int i = 0; i < MAX_RECORDS; ++i) {
            fwrite(&blank, sizeof(Account), 1, fPtr);
        }
    }
    fclose(fPtr);
    return true;
}

static void lock_file(FILE *f) {
#ifdef _WIN32
    int fd = _fileno(f);
    long current_pos = ftell(f);
    fseek(f, 0, SEEK_SET);
    _locking(fd, _LK_LOCK, 1);
    fseek(f, current_pos, SEEK_SET);
#endif
}

static void unlock_file(FILE *f) {
#ifdef _WIN32
    int fd = _fileno(f);
    long current_pos = ftell(f);
    fseek(f, 0, SEEK_SET);
    _locking(fd, _LK_UNLCK, 1);
    fseek(f, current_pos, SEEK_SET);
#endif
}

bool storage_read_account(unsigned int acctNum, Account *acc) {
    if (acctNum < 1 || acctNum > MAX_RECORDS) return false;
    
    FILE *fPtr = fopen(DB_FILE, "rb");
    if (!fPtr) return false;

    lock_file(fPtr);
    fseek(fPtr, (acctNum - 1) * sizeof(Account), SEEK_SET);
    size_t result = fread(acc, sizeof(Account), 1, fPtr);
    unlock_file(fPtr);
    fclose(fPtr);

    if (result == 1) {
        storage_decrypt_account(acc);
        return true;
    }
    return false;
}

bool storage_write_account(unsigned int acctNum, const Account *acc) {
    if (acctNum < 1 || acctNum > MAX_RECORDS) return false;

    FILE *fPtr = fopen(DB_FILE, "rb+");
    if (!fPtr) return false;

    Account copy = *acc;
    storage_encrypt_account(&copy);

    lock_file(fPtr);
    fseek(fPtr, (acctNum - 1) * sizeof(Account), SEEK_SET);
    size_t result = fwrite(&copy, sizeof(Account), 1, fPtr);
    unlock_file(fPtr);
    fclose(fPtr);

    return result == 1;
}

void backup_database(void) {
    FILE *src = fopen(DB_FILE, "rb");
    if (!src) return;
    FILE *dst = fopen(BAK_FILE, "wb");
    if (!dst) {
        fclose(src);
        return;
    }
    
    char buffer[1024];
    size_t bytes;
    while ((bytes = fread(buffer, 1, sizeof(buffer), src)) > 0) {
        fwrite(buffer, 1, bytes, dst);
    }
    
    fclose(src);
    fclose(dst);
    printf("Backup completed successfully.\n");
}

void restore_database(void) {
    FILE *src = fopen(BAK_FILE, "rb");
    if (!src) {
        printf("No backup found.\n");
        return;
    }
    FILE *dst = fopen(DB_FILE, "wb");
    if (!dst) {
        fclose(src);
        return;
    }
    
    char buffer[1024];
    size_t bytes;
    while ((bytes = fread(buffer, 1, sizeof(buffer), src)) > 0) {
        fwrite(buffer, 1, bytes, dst);
    }
    
    fclose(src);
    fclose(dst);
    printf("Restore completed successfully.\n");
}
