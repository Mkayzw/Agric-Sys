// Currency toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const currencyBtns = document.querySelectorAll('.currency-btn');
    const budgetElements = document.querySelectorAll('.budget');
    const exchangeRate = 36; // USD to ZWL rate (this should be updated regularly)

    currencyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currency = btn.dataset.currency;
            
            // Update active button
            currencyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update all budget displays
            budgetElements.forEach(budget => {
                const originalAmount = parseFloat(budget.querySelector('.currency-symbol').nextSibling.textContent);
                const perDay = budget.textContent.includes('/day');
                
                if (currency === 'ZWL') {
                    budget.querySelector('.currency-symbol').textContent = 'ZWL';
                    budget.querySelector('.currency-symbol').nextSibling.textContent = 
                        Math.round(originalAmount * exchangeRate) + (perDay ? '/day' : '');
                    budget.querySelector('.original-currency').textContent = 
                        `($${originalAmount}${perDay ? '/day' : ''})`;
                } else {
                    budget.querySelector('.currency-symbol').textContent = '$';
                    budget.querySelector('.currency-symbol').nextSibling.textContent = 
                        originalAmount + (perDay ? '/day' : '');
                    budget.querySelector('.original-currency').textContent = 
                        `(ZWL ${Math.round(originalAmount * exchangeRate)}${perDay ? '/day' : ''})`;
                }
            });
        });
    });

    // Search and filter functionality
    const searchInput = document.querySelector('.search-bar input');
    const serviceFilter = document.getElementById('serviceFilter');
    const locationFilter = document.getElementById('locationFilter');
    const cropTypeFilter = document.getElementById('cropType');
    const sortBySelect = document.getElementById('sortBy');
    const jobCards = document.querySelectorAll('.job-card');

    const filterJobs = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedService = serviceFilter.value.toLowerCase();
        const selectedLocation = locationFilter.value.toLowerCase();
        const selectedCrop = cropTypeFilter.value.toLowerCase();

        jobCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.job-description').textContent.toLowerCase();
            const location = card.querySelector('.fa-map-marker-alt').parentElement.textContent.toLowerCase();
            const service = card.querySelector('.job-details').textContent.toLowerCase();

            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesService = !selectedService || service.includes(selectedService);
            const matchesLocation = !selectedLocation || location.includes(selectedLocation);
            const matchesCrop = !selectedCrop || description.includes(selectedCrop);

            if (matchesSearch && matchesService && matchesLocation && matchesCrop) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Add event listeners for search and filters
    searchInput.addEventListener('input', filterJobs);
    serviceFilter.addEventListener('change', filterJobs);
    locationFilter.addEventListener('change', filterJobs);
    cropTypeFilter.addEventListener('change', filterJobs);
    sortBySelect.addEventListener('change', () => {
        const sortBy = sortBySelect.value;
        const jobsArray = Array.from(jobCards);
        
        jobsArray.sort((a, b) => {
            if (sortBy === 'budget-high' || sortBy === 'budget-low') {
                const budgetA = parseFloat(a.querySelector('.budget').textContent.replace(/[^0-9.]/g, ''));
                const budgetB = parseFloat(b.querySelector('.budget').textContent.replace(/[^0-9.]/g, ''));
                return sortBy === 'budget-high' ? budgetB - budgetA : budgetA - budgetB;
            }
            // Add other sorting logic as needed
            return 0;
        });

        const container = document.querySelector('.jobs-container');
        jobsArray.forEach(card => container.appendChild(card));
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'fixed inset-0 bg-white z-40 transform translate-x-full transition-transform duration-300 md:hidden';
    mobileMenu.innerHTML = `
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold text-primary">AgriConnect</h1>
                <button class="text-2xl" id="closeMenu">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav class="flex flex-col space-y-4">
                <a href="/" class="nav-link">Home</a>
                <a href="/services.html" class="nav-link">Services</a>
                <a href="/post-job.html" class="nav-link">Post a Job</a>
                <a href="/find-work.html" class="nav-link">Find Work</a>
                <a href="/about.html" class="nav-link">About</a>
                <div class="pt-4 border-t border-gray-200">
                    <a href="/login.html" class="btn-secondary w-full mb-2">Login</a>
                    <a href="/register.html" class="btn-primary w-full">Sign Up</a>
                </div>
            </nav>
        </div>
    `;
    document.body.appendChild(mobileMenu);

    menuToggle?.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
    });

    document.getElementById('closeMenu')?.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('translate-x-full');
        }
    });

    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === './index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Handle auth state
    const updateAuthUI = () => {
        const isLoggedIn = AuthService?.isLoggedIn();
        document.querySelectorAll('[data-auth-show]').forEach(el => {
            el.style.display = el.dataset.authShow === (isLoggedIn ? 'logged-in' : 'logged-out') ? '' : 'none';
        });
    };

    // Update UI on load
    updateAuthUI();
}); 