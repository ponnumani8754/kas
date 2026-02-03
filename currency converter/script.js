// DOM Elements
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const swapBtn = document.getElementById('swap');
const convertBtn = document.getElementById('convert');
const resultDiv = document.getElementById('result');
const resultAmount = document.querySelector('.result-amount');
const resultText = document.querySelector('.result-text');
const exchangeRate = document.querySelector('.exchange-rate');
const historyList = document.getElementById('history');
const clearHistoryBtn = document.getElementById('clearHistory');

// API Configuration
const API_KEY = 'your_api_key_here'; // Get free API key from exchangerate-api.com
const API_URL = `https://api.exchangerate-api.com/v4/latest/`;

// Load history from localStorage
let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryDisplay();
    // Convert on page load with default values
    convertCurrency();
});

// Convert Currency Function
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        // Show loading
        resultAmount.textContent = 'Loading...';
        resultDiv.classList.add('show');

        // Fetch exchange rates
        const response = await fetch(`${API_URL}${fromCurrency}`);
        const data = await response.json();
        
        if (!data.rates || !data.rates[toCurrency]) {
            throw new Error('Invalid currency code');
        }

        const rate = data.rates[toCurrency];
        const convertedAmount = (amount * rate).toFixed(2);

        // Update UI
        resultAmount.textContent = `${convertedAmount} ${toCurrency}`;
        resultText.textContent = `${amount} ${fromCurrency} =`;
        exchangeRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        resultDiv.classList.add('show');

        // Add to history
        addToHistory(amount, fromCurrency, convertedAmount, toCurrency, rate);

    } catch (error) {
        console.error('Error converting currency:', error);
        resultAmount.textContent = 'Error';
        resultText.textContent = 'Failed to convert currency';
        exchangeRate.textContent = 'Please check your connection and try again';
    }
}

// Swap Currencies
swapBtn.addEventListener('click', function() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    convertCurrency();
});

// Convert Button Click
convertBtn.addEventListener('click', convertCurrency);

// Convert when amount changes
amountInput.addEventListener('input', convertCurrency);

// Convert when currency selection changes
fromSelect.addEventListener('change', convertCurrency);
toSelect.addEventListener('change', convertCurrency);

// Add to History
function addToHistory(amount, from, convertedAmount, to, rate) {
    const historyItem = {
        id: Date.now(),
        amount,
        from,
        convertedAmount,
        to,
        rate,
        timestamp: new Date().toLocaleString()
    };

    conversionHistory.unshift(historyItem);
    
    // Keep only last 10 items
    if (conversionHistory.length > 10) {
        conversionHistory = conversionHistory.slice(0, 10);
    }

    // Save to localStorage and update display
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
    updateHistoryDisplay();
}

// Update History Display
function updateHistoryDisplay() {
    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<div class="history-item">No conversion history yet</div>';
        return;
    }

    historyList.innerHTML = conversionHistory.map(item => `
        <div class="history-item">
            <div>
                <strong>${item.amount} ${item.from}</strong> → 
                <strong>${item.convertedAmount} ${item.to}</strong>
            </div>
            <div style="color: #666; font-size: 0.8rem;">
                ${item.timestamp}
            </div>
        </div>
    `).join('');
}

// Clear History
clearHistoryBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all history?')) {
        conversionHistory = [];
        localStorage.removeItem('conversionHistory');
        updateHistoryDisplay();
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        convertCurrency();
    }
    if (e.key === 'Escape') {
        amountInput.value = '1';
        convertCurrency();
    }
});