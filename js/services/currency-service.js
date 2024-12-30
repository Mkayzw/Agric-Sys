class CurrencyService {
    constructor() {
        this.rates = {
            USD: 1,
            ZWL: 36.5 // Example rate, should be fetched from an API
        };
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
    }

    async updateRates() {
        try {
            const response = await fetch(this.baseUrl);
            const data = await response.json();
            this.rates = data.rates;
        } catch (error) {
            console.error('Error updating currency rates:', error);
        }
    }

    convert(amount, fromCurrency, toCurrency) {
        const normalizedAmount = amount / this.rates[fromCurrency];
        return normalizedAmount * this.rates[toCurrency];
    }

    formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

window.CurrencyService = new CurrencyService(); 