#ifndef UTILS_H
#define UTILS_H

#include "types.h"
#include <stdio.h>
#include <stdbool.h>

void remove_newline(char *str);
bool get_string_input(const char *prompt, char *buffer, size_t size);
bool get_int_input(const char *prompt, int *val);
bool get_double_input(const char *prompt, double *val);
void get_current_timestamp(char *buffer, size_t size);
void export_to_csv(void);
void send_notification(const Account *acc, const char *msg);

#endif // UTILS_H
