class UIService {
    static showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        } text-white`;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static showLoading(element, text = 'Loading...') {
        const originalContent = element.innerHTML;
        element.disabled = true;
        element.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${text}
        `;
        return () => {
            element.disabled = false;
            element.innerHTML = originalContent;
        };
    }

    static updateAuthUI() {
        const isLoggedIn = AuthService.isLoggedIn();
        const user = AuthService.getCurrentUser();

        document.querySelectorAll('[data-auth-show]').forEach(el => {
            el.style.display = el.dataset.authShow === (isLoggedIn ? 'logged-in' : 'logged-out') ? '' : 'none';
        });

        if (isLoggedIn && user) {
            document.querySelectorAll('[data-user-name]').forEach(el => {
                el.textContent = `${user.firstName} ${user.lastName}`;
            });
        }
    }
}

window.UIService = UIService; 