#include "plugin.h"
#include <stdio.h>

// Mock implementation of a plugin system. 
// In a real C application, this would use LoadLibrary or dlopen to load .dll / .so files.

typedef struct {
    int id;
    const char *name;
    void (*execute)(void);
} Plugin;

static void plugin_mock_credit_card(void) {
    printf("[Plugin Execution] Credit Card module running...\n");
    printf("Fetching credit limits...\n");
    printf("Credit Card module executed successfully.\n");
}

static Plugin plugins[] = {
    {1, "Credit Card Services", plugin_mock_credit_card}
};
static int pluginCount = 1;

void plugin_load_all(void) {
    printf("Loading %d plugins...\n", pluginCount);
    for (int i = 0; i < pluginCount; i++) {
        printf("Loaded plugin: %s\n", plugins[i].name);
    }
}

void plugin_show_menu(void) {
    printf("\n--- Available Plugins ---\n");
    for (int i = 0; i < pluginCount; i++) {
        printf("%d - %s\n", plugins[i].id, plugins[i].name);
    }
}

void plugin_execute(int id) {
    for (int i = 0; i < pluginCount; i++) {
        if (plugins[i].id == id) {
            plugins[i].execute();
            return;
        }
    }
    printf("Plugin ID not found.\n");
}
