#include "api.h"
#include "storage.h"
#include <stdio.h>

void api_export_json(void) {
    FILE *f = fopen("api_export.json", "w");
    if (!f) return;
    
    fprintf(f, "{\n  \"accounts\": [\n");
    bool first = true;
    
    for (int i = 1; i <= MAX_RECORDS; i++) {
        Account acc;
        if (storage_read_account(i, &acc) && acc.acctNum != 0) {
            if (!first) {
                fprintf(f, ",\n");
            }
            fprintf(f, "    {\n");
            fprintf(f, "      \"acctNum\": %d,\n", acc.acctNum);
            fprintf(f, "      \"name\": \"%s %s\",\n", acc.firstName, acc.lastName);
            fprintf(f, "      \"balance\": %.2f,\n", acc.balance);
            fprintf(f, "      \"type\": %d,\n", acc.type);
            fprintf(f, "      \"branchId\": %d\n", acc.branchId);
            fprintf(f, "    }");
            first = false;
        }
    }
    fprintf(f, "\n  ]\n}\n");
    fclose(f);
    printf("JSON API payload exported to api_export.json\n");
}
