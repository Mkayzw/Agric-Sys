document.addEventListener('DOMContentLoaded', async () => {
    await CurrencyService.updateRates();

    const currencyButtons = document.querySelectorAll('[data-currency]');
    const amounts = document.querySelectorAll('.job-amount');

    currencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetCurrency = button.dataset.currency;
            
            amounts.forEach(amount => {
                const originalAmount = parseFloat(amount.dataset.amount);
                const originalCurrency = amount.dataset.currency;
                
                const convertedAmount = CurrencyService.convert(
                    originalAmount,
                    originalCurrency,
                    targetCurrency
                );
                
                amount.textContent = CurrencyService.formatCurrency(convertedAmount, targetCurrency);
            });
        });
    });
}); 