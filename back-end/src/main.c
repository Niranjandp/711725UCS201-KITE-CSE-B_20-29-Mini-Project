#include "ui.h"
#include "user.h"
#include "storage.h"
#include "account.h"
#include "transaction.h"
#include "utils.h"
#include "api.h"
#include "plugin.h"
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    ui_init();
    ui_clear_screen();
    
    ui_print_header("Initializing System...");
    if (!storage_init()) {
        printf("CRITICAL ERROR: Could not initialize storage.\n");
        return EXIT_FAILURE;
    }
    if (!user_init()) {
        printf("CRITICAL ERROR: Could not initialize users.\n");
        return EXIT_FAILURE;
    }
    
    plugin_load_all();
    printf("System Initialization Complete.\n");
    
    while (true) {
        if (!loggedIn) {
            ui_print_header("Authentication Required");
            if (!user_login()) {
                printf("Try again or press Ctrl+C to exit.\n");
                continue;
            }
        }
        
        ui_clear_screen();
        unsigned int choice = ui_show_main_menu();
        
        ui_clear_screen();
        switch (choice) {
            case 1: account_create(); break;
            case 2: account_update(); break;
            case 3: account_delete(); break;
            case 4: account_display_all(); break;
            case 5: account_search(); break;
            case 6: transaction_transfer(); break;
            case 7: account_apply_interest(); break;
            case 8: account_manage_loan(); break;
            case 9: transaction_show_history(); break;
            case 10: account_sort_and_report(); break;
            case 11: export_to_csv(); break;
            case 12: api_export_json(); break;
            case 13: backup_database(); break;
            case 14: restore_database(); break;
            case 15: 
                plugin_show_menu();
                int pid;
                if (get_int_input("Enter Plugin ID: ", &pid)) {
                    plugin_execute(pid);
                }
                break;
            case 16:
                user_logout();
                printf("Goodbye!\n");
                return EXIT_SUCCESS;
            default:
                printf("Invalid choice.\n");
                break;
        }
        
        printf("\nPress Enter to continue...");
        char buf[10];
        fgets(buf, sizeof(buf), stdin);
    }
    
    return EXIT_SUCCESS;
}
