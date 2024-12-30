// State management for filters
const filterState = {
    search: '',
    service: '',
    sortBy: 'recent',
    page: 1,
    perPage: 12
};

// Function to update URL with current filters
function updateURL() {
    const params = new URLSearchParams();
    Object.entries(filterState).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

// Function to load filters from URL
function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    Object.keys(filterState).forEach(key => {
        const value = params.get(key);
        if (value) filterState[key] = value;
    });
    
    // Update UI to match filter state
    const searchInput = document.getElementById('searchInput');
    const serviceFilter = document.getElementById('serviceFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) searchInput.value = filterState.search;
    if (serviceFilter) serviceFilter.value = filterState.service;
    if (sortBy) sortBy.value = filterState.sortBy;
}

// Debounced search function
const debouncedSearch = debounce(() => {
    filterState.page = 1; // Reset to first page on new search
    loadJobs();
}, 300);

// Function to load and display jobs
async function loadJobs() {
    const jobsList = document.getElementById('jobsList');
    const template = document.getElementById('jobCardTemplate');
    
    if (!jobsList || !template) {
        console.error('Required elements not found');
        return;
    }

    try {
        // Show loading state
        showLoadingState(jobsList);
        
        // Update URL with current filters
        updateURL();
        
        // Fetch jobs with filters
        const jobs = await JobService.getJobs({
            search: filterState.search,
            serviceType: filterState.service,
            sortBy: filterState.sortBy,
            page: filterState.page,
            perPage: filterState.perPage
        });
        
        // Clear loading state
        jobsList.innerHTML = '';
        
        if (!jobs || jobs.length === 0) {
            showEmptyState(jobsList);
            return;
        }

        // Populate jobs
        jobs.forEach(job => {
            const card = createJobCard(job, template);
            jobsList.appendChild(card);
        });

        // Add load more button if needed
        if (jobs.length === filterState.perPage) {
            addLoadMoreButton(jobsList);
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        showErrorState(jobsList, error);
    }
}

// Helper function to show loading state
function showLoadingState(container) {
    const loadingTemplate = document.getElementById('jobLoadingTemplate');
    if (!loadingTemplate) return;

    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        container.appendChild(loadingTemplate.content.cloneNode(true));
    }
}

// Helper function to show empty state
function showEmptyState(container) {
    const noJobsTemplate = document.getElementById('noJobsTemplate');
    if (!noJobsTemplate) return;

    container.innerHTML = '';
    container.appendChild(noJobsTemplate.content.cloneNode(true));
}

// Helper function to show error state
function showErrorState(container, error) {
    const errorTemplate = document.getElementById('errorTemplate');
    if (!errorTemplate) return;

    const errorElement = errorTemplate.content.cloneNode(true);
    const errorMessage = errorElement.querySelector('p');
    if (errorMessage) {
        errorMessage.textContent = error.message || 'Failed to load jobs. Please try again later.';
    }

    container.innerHTML = '';
    container.appendChild(errorElement);
}

// Helper function to create job card
function createJobCard(job, template) {
    const card = template.content.cloneNode(true);
    const jobCard = card.querySelector('.job-card');
    
    // Set job ID
    jobCard.dataset.jobId = job._id;
    
    // Safely set text content
    const safeSetText = (selector, value) => {
        const element = jobCard.querySelector(selector);
        if (element) element.textContent = value;
    };

    // Set job details with XSS prevention
    safeSetText('.job-title', job.title);
    safeSetText('.service-type', job.serviceType);
    safeSetText('.job-budget', `${job.budget.currency} ${job.budget.amount}`);
    safeSetText('.job-date', `Posted ${new Date(job.createdAt).toLocaleDateString()}`);
    safeSetText('.job-description', job.description);
    safeSetText('.pickup-location', job.pickupLocation);
    safeSetText('.delivery-location', job.deliveryLocation);
    safeSetText('.start-date', new Date(job.startDate).toLocaleDateString());

    return jobCard;
}

// Helper function to add load more button
function addLoadMoreButton(container) {
    const button = document.createElement('button');
    button.className = 'btn-secondary w-full mt-6';
    button.textContent = 'Load More';
    button.onclick = () => {
        filterState.page++;
        loadJobs();
    };
    container.appendChild(button);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load filters from URL
    loadFiltersFromURL();
    
    // Load initial jobs
    loadJobs();

    // Set up search and filter handlers
    const searchInput = document.getElementById('searchInput');
    const serviceFilter = document.getElementById('serviceFilter');
    const sortBy = document.getElementById('sortBy');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value;
            debouncedSearch();
        });
    }

    if (serviceFilter) {
        serviceFilter.addEventListener('change', (e) => {
            filterState.service = e.target.value;
            filterState.page = 1; // Reset to first page
            loadJobs();
        });
    }

    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            filterState.sortBy = e.target.value;
            filterState.page = 1; // Reset to first page
            loadJobs();
        });
    }
}); 