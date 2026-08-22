// ================= BANK MANAGEMENT SYSTEM =================

// Store accounts and transactions
let accounts = JSON.parse(localStorage.getItem("bankAccounts")) || [];
let transactions = JSON.parse(localStorage.getItem("bankTransactions")) || [];


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", function () {

    updateDashboard();
    displayAccounts();
    displayTransactions();

    document
        .getElementById("accountForm")
        .addEventListener("submit", createAccount);

    document
        .getElementById("transactionForm")
        .addEventListener("submit", processTransaction);

    document
        .getElementById("searchAccount")
        .addEventListener("input", searchAccounts);

});


// ================= SAVE DATA =================

function saveData() {

    localStorage.setItem(
        "bankAccounts",
        JSON.stringify(accounts)
    );

    localStorage.setItem(
        "bankTransactions",
        JSON.stringify(transactions)
    );
}


// ================= CREATE ACCOUNT =================

function createAccount(event) {

    event.preventDefault();

    const name =
        document.getElementById("customerName").value.trim();

    const cnic =
        document.getElementById("cnic").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const type =
        document.getElementById("accountType").value;

    const initialDeposit =
        Number(document.getElementById("initialDeposit").value);


    if (initialDeposit < 0) {

        alert("Initial deposit cannot be negative.");

        return;
    }


    // Generate account number
    const accountNumber =
        "SB" +
        String(1001 + accounts.length).padStart(4, "0");


    const account = {

        accountNumber: accountNumber,

        name: name,

        cnic: cnic,

        phone: phone,

        email: email,

        type: type,

        balance: initialDeposit,

        status: "Active",

        createdAt: new Date().toLocaleDateString()

    };


    accounts.push(account);


    // Add initial deposit transaction
    if (initialDeposit > 0) {

        transactions.push({

            date: new Date().toLocaleString(),

            accountNumber: accountNumber,

            customer: name,

            type: "Deposit",

            amount: initialDeposit,

            balance: initialDeposit

        });

    }


    saveData();

    updateDashboard();

    displayAccounts();

    displayTransactions();


    document.getElementById("accountForm").reset();


    alert(
        "Account created successfully!\n\n" +
        "Account Number: " +
        accountNumber
    );


    scrollToAccounts();
}


// ================= DASHBOARD =================

function updateDashboard() {

    const totalAccounts =
        accounts.length;


    const totalBalance =
        accounts.reduce(
            (total, account) =>
                total + Number(account.balance),
            0
        );


    const totalDeposits =
        transactions
            .filter(transaction => transaction.type === "Deposit")
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount),
                0
            );


    const totalWithdrawals =
        transactions
            .filter(transaction => transaction.type === "Withdraw")
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount),
                0
            );


    document.getElementById("totalAccounts").textContent =
        totalAccounts;


    document.getElementById("totalBalance").textContent =
        formatMoney(totalBalance);


    document.getElementById("totalDeposits").textContent =
        formatMoney(totalDeposits);


    document.getElementById("totalWithdrawals").textContent =
        formatMoney(totalWithdrawals);
}


// ================= DISPLAY ACCOUNTS =================

function displayAccounts(list = accounts) {

    const table =
        document.getElementById("accountsTable");


    table.innerHTML = "";


    if (list.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:30px;">
                    No accounts found.
                </td>
            </tr>
        `;

        return;
    }


    list.forEach(account => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${escapeHTML(account.accountNumber)}</strong>
            </td>

            <td>
                ${escapeHTML(account.name)}
            </td>

            <td>
                ${escapeHTML(account.type)}
            </td>

            <td>
                ${escapeHTML(account.phone)}
            </td>

            <td>
                <strong>
                    Rs. ${formatMoney(account.balance)}
                </strong>
            </td>

            <td>
                <span class="status">
                    ${escapeHTML(account.status)}
                </span>
            </td>

            <td>

                <button
                    class="table-btn deposit-btn"
                    onclick="openTransaction('deposit', '${account.accountNumber}')">

                    <i class="fa-solid fa-plus"></i>
                    Deposit

                </button>


                <button
                    class="table-btn withdraw-btn"
                    onclick="openTransaction('withdraw', '${account.accountNumber}')">

                    <i class="fa-solid fa-minus"></i>
                    Withdraw

                </button>


                <button
                    class="table-btn delete-btn"
                    onclick="deleteAccount('${account.accountNumber}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>
        `;


        table.appendChild(row);

    });
}


// ================= SEARCH ACCOUNTS =================

function searchAccounts() {

    const searchValue =
        document
            .getElementById("searchAccount")
            .value
            .toLowerCase()
            .trim();


    const filtered =
        accounts.filter(account =>

            account.accountNumber
                .toLowerCase()
                .includes(searchValue)

            ||

            account.name
                .toLowerCase()
                .includes(searchValue)

            ||

            account.phone
                .toLowerCase()
                .includes(searchValue)

            ||

            account.type
                .toLowerCase()
                .includes(searchValue)

        );


    displayAccounts(filtered);
}


// ================= TRANSACTION MODAL =================

function openTransaction(type, accountNumber = "") {

    const modal =
        document.getElementById("transactionModal");


    const title =
        document.getElementById("modalTitle");


    const transactionType =
        document.getElementById("transactionType");


    const accountInput =
        document.getElementById("transactionAccount");


    transactionType.value = type;


    if (type === "deposit") {

        title.textContent =
            "Deposit Money";

    } else {

        title.textContent =
            "Withdraw Money";
    }


    accountInput.value =
        accountNumber;


    document
        .getElementById("transactionAmount")
        .value = "";


    modal.classList.add("show");


    accountInput.focus();
}


// ================= CLOSE MODAL =================

function closeModal() {

    document
        .getElementById("transactionModal")
        .classList.remove("show");
}


// ================= PROCESS TRANSACTION =================

function processTransaction(event) {

    event.preventDefault();


    const type =
        document.getElementById("transactionType").value;


    const accountNumber =
        document
            .getElementById("transactionAccount")
            .value
            .trim()
            .toUpperCase();


    const amount =
        Number(
            document.getElementById("transactionAmount").value
        );


    if (amount <= 0) {

        alert("Please enter a valid amount.");

        return;
    }


    const account =
        accounts.find(
            item =>
                item.accountNumber === accountNumber
        );


    if (!account) {

        alert("Account not found.");

        return;
    }


    // ================= DEPOSIT =================

    if (type === "deposit") {

        account.balance += amount;


        transactions.push({

            date: new Date().toLocaleString(),

            accountNumber:
                account.accountNumber,

            customer:
                account.name,

            type: "Deposit",

            amount: amount,

            balance:
                account.balance

        });


        alert(
            "Deposit successful!\n\n" +
            "Amount: Rs. " +
            formatMoney(amount)
        );

    }


    // ================= WITHDRAW =================

    else {

        if (amount > account.balance) {

            alert(
                "Insufficient balance!\n\n" +
                "Available Balance: Rs. " +
                formatMoney(account.balance)
            );

            return;
        }


        account.balance -= amount;


        transactions.push({

            date: new Date().toLocaleString(),

            accountNumber:
                account.accountNumber,

            customer:
                account.name,

            type: "Withdraw",

            amount: amount,

            balance:
                account.balance

        });


        alert(
            "Withdrawal successful!\n\n" +
            "Amount: Rs. " +
            formatMoney(amount)
        );
    }


    saveData();

    updateDashboard();

    displayAccounts();

    displayTransactions();

    closeModal();
}


// ================= TRANSACTIONS TABLE =================

function displayTransactions() {

    const table =
        document.getElementById("transactionsTable");


    table.innerHTML = "";


    if (transactions.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:30px;">
                    No transactions yet.
                </td>
            </tr>
        `;

        return;
    }


    // Latest transaction first
    const sortedTransactions =
        [...transactions].reverse();


    sortedTransactions.forEach(transaction => {

        const row =
            document.createElement("tr");


        const typeClass =
            transaction.type === "Deposit"
                ? "transaction-deposit"
                : "transaction-withdraw";


        const symbol =
            transaction.type === "Deposit"
                ? "+"
                : "-";


        row.innerHTML = `

            <td>
                ${escapeHTML(transaction.date)}
            </td>

            <td>
                <strong>
                    ${escapeHTML(transaction.accountNumber)}
                </strong>
            </td>

            <td>
                ${escapeHTML(transaction.customer)}
            </td>

            <td>
                <span class="${typeClass}">
                    ${escapeHTML(transaction.type)}
                </span>
            </td>

            <td>
                <strong class="${typeClass}">
                    ${symbol} Rs.
                    ${formatMoney(transaction.amount)}
                </strong>
            </td>

            <td>
                Rs.
                ${formatMoney(transaction.balance)}
            </td>

        `;


        table.appendChild(row);

    });
}


// ================= DELETE ACCOUNT =================

function deleteAccount(accountNumber) {

    const account =
        accounts.find(
            item =>
                item.accountNumber === accountNumber
        );


    if (!account) {

        return;
    }


    const confirmation =
        confirm(
            "Are you sure you want to delete the account of " +
            account.name +
            "?"
        );


    if (!confirmation) {

        return;
    }


    accounts =
        accounts.filter(
            item =>
                item.accountNumber !== accountNumber
        );


    saveData();

    updateDashboard();

    displayAccounts();

    alert("Account deleted successfully.");
}


// ================= SIDEBAR =================

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");
}


// ================= SCROLL FUNCTIONS =================

function scrollToCreateAccount() {

    document
        .getElementById("create-account")
        .scrollIntoView({
            behavior: "smooth"
        });
}


function scrollToAccounts() {

    document
        .getElementById("accounts")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ================= MONEY FORMAT =================

function formatMoney(amount) {

    return Number(amount).toLocaleString("en-PK", {
        maximumFractionDigits: 2
    });
}


// ================= HTML SECURITY =================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ================= CLOSE MODAL ON OUTSIDE CLICK =================

document.addEventListener("click", function (event) {

    const modal =
        document.getElementById("transactionModal");


    if (event.target === modal) {

        closeModal();
    }

});


// ================= NAVIGATION ACTIVE STATE =================

const navLinks =
    document.querySelectorAll(".nav-link");


navLinks.forEach(link => {

    link.addEventListener("click", function () {

        navLinks.forEach(item =>
            item.classList.remove("active")
        );

        this.classList.add("active");


        // Close mobile sidebar
        document
            .querySelector(".sidebar")
            .classList.remove("open");

    });

});