#include "user.h"
#include "utils.h"
#include <stdio.h>
#include <string.h>

#define USERS_FILE "users.dat"

User currentUser;
bool loggedIn = false;

// Extremely simple hash for demonstration purposes
static void simple_hash(const char *input, char *output) {
    unsigned long hash = 5381;
    int c;
    while ((c = *input++)) {
        hash = ((hash << 5) + hash) + c; 
    }
    snprintf(output, 64, "%lx", hash);
}

bool user_init(void) {
    FILE *fPtr = fopen(USERS_FILE, "rb");
    if (!fPtr) {
        // Create default admin user
        fPtr = fopen(USERS_FILE, "wb");
        if (!fPtr) return false;
        
        User admin = {0};
        strcpy(admin.username, "admin");
        simple_hash("admin", admin.password_hash);
        admin.isAdmin = true;
        
        fwrite(&admin, sizeof(User), 1, fPtr);
        fclose(fPtr);
        printf("Initialized default admin (admin/admin).\n");
    } else {
        fclose(fPtr);
    }
    return true;
}

bool user_login(void) {
    char usr[32], pwd[32], hash[64];
    
    if (!get_string_input("Username: ", usr, sizeof(usr))) return false;
    if (!get_string_input("Password: ", pwd, sizeof(pwd))) return false;
    
    simple_hash(pwd, hash);
    
    FILE *fPtr = fopen(USERS_FILE, "rb");
    if (!fPtr) return false;
    
    User u;
    while (fread(&u, sizeof(User), 1, fPtr) == 1) {
        if (strcmp(u.username, usr) == 0 && strcmp(u.password_hash, hash) == 0) {
            currentUser = u;
            loggedIn = true;
            fclose(fPtr);
            
            char msg[128];
            snprintf(msg, sizeof(msg), "User '%s' logged in.", u.username);
            user_log_admin_action(msg);
            
            return true;
        }
    }
    
    fclose(fPtr);
    printf("Invalid credentials.\n");
    return false;
}

void user_logout(void) {
    if (loggedIn) {
        char msg[128];
        snprintf(msg, sizeof(msg), "User '%s' logged out.", currentUser.username);
        user_log_admin_action(msg);
        
        loggedIn = false;
        memset(&currentUser, 0, sizeof(User));
    }
}

void user_log_admin_action(const char *action) {
    FILE *log = fopen("admin.log", "a");
    if (log != NULL) {
        char ts[32];
        get_current_timestamp(ts, sizeof(ts));
        fprintf(log, "[%s] ADMIN: %s\n", ts, action);
        fclose(log);
    }
}
