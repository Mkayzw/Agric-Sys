<<<<<<< HEAD
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'fixed top-16 left-0 w-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out translate-y-[-100%] md:hidden';
    document.body.appendChild(mobileMenu);

    // Clone navigation links for mobile menu
    const navLinks = document.querySelector('.hidden.md\\:flex.space-x-8').cloneNode(true);
    navLinks.className = 'flex flex-col space-y-4 p-4';
    mobileMenu.appendChild(navLinks);

    let isMenuOpen = false;

    menuToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        mobileMenu.style.transform = isMenuOpen ? 'translateY(0)' : 'translateY(-100%)';
        menuToggle.innerHTML = isMenuOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            isMenuOpen = false;
            mobileMenu.style.transform = 'translateY(-100%)';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Handle navigation
    document.querySelectorAll('a[href^="/"], button[onclick^="window.location"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || link.getAttribute('onclick')?.match(/href='([^']+)'/)?.[1];
            if (href && !href.startsWith('#')) {
                e.preventDefault();
                window.location.href = href;
            }
        });
    });
});

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
});

// Bid Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bidModal');
    const closeBtn = document.querySelector('.close-modal');
    const submitBtns = document.querySelectorAll('.job-card .primary-btn');
    const bidForm = document.getElementById('bidForm');
    let currentJobCard = null;

    // Open modal when Submit Bid is clicked
    submitBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentJobCard = btn.closest('.job-card');
            
            // Pre-fill some form fields based on the job
            const jobTitle = currentJobCard.querySelector('h3').textContent;
            const budget = currentJobCard.querySelector('.budget').textContent;
            const startDate = currentJobCard.querySelector('.fa-calendar').parentElement.textContent;
            
            // Set modal title
            document.querySelector('.modal-header h2').textContent = `Submit Bid for ${jobTitle}`;
            
            // Set minimum date to job's start date or today
            const dateInput = document.getElementById('availabilityDate');
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close modal functions
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        bidForm.reset();
    };

    closeBtn.addEventListener('click', closeModal);
    window.closeBidModal = closeModal; // Make it available for the Cancel button

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle currency conversion in bid form
    const bidAmount = document.getElementById('bidAmount');
    const bidCurrency = document.getElementById('bidCurrency');
    const exchangeRate = 36; // USD to ZWL rate

    bidCurrency.addEventListener('change', () => {
        if (!bidAmount.value) return;
        
        const amount = parseFloat(bidAmount.value);
        if (bidCurrency.value === 'ZWL') {
            bidAmount.value = (amount * exchangeRate).toFixed(2);
        } else {
            bidAmount.value = (amount / exchangeRate).toFixed(2);
        }
    });

    // Form submission
    bidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateBidForm(bidForm)) {
            // Collect form data
            const formData = {
                jobTitle: currentJobCard.querySelector('h3').textContent,
                amount: bidAmount.value,
                currency: bidCurrency.value,
                bidType: document.getElementById('bidType').value,
                availabilityDate: document.getElementById('availabilityDate').value,
                completionTime: document.getElementById('completionTime').value,
                timeUnit: document.getElementById('timeUnit').value,
                proposal: document.getElementById('proposal').value,
                requirements: Array.from(document.querySelectorAll('input[name="requirements"]:checked'))
                    .map(checkbox => checkbox.value)
            };

            // Here you would typically send this data to your backend
            console.log('Bid submitted:', formData);
            
            // Show success message
            alert('Your bid has been submitted successfully!');
            closeModal();
        }
    });

    // Validate bid form
    const validateBidForm = (form) => {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        // Additional validation rules can be added here
        const amount = parseFloat(bidAmount.value);
        if (isNaN(amount) || amount <= 0) {
            bidAmount.classList.add('error');
            isValid = false;
        }

        return isValid;
    };

    // Preview functionality
    const previewBtn = document.getElementById('previewBtn');
    const backToEditBtn = document.getElementById('backToEditBtn');
    const step1Content = document.getElementById('step1');
    const step2Content = document.getElementById('step2');
    const steps = document.querySelectorAll('.step');

    const updateStepIndicators = (currentStep) => {
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const updatePreview = () => {
        // Job details
        const jobTitle = currentJobCard.querySelector('h3').textContent;
        const location = currentJobCard.querySelector('.fa-map-marker-alt').parentElement.textContent;
        document.getElementById('previewJobTitle').textContent = jobTitle;
        document.getElementById('previewLocation').textContent = location;

        // Bid details
        const amount = document.getElementById('bidAmount').value;
        const currency = document.getElementById('bidCurrency').value;
        const bidType = document.getElementById('bidType').value;
        const availabilityDate = document.getElementById('availabilityDate').value;
        const completionTime = document.getElementById('completionTime').value;
        const timeUnit = document.getElementById('timeUnit').value;
        const proposal = document.getElementById('proposal').value;

        document.getElementById('previewAmount').textContent = 
            `${currency} ${amount} ${bidType !== 'fixed' ? `per ${bidType.split('-')[1]}` : ''}`;
        document.getElementById('previewDate').textContent = formatDate(availabilityDate);
        document.getElementById('previewTime').textContent = `${completionTime} ${timeUnit}`;
        document.getElementById('previewProposal').textContent = proposal;

        // Requirements
        const requirementsList = document.getElementById('previewRequirements');
        requirementsList.innerHTML = '';
        document.querySelectorAll('input[name="requirements"]:checked').forEach(checkbox => {
            const li = document.createElement('li');
            li.textContent = checkbox.parentElement.textContent.trim();
            requirementsList.appendChild(li);
        });
    };

    previewBtn.addEventListener('click', () => {
        if (validateBidForm(bidForm)) {
            updatePreview();
            step1Content.style.display = 'none';
            step2Content.style.display = 'block';
            updateStepIndicators(2);
        }
    });

    backToEditBtn.addEventListener('click', () => {
        step2Content.style.display = 'none';
        step1Content.style.display = 'block';
        updateStepIndicators(1);
    });

    // Update form submission to include preview step
    bidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            jobTitle: currentJobCard.querySelector('h3').textContent,
            amount: bidAmount.value,
            currency: bidCurrency.value,
            bidType: document.getElementById('bidType').value,
            availabilityDate: document.getElementById('availabilityDate').value,
            completionTime: document.getElementById('completionTime').value,
            timeUnit: document.getElementById('timeUnit').value,
            proposal: document.getElementById('proposal').value,
            requirements: Array.from(document.querySelectorAll('input[name="requirements"]:checked'))
                .map(checkbox => checkbox.value)
        };

        // Here you would typically send this data to your backend
        console.log('Bid submitted:', formData);
        
        // Show success message
        alert('Your bid has been submitted successfully!');
        closeModal();
    });
});

// Chat Functionality
const chatInterface = document.getElementById('chatInterface');
const chatMessages = document.getElementById('chatMessages');
const minimizeBtn = document.querySelector('.minimize-chat');
const closeBtn = document.querySelector('.close-chat');
const sendBtn = document.querySelector('.send-message');
const chatInput = document.querySelector('.chat-input textarea');
let currentChatId = null;

// Sample messages for demo
const sampleMessages = {
    'job123': [
        { text: 'Hi, I\'m interested in your transportation job', type: 'sent', time: '10:30 AM' },
        { text: 'Great! Do you have experience with grain transportation?', type: 'received', time: '10:32 AM' },
        { text: 'Yes, I\'ve been transporting grain for 5 years', type: 'sent', time: '10:33 AM' }
    ]
};

window.openChat = (jobId) => {
    currentChatId = jobId;
    chatInterface.style.display = 'flex';
    loadMessages(jobId);
};

const loadMessages = (jobId) => {
    chatMessages.innerHTML = '';
    const messages = sampleMessages[jobId] || [];
    messages.forEach(addMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const addMessage = (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.innerHTML = `
        <div class="message-content">${message.text}</div>
        <div class="message-time">${message.time}</div>
    `;
    chatMessages.appendChild(messageDiv);
};

minimizeBtn.addEventListener('click', () => {
    chatInterface.classList.toggle('minimized');
});

closeBtn.addEventListener('click', () => {
    chatInterface.style.display = 'none';
    currentChatId = null;
});

sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text && currentChatId) {
        const message = {
            text,
            type: 'sent',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        if (!sampleMessages[currentChatId]) {
            sampleMessages[currentChatId] = [];
        }
        sampleMessages[currentChatId].push(message);
        addMessage(message);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

// Rating System
const ratingModal = document.getElementById('ratingModal');
const ratingForm = document.getElementById('ratingForm');
const stars = document.querySelectorAll('.stars i');
const ratingValue = document.querySelector('.rating-value');
let currentRating = 0;

window.openRatingModal = (jobId) => {
    ratingModal.style.display = 'block';
};

window.closeRatingModal = () => {
    ratingModal.style.display = 'none';
    resetRating();
};

const resetRating = () => {
    currentRating = 0;
    ratingValue.textContent = '0/5';
    stars.forEach(star => star.classList.remove('active'));
    ratingForm.reset();
};

stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        const category = star.dataset.category;
        
        if (category) {
            // Handle category-specific rating
            const categoryStars = document.querySelectorAll(`.stars i[data-category="${category}"]`);
            categoryStars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
            });
        } else {
            // Handle main rating
            currentRating = rating;
            ratingValue.textContent = `${rating}/5`;
            stars.forEach(s => {
                if (!s.dataset.category) {
                    s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
                }
            });
        }
    });
});

ratingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }

    const formData = {
        rating: currentRating,
        title: document.getElementById('reviewTitle').value,
        review: document.getElementById('reviewText').value,
        categories: {
            communication: getRatingForCategory('communication'),
            reliability: getRatingForCategory('reliability'),
            quality: getRatingForCategory('quality')
        }
    };

    // Here you would typically send this data to your backend
    console.log('Review submitted:', formData);
    
    alert('Thank you for your review!');
    closeRatingModal();
});

const getRatingForCategory = (category) => {
    const stars = document.querySelectorAll(`.stars i[data-category="${category}"].active`);
    return stars.length;
};

// File Sharing
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const maxFileSize = 5 * 1024 * 1024; // 5MB
const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
];

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    filePreview.innerHTML = '';
    
    files.forEach(file => {
        if (file.size > maxFileSize) {
            alert(`File ${file.name} is too large. Maximum size is 5MB.`);
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert(`File type ${file.type} is not allowed.`);
            return;
        }

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const icon = document.createElement('i');
        icon.className = getFileIcon(file.type);
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        `;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => fileItem.remove();
        
        fileItem.appendChild(icon);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        filePreview.appendChild(fileItem);
    });
    
    if (filePreview.children.length > 0) {
        filePreview.style.display = 'block';
    }
});

function getFileIcon(type) {
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word')) return 'fas fa-file-word';
    if (type.includes('image')) return 'fas fa-file-image';
    return 'fas fa-file';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Message History
const messageHistoryModal = document.getElementById('messageHistoryModal');
const chatList = document.getElementById('chatList');
const messageHistory = document.getElementById('messageHistory');
let selectedChat = null;

// Sample chat history data
const chatHistory = {
    'job123': {
        title: 'Maize Transportation Job',
        partner: 'John Farmer',
        messages: [
            { text: 'Hi, I\'m interested in your transportation job', type: 'sent', time: '10:30 AM', date: '2024-01-29' },
            { text: 'Great! Do you have experience with grain transportation?', type: 'received', time: '10:32 AM', date: '2024-01-29' },
            { text: 'Yes, I\'ve been transporting grain for 5 years', type: 'sent', time: '10:33 AM', date: '2024-01-29' }
        ]
    },
    'job456': {
        title: 'Cotton Harvesting Job',
        partner: 'Sarah Smith',
        messages: [
            { text: 'Hello, I saw your cotton harvesting job posting', type: 'sent', time: '2:15 PM', date: '2024-01-28' },
            { text: 'Hi! Are you available to start next week?', type: 'received', time: '2:20 PM', date: '2024-01-28' }
        ]
    }
};

function loadChatList() {
    chatList.innerHTML = '';
    Object.entries(chatHistory).forEach(([id, chat]) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${selectedChat === id ? 'active' : ''}`;
        chatItem.innerHTML = `
            <div class="chat-avatar">${chat.partner[0]}</div>
            <div class="chat-info">
                <div class="chat-name">${chat.partner}</div>
                <div class="chat-preview">${lastMessage.text}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${lastMessage.time}</div>
                <div class="chat-date">${formatDate(lastMessage.date)}</div>
            </div>
        `;
        chatItem.onclick = () => loadChatDetails(id);
        chatList.appendChild(chatItem);
    });
}

function loadChatDetails(chatId) {
    selectedChat = chatId;
    const chat = chatHistory[chatId];
    document.getElementById('selectedChatTitle').textContent = chat.title;
    
    messageHistory.innerHTML = '';
    chat.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${message.time}</div>
        `;
        messageHistory.appendChild(messageDiv);
    });
    
    loadChatList(); // Refresh list to update active state
}

// Review Moderation
const reviewModerationModal = document.getElementById('reviewModerationModal');
const reviewList = document.getElementById('reviewList');
const moderationStatus = document.getElementById('moderationStatus');

// Sample review data
const reviews = [
    {
        id: 1,
        reviewer: 'John Doe',
        rating: 4,
        title: 'Great Service',
        content: 'Very professional and timely delivery.',
        status: 'pending',
        date: '2024-01-29'
    },
    {
        id: 2,
        reviewer: 'Jane Smith',
        rating: 5,
        title: 'Excellent Work',
        content: 'Went above and beyond expectations.',
        status: 'approved',
        date: '2024-01-28'
    }
];

function loadReviews() {
    const status = moderationStatus.value;
    const filteredReviews = reviews.filter(review => 
        status === 'all' || review.status === status
    );
    
    reviewList.innerHTML = '';
    filteredReviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-name">${review.reviewer}</div>
                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                </div>
                <span class="review-status status-${review.status}">${review.status}</span>
            </div>
            <div class="review-content">
                <h4>${review.title}</h4>
                <p>${review.content}</p>
            </div>
            <div class="review-actions">
                ${review.status === 'pending' ? `
                    <button class="approve-btn" onclick="moderateReview(${review.id}, 'approved')">Approve</button>
                    <button class="reject-btn" onclick="moderateReview(${review.id}, 'rejected')">Reject</button>
                ` : ''}
            </div>
        `;
        reviewList.appendChild(reviewItem);
    });
}

function moderateReview(reviewId, status) {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
        review.status = status;
        loadReviews();
    }
}

// Event Listeners
moderationStatus.addEventListener('change', loadReviews);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatList();
    loadReviews();
=======
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');

    menuToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        authButtons.style.display = authButtons.style.display === 'flex' ? 'none' : 'flex';
    });

    // Responsive navigation
    if (window.innerWidth <= 768) {
        navLinks.style.display = 'none';
        authButtons.style.display = 'none';
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
            authButtons.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
            authButtons.style.display = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu after clicking a link
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    authButtons.style.display = 'none';
                }
            }
        });
    });

    // Add active class to navigation links based on scroll position
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
    });

    // Form validation for login/signup modals (to be implemented)
    const validateForm = (form) => {
        const inputs = form.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }

            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    isValid = false;
                    input.classList.add('error');
                }
            }
        });

        return isValid;
    };

    // Example form submission handler
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm(e.target)) {
            // Handle form submission
            console.log('Form submitted successfully');
        } else {
            console.log('Form validation failed');
        }
    };

    // Add form submission handlers when forms are created
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
});

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
});

// Bid Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bidModal');
    const closeBtn = document.querySelector('.close-modal');
    const submitBtns = document.querySelectorAll('.job-card .primary-btn');
    const bidForm = document.getElementById('bidForm');
    let currentJobCard = null;

    // Open modal when Submit Bid is clicked
    submitBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentJobCard = btn.closest('.job-card');
            
            // Pre-fill some form fields based on the job
            const jobTitle = currentJobCard.querySelector('h3').textContent;
            const budget = currentJobCard.querySelector('.budget').textContent;
            const startDate = currentJobCard.querySelector('.fa-calendar').parentElement.textContent;
            
            // Set modal title
            document.querySelector('.modal-header h2').textContent = `Submit Bid for ${jobTitle}`;
            
            // Set minimum date to job's start date or today
            const dateInput = document.getElementById('availabilityDate');
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close modal functions
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        bidForm.reset();
    };

    closeBtn.addEventListener('click', closeModal);
    window.closeBidModal = closeModal; // Make it available for the Cancel button

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle currency conversion in bid form
    const bidAmount = document.getElementById('bidAmount');
    const bidCurrency = document.getElementById('bidCurrency');
    const exchangeRate = 36; // USD to ZWL rate

    bidCurrency.addEventListener('change', () => {
        if (!bidAmount.value) return;
        
        const amount = parseFloat(bidAmount.value);
        if (bidCurrency.value === 'ZWL') {
            bidAmount.value = (amount * exchangeRate).toFixed(2);
        } else {
            bidAmount.value = (amount / exchangeRate).toFixed(2);
        }
    });

    // Form submission
    bidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateBidForm(bidForm)) {
            // Collect form data
            const formData = {
                jobTitle: currentJobCard.querySelector('h3').textContent,
                amount: bidAmount.value,
                currency: bidCurrency.value,
                bidType: document.getElementById('bidType').value,
                availabilityDate: document.getElementById('availabilityDate').value,
                completionTime: document.getElementById('completionTime').value,
                timeUnit: document.getElementById('timeUnit').value,
                proposal: document.getElementById('proposal').value,
                requirements: Array.from(document.querySelectorAll('input[name="requirements"]:checked'))
                    .map(checkbox => checkbox.value)
            };

            // Here you would typically send this data to your backend
            console.log('Bid submitted:', formData);
            
            // Show success message
            alert('Your bid has been submitted successfully!');
            closeModal();
        }
    });

    // Validate bid form
    const validateBidForm = (form) => {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        // Additional validation rules can be added here
        const amount = parseFloat(bidAmount.value);
        if (isNaN(amount) || amount <= 0) {
            bidAmount.classList.add('error');
            isValid = false;
        }

        return isValid;
    };

    // Preview functionality
    const previewBtn = document.getElementById('previewBtn');
    const backToEditBtn = document.getElementById('backToEditBtn');
    const step1Content = document.getElementById('step1');
    const step2Content = document.getElementById('step2');
    const steps = document.querySelectorAll('.step');

    const updateStepIndicators = (currentStep) => {
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const updatePreview = () => {
        // Job details
        const jobTitle = currentJobCard.querySelector('h3').textContent;
        const location = currentJobCard.querySelector('.fa-map-marker-alt').parentElement.textContent;
        document.getElementById('previewJobTitle').textContent = jobTitle;
        document.getElementById('previewLocation').textContent = location;

        // Bid details
        const amount = document.getElementById('bidAmount').value;
        const currency = document.getElementById('bidCurrency').value;
        const bidType = document.getElementById('bidType').value;
        const availabilityDate = document.getElementById('availabilityDate').value;
        const completionTime = document.getElementById('completionTime').value;
        const timeUnit = document.getElementById('timeUnit').value;
        const proposal = document.getElementById('proposal').value;

        document.getElementById('previewAmount').textContent = 
            `${currency} ${amount} ${bidType !== 'fixed' ? `per ${bidType.split('-')[1]}` : ''}`;
        document.getElementById('previewDate').textContent = formatDate(availabilityDate);
        document.getElementById('previewTime').textContent = `${completionTime} ${timeUnit}`;
        document.getElementById('previewProposal').textContent = proposal;

        // Requirements
        const requirementsList = document.getElementById('previewRequirements');
        requirementsList.innerHTML = '';
        document.querySelectorAll('input[name="requirements"]:checked').forEach(checkbox => {
            const li = document.createElement('li');
            li.textContent = checkbox.parentElement.textContent.trim();
            requirementsList.appendChild(li);
        });
    };

    previewBtn.addEventListener('click', () => {
        if (validateBidForm(bidForm)) {
            updatePreview();
            step1Content.style.display = 'none';
            step2Content.style.display = 'block';
            updateStepIndicators(2);
        }
    });

    backToEditBtn.addEventListener('click', () => {
        step2Content.style.display = 'none';
        step1Content.style.display = 'block';
        updateStepIndicators(1);
    });

    // Update form submission to include preview step
    bidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            jobTitle: currentJobCard.querySelector('h3').textContent,
            amount: bidAmount.value,
            currency: bidCurrency.value,
            bidType: document.getElementById('bidType').value,
            availabilityDate: document.getElementById('availabilityDate').value,
            completionTime: document.getElementById('completionTime').value,
            timeUnit: document.getElementById('timeUnit').value,
            proposal: document.getElementById('proposal').value,
            requirements: Array.from(document.querySelectorAll('input[name="requirements"]:checked'))
                .map(checkbox => checkbox.value)
        };

        // Here you would typically send this data to your backend
        console.log('Bid submitted:', formData);
        
        // Show success message
        alert('Your bid has been submitted successfully!');
        closeModal();
    });
});

// Chat Functionality
const chatInterface = document.getElementById('chatInterface');
const chatMessages = document.getElementById('chatMessages');
const minimizeBtn = document.querySelector('.minimize-chat');
const closeBtn = document.querySelector('.close-chat');
const sendBtn = document.querySelector('.send-message');
const chatInput = document.querySelector('.chat-input textarea');
let currentChatId = null;

// Sample messages for demo
const sampleMessages = {
    'job123': [
        { text: 'Hi, I\'m interested in your transportation job', type: 'sent', time: '10:30 AM' },
        { text: 'Great! Do you have experience with grain transportation?', type: 'received', time: '10:32 AM' },
        { text: 'Yes, I\'ve been transporting grain for 5 years', type: 'sent', time: '10:33 AM' }
    ]
};

window.openChat = (jobId) => {
    currentChatId = jobId;
    chatInterface.style.display = 'flex';
    loadMessages(jobId);
};

const loadMessages = (jobId) => {
    chatMessages.innerHTML = '';
    const messages = sampleMessages[jobId] || [];
    messages.forEach(addMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const addMessage = (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.innerHTML = `
        <div class="message-content">${message.text}</div>
        <div class="message-time">${message.time}</div>
    `;
    chatMessages.appendChild(messageDiv);
};

minimizeBtn.addEventListener('click', () => {
    chatInterface.classList.toggle('minimized');
});

closeBtn.addEventListener('click', () => {
    chatInterface.style.display = 'none';
    currentChatId = null;
});

sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text && currentChatId) {
        const message = {
            text,
            type: 'sent',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        if (!sampleMessages[currentChatId]) {
            sampleMessages[currentChatId] = [];
        }
        sampleMessages[currentChatId].push(message);
        addMessage(message);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

// Rating System
const ratingModal = document.getElementById('ratingModal');
const ratingForm = document.getElementById('ratingForm');
const stars = document.querySelectorAll('.stars i');
const ratingValue = document.querySelector('.rating-value');
let currentRating = 0;

window.openRatingModal = (jobId) => {
    ratingModal.style.display = 'block';
};

window.closeRatingModal = () => {
    ratingModal.style.display = 'none';
    resetRating();
};

const resetRating = () => {
    currentRating = 0;
    ratingValue.textContent = '0/5';
    stars.forEach(star => star.classList.remove('active'));
    ratingForm.reset();
};

stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        const category = star.dataset.category;
        
        if (category) {
            // Handle category-specific rating
            const categoryStars = document.querySelectorAll(`.stars i[data-category="${category}"]`);
            categoryStars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
            });
        } else {
            // Handle main rating
            currentRating = rating;
            ratingValue.textContent = `${rating}/5`;
            stars.forEach(s => {
                if (!s.dataset.category) {
                    s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
                }
            });
        }
    });
});

ratingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }

    const formData = {
        rating: currentRating,
        title: document.getElementById('reviewTitle').value,
        review: document.getElementById('reviewText').value,
        categories: {
            communication: getRatingForCategory('communication'),
            reliability: getRatingForCategory('reliability'),
            quality: getRatingForCategory('quality')
        }
    };

    // Here you would typically send this data to your backend
    console.log('Review submitted:', formData);
    
    alert('Thank you for your review!');
    closeRatingModal();
});

const getRatingForCategory = (category) => {
    const stars = document.querySelectorAll(`.stars i[data-category="${category}"].active`);
    return stars.length;
};

// File Sharing
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const maxFileSize = 5 * 1024 * 1024; // 5MB
const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
];

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    filePreview.innerHTML = '';
    
    files.forEach(file => {
        if (file.size > maxFileSize) {
            alert(`File ${file.name} is too large. Maximum size is 5MB.`);
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert(`File type ${file.type} is not allowed.`);
            return;
        }

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const icon = document.createElement('i');
        icon.className = getFileIcon(file.type);
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        `;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => fileItem.remove();
        
        fileItem.appendChild(icon);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        filePreview.appendChild(fileItem);
    });
    
    if (filePreview.children.length > 0) {
        filePreview.style.display = 'block';
    }
});

function getFileIcon(type) {
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word')) return 'fas fa-file-word';
    if (type.includes('image')) return 'fas fa-file-image';
    return 'fas fa-file';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Message History
const messageHistoryModal = document.getElementById('messageHistoryModal');
const chatList = document.getElementById('chatList');
const messageHistory = document.getElementById('messageHistory');
let selectedChat = null;

// Sample chat history data
const chatHistory = {
    'job123': {
        title: 'Maize Transportation Job',
        partner: 'John Farmer',
        messages: [
            { text: 'Hi, I\'m interested in your transportation job', type: 'sent', time: '10:30 AM', date: '2024-01-29' },
            { text: 'Great! Do you have experience with grain transportation?', type: 'received', time: '10:32 AM', date: '2024-01-29' },
            { text: 'Yes, I\'ve been transporting grain for 5 years', type: 'sent', time: '10:33 AM', date: '2024-01-29' }
        ]
    },
    'job456': {
        title: 'Cotton Harvesting Job',
        partner: 'Sarah Smith',
        messages: [
            { text: 'Hello, I saw your cotton harvesting job posting', type: 'sent', time: '2:15 PM', date: '2024-01-28' },
            { text: 'Hi! Are you available to start next week?', type: 'received', time: '2:20 PM', date: '2024-01-28' }
        ]
    }
};

function loadChatList() {
    chatList.innerHTML = '';
    Object.entries(chatHistory).forEach(([id, chat]) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${selectedChat === id ? 'active' : ''}`;
        chatItem.innerHTML = `
            <div class="chat-avatar">${chat.partner[0]}</div>
            <div class="chat-info">
                <div class="chat-name">${chat.partner}</div>
                <div class="chat-preview">${lastMessage.text}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${lastMessage.time}</div>
                <div class="chat-date">${formatDate(lastMessage.date)}</div>
            </div>
        `;
        chatItem.onclick = () => loadChatDetails(id);
        chatList.appendChild(chatItem);
    });
}

function loadChatDetails(chatId) {
    selectedChat = chatId;
    const chat = chatHistory[chatId];
    document.getElementById('selectedChatTitle').textContent = chat.title;
    
    messageHistory.innerHTML = '';
    chat.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${message.time}</div>
        `;
        messageHistory.appendChild(messageDiv);
    });
    
    loadChatList(); // Refresh list to update active state
}

// Review Moderation
const reviewModerationModal = document.getElementById('reviewModerationModal');
const reviewList = document.getElementById('reviewList');
const moderationStatus = document.getElementById('moderationStatus');

// Sample review data
const reviews = [
    {
        id: 1,
        reviewer: 'John Doe',
        rating: 4,
        title: 'Great Service',
        content: 'Very professional and timely delivery.',
        status: 'pending',
        date: '2024-01-29'
    },
    {
        id: 2,
        reviewer: 'Jane Smith',
        rating: 5,
        title: 'Excellent Work',
        content: 'Went above and beyond expectations.',
        status: 'approved',
        date: '2024-01-28'
    }
];

function loadReviews() {
    const status = moderationStatus.value;
    const filteredReviews = reviews.filter(review => 
        status === 'all' || review.status === status
    );
    
    reviewList.innerHTML = '';
    filteredReviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-name">${review.reviewer}</div>
                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                </div>
                <span class="review-status status-${review.status}">${review.status}</span>
            </div>
            <div class="review-content">
                <h4>${review.title}</h4>
                <p>${review.content}</p>
            </div>
            <div class="review-actions">
                ${review.status === 'pending' ? `
                    <button class="approve-btn" onclick="moderateReview(${review.id}, 'approved')">Approve</button>
                    <button class="reject-btn" onclick="moderateReview(${review.id}, 'rejected')">Reject</button>
                ` : ''}
            </div>
        `;
        reviewList.appendChild(reviewItem);
    });
}

function moderateReview(reviewId, status) {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
        review.status = status;
        loadReviews();
    }
}

// Event Listeners
moderationStatus.addEventListener('change', loadReviews);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatList();
    loadReviews();
>>>>>>> 1d12cc19c4d3855a6b3534a8acfc9a5c99a896ea
}); 