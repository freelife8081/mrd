// Telegram Bot Configuration (ENTER YOUR CREDENTIALS HERE)
const TELEGRAM_BOT_TOKEN = '8032211561:AAEH86izjI5_bvtcX-JbnZw2WVrwoDL6JTI'; // Replace with your bot token
const TELEGRAM_CHAT_ID = '7181820663'; // Replace with your chat ID

// Application State
const APP_STATE = {
    spotsLeft: 100, // Start with 100 spots
    theme: localStorage.getItem('theme') || 'dark'
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const discountModal = document.getElementById('discountModal');
const closeModal = document.querySelector('.close-modal');
const counterDisplay = document.getElementById('counterDisplay');
const progressBar = document.getElementById('progressBar');
const navMenu = document.getElementById('navMenu');
const menuToggle = document.getElementById('menuToggle');
const contactForm = document.getElementById('contactForm');
const registrationForm = document.getElementById('registrationForm');
const whatsappLink = document.getElementById('whatsappLink');
const termsModal = document.getElementById('termsModal');
const showTerms = document.getElementById('showTerms');
const closeTerms = document.querySelector('.close-terms');
const configModal = document.getElementById('configModal');

// Initialize Application
function initApp() {
    // Set theme
    document.body.className = APP_STATE.theme + '-theme';
    
    // Load spots left from localStorage
    const savedSpots = localStorage.getItem('spotsLeft');
    if (savedSpots) {
        APP_STATE.spotsLeft = parseInt(savedSpots);
    }
    
    // Update counters
    updateCounters();
    
    // Show discount modal after 3 seconds
    setTimeout(() => {
        if (!sessionStorage.getItem('modalShown')) {
            showDiscountModal();
            sessionStorage.setItem('modalShown', 'true');
        }
    }, 3000);
    
    // Check if Telegram credentials are set
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Please update Telegram bot credentials in script.js');
        setTimeout(() => {
            showConfigModal();
        }, 2000);
    }
    
    // Initialize event listeners
    initEventListeners();
}

// Show Discount Modal
function showDiscountModal() {
    if (discountModal) {
        discountModal.style.display = 'flex';
    }
}

// Show Config Modal
function showConfigModal() {
    if (configModal) {
        configModal.style.display = 'flex';
    }
}

// Update Counters
function updateCounters() {
    // Update spots left
    if (counterDisplay) {
        counterDisplay.textContent = APP_STATE.spotsLeft;
    }
    
    // Update progress bar
    if (progressBar) {
        const progress = 100 - APP_STATE.spotsLeft;
        progressBar.style.width = `${progress}%`;
    }
    
    // Update spots left on registration page
    const spotsLeftElement = document.getElementById('spotsLeft');
    if (spotsLeftElement) {
        spotsLeftElement.textContent = APP_STATE.spotsLeft;
    }
}

// Initialize Event Listeners
function initEventListeners() {
    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            discountModal.style.display = 'none';
        });
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === discountModal) {
            discountModal.style.display = 'none';
        }
        if (e.target === termsModal) {
            termsModal.style.display = 'none';
        }
        if (e.target === configModal) {
            configModal.style.display = 'none';
        }
    });
    
    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
    
    // Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Registration Form Submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistrationSubmit);
    }
    
    // Terms and Conditions
    if (showTerms) {
        showTerms.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.style.display = 'flex';
        });
    }
    
    if (closeTerms) {
        closeTerms.addEventListener('click', () => {
            termsModal.style.display = 'none';
        });
    }
    
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.closest('.copy-btn').dataset.copy;
            copyToClipboard(text);
            showNotification('Copied to clipboard!', 'success');
        });
    });
    
    // Step navigation for registration
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextStep = e.target.dataset.next;
            goToStep(nextStep);
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prevStep = e.target.dataset.prev;
            goToStep(prevStep);
        });
    });
    
    // Terms links in footer
    document.querySelectorAll('#footerTerms, #footerDisclaimer').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.style.display = 'flex';
        });
    });
    
    // Set current year in footer
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

// Toggle Theme
function toggleTheme() {
    APP_STATE.theme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
    document.body.className = APP_STATE.theme + '-theme';
    localStorage.setItem('theme', APP_STATE.theme);
}

// Handle Contact Form Submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        phone: document.getElementById('contactPhone').value,
        email: document.getElementById('contactEmail').value || 'Not provided',
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        timestamp: new Date().toLocaleString(),
        type: 'contact'
    };
    
    // Send to Telegram bot
    const sent = await sendToTelegram(formData);
    
    if (sent) {
        showNotification('Message sent successfully! We\'ll contact you soon.', 'success');
        contactForm.reset();
        
        // Show success animation
        createConfetti();
    } else {
        showNotification('Failed to send message. Please try again or contact us directly.', 'error');
    }
}

// Handle Registration Form Submission
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value || 'Not provided',
        location: document.getElementById('location').value,
        transactionCode: document.getElementById('transactionCode').value,
        paymentDate: document.getElementById('paymentDate').value,
        referral: document.getElementById('referral').value || 'None',
        timestamp: new Date().toLocaleString(),
        type: 'registration'
    };
    
    // Show loading state
    const submitBtn = document.getElementById('submitRegistration');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
    submitBtn.disabled = true;
    
    try {
        // Send to Telegram bot
        const sent = await sendToTelegram(formData);
        
        if (sent) {
            // Update spots left
            APP_STATE.spotsLeft = Math.max(0, APP_STATE.spotsLeft - 1);
            
            // Save to localStorage
            localStorage.setItem('spotsLeft', APP_STATE.spotsLeft);
            
            // Update counters
            updateCounters();
            
            // Go to step 3
            goToStep('3');
            
            // Set WhatsApp group link (Replace with your actual link)
            if (whatsappLink) {
                whatsappLink.href = 'https://chat.whatsapp.com/YOUR_GROUP_LINK_HERE';
            }
            
            // Show success animation
            createConfetti();
            
            showNotification('Registration successful! Welcome to Mandera Crypto Center!', 'success');
        } else {
            showNotification('Registration failed. Please try again or contact support.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred. Please try again.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Send to Telegram Bot
async function sendToTelegram(data) {
    try {
        const message = formatTelegramMessage(data);
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Telegram send error:', error);
        return false;
    }
}

// Format Telegram Message
function formatTelegramMessage(data) {
    let message = '';
    
    if (data.type === 'registration') {
        message = `
<b>📝 NEW REGISTRATION - Mandera Crypto Center</b>

<b>👤 Student Details:</b>
<b>Name:</b> ${data.fullName}
<b>Phone:</b> ${data.phoneNumber}
<b>Email:</b> ${data.email}
<b>Location:</b> ${data.location}

<b>💰 Payment Details:</b>
<b>Transaction Code:</b> ${data.transactionCode}
<b>Payment Date:</b> ${data.paymentDate}
<b>Referral:</b> ${data.referral}

<b>📅 Registration Time:</b> ${data.timestamp}

<b>📊 Status:</b>
<b>Spots Left:</b> ${APP_STATE.spotsLeft}
<b>Total Registered:</b> ${100 - APP_STATE.spotsLeft}
        `;
    } else if (data.type === 'contact') {
        message = `
<b>📨 NEW MESSAGE - Mandera Crypto Center</b>

<b>📋 Contact Details:</b>
<b>Name:</b> ${data.name}
<b>Phone:</b> ${data.phone}
<b>Email:</b> ${data.email}

<b>📝 Message Details:</b>
<b>Subject:</b> ${data.subject}
<b>Message:</b> ${data.message}

<b>📅 Received:</b> ${data.timestamp}
        `;
    }
    
    return message.trim();
}

// Navigation between steps
function goToStep(stepNumber) {
    // Update step indicator
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) < stepNumber) {
            step.classList.add('completed');
        }
    });
    
    document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');
    
    // Show step content
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const stepPanel = document.getElementById(`step${stepNumber}`);
    if (stepPanel) {
        stepPanel.classList.add('active');
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff3366' : '#00d4ff'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                z-index: 9999;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                font-size: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Create Confetti Animation
function createConfetti() {
    const colors = ['#00d4ff', '#0088ff', '#7b42ff', '#00ff88', '#ffaa00'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add confetti keyframes to head
const confettiStyles = document.createElement('style');
confettiStyles.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(confettiStyles);