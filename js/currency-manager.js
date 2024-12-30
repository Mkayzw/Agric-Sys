class CurrencyManager {
    constructor() {
        this.exchangeRate = config.CURRENCY.EXCHANGE_RATE;
        this.currentCurrency = config.CURRENCY.DEFAULT;
        this.initialize();
    }
    
    initialize() {
        const currencyBtns = document.querySelectorAll('.currency-btn');
        currencyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchCurrency(btn.dataset.currency));
        });
    }
    
    switchCurrency(newCurrency) {
        if (!config.CURRENCY.SUPPORTED.includes(newCurrency)) return;
        
        this.currentCurrency = newCurrency;
        this.updateAllAmounts();
        this.updateButtonStates();
    }
    
    updateAllAmounts() {
        document.querySelectorAll('.budget').forEach(budget => {
            this.updateAmount(budget);
        });
    }
    
    updateAmount(element) {
        const originalAmount = parseFloat(element.dataset.originalAmount || element.querySelector('.currency-symbol').nextSibling.textContent);
        const perDay = element.textContent.includes('/day');
        
        if (this.currentCurrency === 'ZWL') {
            this.displayZWL(element, originalAmount, perDay);
        } else {
            this.displayUSD(element, originalAmount, perDay);
        }
    }
    
    // ... rest of currency management methods
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.currencyManager = new CurrencyManager();
}); 