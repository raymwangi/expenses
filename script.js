// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const transactionName = document.getElementById('transaction-name');
const transactionAmount = document.getElementById('transaction-amount');
const transactionDate = document.getElementById('transaction-date');
const transactionList = document.getElementById('transaction-list');
const totalGain = document.getElementById('total-gain');
const totalExpense = document.getElementById('total-expense');
const cashLeft = document.getElementById('cash-left');

// Transactions Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Save to Local Storage
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Calculate Summary
function calculateSummary() {
  const gains = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  totalGain.textContent = `$${gains.toFixed(2)}`;
  totalExpense.textContent = `$${expenses.toFixed(2)}`;
  cashLeft.textContent = `$${(gains - expenses).toFixed(2)}`;
}

// Update Transaction List
function updateTransactionList() {
  transactionList.innerHTML = '';
  transactions.forEach((transaction, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${transaction.name} - $${transaction.amount.toFixed(2)} on ${transaction.date}
      <div>
        <button onclick="editTransaction(${index})">Edit</button>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </div>
    `;
    transactionList.appendChild(li);
  });
  calculateSummary();
}

// Add Transaction
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = transactionName.value.trim();
  const amount = parseFloat(transactionAmount.value);
  const date = transactionDate.value;

  if (!name || isNaN(amount) || !date) {
    alert('Please provide valid transaction details.');
    return;
  }

  transactions.push({ name, amount, date });
  saveData('transactions', transactions);
  updateTransactionList();
  updateSpendingChart();
  transactionForm.reset();
});

// Edit Transaction
function editTransaction(index) {
  const transaction = transactions[index];
  transactionName.value = transaction.name;
  transactionAmount.value = transaction.amount;
  transactionDate.value = transaction.date;

  deleteTransaction(index);
}

// Delete Transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveData('transactions', transactions);
  updateTransactionList();
  updateSpendingChart();
}

// Chart.js Implementation
const spendingChartCanvas = document.getElementById('spending-chart').getContext('2d');
let spendingChart;

function renderSpendingChart(data) {
  if (spendingChart) spendingChart.destroy();

  const categories = data.map(t => `${t.name} (${t.date})`);
  const amounts = data.map(t => t.amount);

  spendingChart = new Chart(spendingChartCanvas, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        label: 'Transactions',
        data: amounts,
        backgroundColor: amounts.map(a => a > 0 ? '#4caf50' : '#f44336'),
        borderColor: '#333',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Amount ($)' } },
        x: { title: { display: true, text: 'Transaction' } },
      },
    },
  });
}

// Update Chart
function updateSpendingChart() {
  renderSpendingChart(transactions);
}

// Initialize
function init() {
  updateTransactionList();
  renderSpendingChart(transactions);
}

init();
