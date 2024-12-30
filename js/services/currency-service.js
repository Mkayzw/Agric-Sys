class CurrencyService {
    static async getExchangeRates() {
        try {
            const response = await fetch(`${config.API_URL}/exchange-rates`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.rates;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return { USD_ZWL: config.CURRENCY.EXCHANGE_RATE };
        }
    }

    static formatAmount(amount, fromCurrency, toCurrency) {
        const rate = config.CURRENCY.EXCHANGE_RATE;
        const value = fromCurrency === 'ZWL' ? amount / rate : amount * rate;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: toCurrency
        }).format(toCurrency === 'ZWL' ? value : amount);
    }

    static convertAmount(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        return fromCurrency === 'ZWL' 
            ? amount / config.CURRENCY.EXCHANGE_RATE 
            : amount * config.CURRENCY.EXCHANGE_RATE;
    }
}

window.CurrencyService = CurrencyService; 