import inquirer from "inquirer";

import  sqlite3  from "sqlite3";

import chalk from "chalk";

const db = new sqlite3.Database('loans.db' , (err) => {
    if(err) {
        // console.log(err.message);
    }

    console.log('Connected to the loans database');
});
//  create the loans table if it does not exist
db.run(`CREATE TABLE IF NOT EXISTS loans(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    months INTEGER NOT NULL
)`);

// Define the questions to prompt the user

const questions = [
    //name of the user
    {
        type : 'input',
        name : 'name',
        message : 'What is your name?',
        validate : function(value) {
            if(value.length) {
                return true;
            } else {
                return "Please enter your name";
            }
        },
    },
    // amount 
    {
        type : 'input',
        name : 'amount',
        message : 'How much is the loan amount in INR?',
        validate : function(value) {
            const isValid = /^\d+$/.test(value);
            if(isValid) {
                return true;
            } else {
                return "Please enter valid loan amount";
            }
        },
    },
    //months 
    {
        type : 'input',
        name : 'months',
        message : 'How many months you want pay back the loan?',
        validate : function(value) {
            const isValid = /^\d+$/.test(value);
            if(isValid) {
                return true;
            } else {
                return "Please enter the valid number of months";
            }
        },
    },

];

// define the main function that prompts the user
// Also to calc the loan and saves data to the database

async function createLoan() {
    console.log(chalk.yellow.italic('Wel come to the loan calculator'));

    const answers = await inquirer.prompt(questions);
    const name = answers.name;
    const amount = parseInt(answers.amount);
    const months = parseInt(answers.months);
    const interestRate = 0.035;
    const  installment  = Math.ceil((amount *((1 + interestRate) / months)));
    console.log(chalk.cyan.bold(`Your monthly installment is ${installment} INR`));

    db.run(
        'INSERT INTO loans(name , amount , months) VALUES (? , ? , ?)',
        [name , amount , months],
        function(err) {
            if(err) {
                console.log(err.message);
            }
            console.log(chalk.blue.bold(`Your loan details have been saved with ID ${this.lastID}`));
            mainMenu();
        }
    );
}

// function to view all loans

function viewAllLoans() {
    db.all('SELECT * FROM loans' , (err , rows) => {
        if(err) {
            console.log(err.message);
        }

        console.log(chalk.yellow.bold('All loans:'));

        rows.forEach((row) => {
            console.log(`ID: ${row.id} , Name: ${row.name} , Amount: ${row.amount}INR, Months: ${row.months}`);
        });
        mainMenu();
    });
}

// function to updatmainMenu();e a loan

function updateLoan() {
    inquirer.prompt([
        //Enter the id to update
        {
            input : 'input',
            name : 'id',
            message:'Enter the ID of the loan you want to update',
            validate : function(value) {
                const isValid = /^\d+$/.test(value);
                if(isValid)  return true;
                else return "Please enter valid ID number";
            },
        },

        {
            input : 'input',
            name : 'amount',
            message:'Enter the amount you wish to update',
            validate : function(value) {
                const isValid = /^\d+$/.test(value);
                if(isValid)  return true;
                else return "Please enter valid amount";
            },
        },

        {
            input : 'input',
            name : 'months',
            message:'Enter the updated number of months',
            validate : function(value) {
                const isValid = /^\d+$/.test(value);
                if(isValid)  return true;
                else return "Please enter valid number of months";
            },
        },

    ]).then((choices) => {
        const id = parseInt(choices.id);
        const amount = parseInt(choices.amount);
        const months = parseInt(choices.months);

        db.run(
            'UPDATE loans SET amount = ? , months= ? WHERE id = ?',
            [amount , months , id],
            function(err) {
                if(err){
                    console.log(err.message);
                }
                console.log(
                    chalk.yellow.bold(`Loan with ID ${id} is has been updated. Row affected: ${this.changes}`)
                );
                mainMenu();
            }
        )
    })
}

function mainMenu () {
    inquirer.prompt([
        {
            type : 'list',
            name:'choice',
            message:'What would you like to do?',
            choices: ['View All Loans' , 'Update Loan' , 'Add a new loan' , 'Exit'],

        },

    ]).then((choices) => {
        switch(choices.choice) {
            case 'View All Loans':
                viewAllLoans();
                break;
            case 'Update Loan':
                updateLoan();
                break;
            case 'Add a new loan':
                createLoan();
                break;
            case 'Exit':
                console.log(chalk.bgMagentaBright.bold('Thank you for using our software'));
                db.close();
                break;
        }
    })
}

mainMenu();