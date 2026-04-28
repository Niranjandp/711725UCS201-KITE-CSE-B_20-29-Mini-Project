#ifndef TRANSACTION_H
#define TRANSACTION_H

#include "types.h"

void transaction_transfer(void);
void transaction_show_history(void);
void transaction_log_system(const char *msg);

#endif // TRANSACTION_H
