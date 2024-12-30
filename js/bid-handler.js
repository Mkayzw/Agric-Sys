function handleBidSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const jobId = form.dataset.jobId;
    
    const bidData = {
        amount: parseFloat(form.querySelector('#bidAmount').value),
        currency: form.querySelector('#bidCurrency').value,
        proposal: form.querySelector('#proposal').value,
        availabilityDate: form.querySelector('#availabilityDate').value,
        completionTime: {
            value: parseInt(form.querySelector('#completionTime').value),
            unit: form.querySelector('#timeUnit').value
        }
    };

    try {
        // Call your bidding service
        BiddingManager.submitBid(jobId, bidData);
        jobInteractions.closeBidModal();
        alert('Bid submitted successfully!');
    } catch (error) {
        alert('Error submitting bid: ' + error.message);
    }

    return false;
} 