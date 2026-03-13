// Bank-account program reads a random-access file sequentially,
// updates data already written to the file, creates new data to
// be placed in the file, and deletes data previously in the file.
#include <stdio.h>
#include <stdlib.h>
// clientData structure definition
struct clientData
{
    unsigned int acctNum; // account number
    char lastName[15];    // account last name
    char firstName[10];   // account first name
    double balance;       // account balance
};                        // end structure clientData

// prototypes
unsigned int enterChoice(void);
void textFile(FILE *readPtr);
void updateRecord(FILE *fPtr, FILE *outputPtr);
void newRecord(FILE *fPtr, FILE *outputPtr);
void deleteRecord(FILE *fPtr, FILE *outputPtr);
void showTotal(FILE *readPtr, FILE *outputPtr);
void showHistory(FILE *outputPtr);

/* logging helper */
void logTransaction(const char *message);

int main(int argc, char *argv[])
{
    FILE *cfPtr;         // credit.dat file pointer
    FILE *outputPtr;     // accounts.txt file pointer for outputs
    unsigned int choice; // user's choice

    // fopen opens the file; create it if it does not exist
    cfPtr = fopen("credit.dat", "rb+");
    if (cfPtr == NULL)
    {
        // try to create the file and pre‑populate empty records
        FILE *temp = fopen("credit.dat", "wb+");
        if (temp == NULL)
        {
            printf("%s: File could not be created.\n", argv[0]);
            exit(-1);
        }
        // write 100 blank records
        struct clientData blank = {0, "", "", 0.0};
        for (int i = 0; i < 100; ++i)
            fwrite(&blank, sizeof(blank), 1, temp);
        fclose(temp);
        cfPtr = fopen("credit.dat", "rb+");
        if (cfPtr == NULL)
        {
            printf("%s: File could not be opened after creation.\n", argv[0]);
            exit(-1);
        }
    }

    // open accounts.txt for appending outputs
    outputPtr = fopen("accounts.txt", "a");
    if (outputPtr == NULL)
    {
        printf("Could not open accounts.txt for output.\n");
        exit(-1);
    }

    // enable user to specify action
    while ((choice = enterChoice()) != 7)
    {
        switch (choice)
        {
        // create text file from record file
        case 1:
            textFile(cfPtr);
            break;
        // update record
        case 2:
            updateRecord(cfPtr, outputPtr);
            break;
        // create record
        case 3:
            newRecord(cfPtr, outputPtr);
            break;
        // delete existing record
        case 4:
            deleteRecord(cfPtr, outputPtr);
            break;
        // show total amount
        case 5:
            showTotal(cfPtr, outputPtr);
            break;
        // show transaction history
        case 6:
            showHistory(outputPtr);
            break;
        // display if user does not select valid choice
        default:
            fprintf(outputPtr, "Incorrect choice\n");
            break;
        } // end switch
    }     // end while

    fclose(outputPtr); // close output file
    fclose(cfPtr); // fclose closes the file
} // end main

// create formatted text file for printing
void textFile(FILE *readPtr)
{
    FILE *writePtr; // accounts.txt file pointer
    int result;     // used to test whether fread read any bytes
    // create clientData with default information
    struct clientData client = {0, "", "", 0.0};

    // fopen opens the file; exits if file cannot be opened
    if ((writePtr = fopen("accounts.txt", "w")) == NULL)
    {
        puts("File could not be opened.");
    } // end if
    else
    {
        rewind(readPtr); // sets pointer to beginning of file
        fprintf(writePtr, "%-6s%-16s%-11s%10s\n", "Acct", "Last Name", "First Name", "Balance");

        // copy all records from random-access file into text file
        while (!feof(readPtr))
        {
            result = fread(&client, sizeof(struct clientData), 1, readPtr);

            // write single record to text file
            if (result != 0 && client.acctNum != 0)
            {
                fprintf(writePtr, "%-6d%-16s%-11s%10.2f\n", client.acctNum, client.lastName, client.firstName,
                        client.balance);
            } // end if
        }     // end while

        fclose(writePtr); // fclose closes the file
    }                     // end else
} // end function textFile

// update balance in record
void updateRecord(FILE *fPtr, FILE *outputPtr)
{
    unsigned int account; // account number
    double transaction;   // transaction amount
    // create clientData with no information
    struct clientData client = {0, "", "", 0.0};

    // obtain number of account to update
    printf("%s", "Enter account to update ( 1 - 100 ): ");
    scanf("%d", &account);

    // move file pointer to correct record in file
    fseek(fPtr, (account - 1) * sizeof(struct clientData), SEEK_SET);
    // read record from file
    fread(&client, sizeof(struct clientData), 1, fPtr);
    // display error if account does not exist
    if (client.acctNum == 0)
    {
        fprintf(outputPtr, "Account #%d has no information.\n", account);
    }
    else
    { // update record
        fprintf(outputPtr, "%-6d%-16s%-11s%10.2f\n\n", client.acctNum, client.lastName, client.firstName, client.balance);

        // request transaction amount from user
        printf("%s", "Enter charge ( + ) or payment ( - ): ");
        scanf("%lf", &transaction);
        double oldBalance = client.balance;
        client.balance += transaction; // update record balance

        fprintf(outputPtr, "%-6d%-16s%-11s%10.2f\n", client.acctNum, client.lastName, client.firstName, client.balance);

        // move file pointer to correct record in file
        // move back by 1 record length
        fseek(fPtr, -(long)sizeof(struct clientData), SEEK_CUR);
        // write updated record over old record in file
        fwrite(&client, sizeof(struct clientData), 1, fPtr);

        char msg[128];
        snprintf(msg, sizeof msg, "Account %u balance %.2f -> %.2f (txn %.2f)\n",
                 client.acctNum, oldBalance, client.balance, transaction);
        logTransaction(msg);
    } // end else
} // end function updateRecord

// delete an existing record
void deleteRecord(FILE *fPtr, FILE *outputPtr)
{
    struct clientData client;                       // stores record read from file
    struct clientData blankClient = {0, "", "", 0}; // blank client
    unsigned int accountNum;                        // account number

    // obtain number of account to delete
    printf("%s", "Enter account number to delete ( 1 - 100 ): ");
    scanf("%d", &accountNum);

    // move file pointer to correct record in file
    fseek(fPtr, (accountNum - 1) * sizeof(struct clientData), SEEK_SET);
    // read record from file
    fread(&client, sizeof(struct clientData), 1, fPtr);
    // display error if record does not exist
    if (client.acctNum == 0)
    {
        fprintf(outputPtr, "Account %d does not exist.\n", accountNum);
    } // end if
    else
    { // delete record
        // move file pointer to correct record in file
        fseek(fPtr, (accountNum - 1) * sizeof(struct clientData), SEEK_SET);
        // replace existing record with blank record
        fwrite(&blankClient, sizeof(struct clientData), 1, fPtr);
        
        char msg[128];
        snprintf(msg, sizeof msg, "Deleted account %u\n", accountNum);
        logTransaction(msg);
    } // end else
} // end function deleteRecord

// create and insert record
void newRecord(FILE *fPtr, FILE *outputPtr)
{
    // create clientData with default information
    struct clientData client = {0, "", "", 0.0};
    unsigned int accountNum; // account number

    // obtain number of account to create
    printf("%s", "Enter new account number ( 1 - 100 ): ");
    scanf("%d", &accountNum);

    // move file pointer to correct record in file
    fseek(fPtr, (accountNum - 1) * sizeof(struct clientData), SEEK_SET);
    // read record from file
    fread(&client, sizeof(struct clientData), 1, fPtr);
    // display error if account already exists
    if (client.acctNum != 0)
    {
        fprintf(outputPtr, "Account #%d already contains information.\n", client.acctNum);
    } // end if
    else
    { // create record
        // user enters last name, first name and balance
        printf("%s", "Enter lastname, firstname, balance\n? ");
        scanf("%14s%9s%lf", client.lastName, client.firstName, &client.balance);

        client.acctNum = accountNum;
        // move file pointer to correct record in file
        fseek(fPtr, (client.acctNum - 1) * sizeof(struct clientData), SEEK_SET);
        // insert record in file
        fwrite(&client, sizeof(struct clientData), 1, fPtr);

        char msg[128];
        snprintf(msg, sizeof msg, "New account %u: %s %s balance %.2f\n",
                 client.acctNum, client.lastName, client.firstName, client.balance);
        logTransaction(msg);
    } // end else
} // end function newRecord

// sum balances and print result
void showTotal(FILE *readPtr, FILE *outputPtr)
{
    struct clientData client = {0, "", "", 0.0};
    double total = 0.0;
    rewind(readPtr);

    while (fread(&client, sizeof(struct clientData), 1, readPtr) == 1)
    {
        if (client.acctNum != 0)
            total += client.balance;
    }

    fprintf(outputPtr, "\nTotal of all account balances: %.2f\n", total);
}

// display transaction history log
void showHistory(FILE *outputPtr)
{
    FILE *log = fopen("trans.log", "r");
    char buffer[256];

    if (log == NULL)
    {
        fprintf(outputPtr, "No transaction history available.\n");
        return;
    }

    fprintf(outputPtr, "\n--- Transaction History ---\n");
    while (fgets(buffer, sizeof buffer, log))
        fputs(buffer, outputPtr);
    fclose(log);
    fprintf(outputPtr, "--- end ---\n");
}

// append message to log file
void logTransaction(const char *message)
{
    FILE *log = fopen("trans.log", "a");
    if (log != NULL)
    {
        fputs(message, log);
        fclose(log);
    }
}

// enable user to input menu choice
unsigned int enterChoice(void)
{
    unsigned int menuChoice; // variable to store user's choice
    // display available options
    printf("%s", "\nEnter your choice\n"
                 "1 - store a formatted text file of accounts called\n"
                 "    \"accounts.txt\" for printing\n"
                 "2 - update an account\n"
                 "3 - add a new account\n"
                 "4 - delete an account\n"
                 "5 - end program\n? ");

    scanf("%u", &menuChoice); // receive choice from user
    return menuChoice;
} // end function enterChoice