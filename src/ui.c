#include "ui.h"
#include <stdio.h>
#include <stdlib.h>

#ifdef _WIN32
#include <windows.h>
#endif

void ui_init(void) {
#ifdef _WIN32
    // Enable virtual terminal processing for ANSI colors on newer Windows
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    if (hOut == INVALID_HANDLE_VALUE) return;
    DWORD dwMode = 0;
    if (!GetConsoleMode(hOut, &dwMode)) return;
    dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
    SetConsoleMode(hOut, dwMode);
#endif
}

void ui_clear_screen(void) {
#ifdef _WIN32
    system("cls");
#else
    printf("\033[2J\033[H");
#endif
}

void ui_set_color_green(void) {
    printf("\033[0;32m");
}

void ui_set_color_red(void) {
    printf("\033[0;31m");
}

void ui_set_color_reset(void) {
    printf("\033[0m");
}

void ui_print_header(const char *title) {
    ui_set_color_green();
    printf("\n========================================\n");
    printf("  %s\n", title);
    printf("========================================\n");
    ui_set_color_reset();
}

unsigned int ui_show_main_menu(void) {
    ui_print_header("Bank Management System");
    printf(" 1 - Add a New Account\n");
    printf(" 2 - Update Account Balance\n");
    printf(" 3 - Delete an Account\n");
    printf(" 4 - Display All Accounts\n");
    printf(" 5 - Search Accounts\n");
    printf(" 6 - Transfer Funds\n");
    printf(" 7 - Apply Monthly Interest\n");
    printf(" 8 - Manage Loans\n");
    printf(" 9 - Show Transaction History\n");
    printf("10 - Generate Sorted Report (Balance)\n");
    printf("11 - Export Accounts to CSV\n");
    printf("12 - Export API JSON\n");
    printf("13 - Backup Database\n");
    printf("14 - Restore Database\n");
    printf("15 - Execute Plugin\n");
    printf("16 - Logout/Exit\n");
    
    printf("\nSelect an option: ");
    unsigned int choice = 0;
    char buffer[16];
    if (fgets(buffer, sizeof(buffer), stdin)) {
        sscanf(buffer, "%u", &choice);
    }
    return choice;
}
