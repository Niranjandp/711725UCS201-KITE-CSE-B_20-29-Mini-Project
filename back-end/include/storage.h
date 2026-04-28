#ifndef STORAGE_H
#define STORAGE_H

#include "types.h"
#include <stdio.h>
#include <stdbool.h>

void storage_encrypt_account(Account *acc);
void storage_decrypt_account(Account *acc);

bool storage_init(void);
bool storage_read_account(unsigned int acctNum, Account *acc);
bool storage_write_account(unsigned int acctNum, const Account *acc);

void backup_database(void);
void restore_database(void);

#endif // STORAGE_H
