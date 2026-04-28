#ifndef USER_H
#define USER_H

#include "types.h"
#include <stdbool.h>

extern User currentUser;
extern bool loggedIn;

bool user_init(void);
bool user_login(void);
void user_logout(void);
void user_log_admin_action(const char *action);

#endif // USER_H
