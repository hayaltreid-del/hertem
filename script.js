// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Intersection Observer for Animations
class AnimationObserver {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        this.animatedElements = new Set();
    }

    observe(element) {
        this.observer.observe(element);
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                entry.target.classList.add('aos-animate');
                this.animatedElements.add(entry.target);
                
                // Trigger counter animation if it's a counter element
                if (entry.target.classList.contains('analytics-number') || 
                    entry.target.classList.contains('stat-number')) {
                    this.animateCounter(entry.target);
                }
            }
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target')) || 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    }
}

// Navigation Controller
class NavigationController {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }

    init() {
        // Scroll effect for navbar
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }, 16));

        // Mobile menu toggle
        this.hamburger?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Smooth scrolling for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.scrollToSection(href.substring(1));
                    this.closeMobileMenu();
                }
            });
        });

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Active link highlighting
        this.updateActiveLink();
        window.addEventListener('scroll', throttle(() => {
            this.updateActiveLink();
        }, 100));
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Tab Controller
class TabController {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.tabButtons = this.container.querySelectorAll('.tab-btn, .example-tab');
        this.tabContents = this.container.querySelectorAll('.tab-content, .example-content');
        
        this.init();
    }

    init() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab') || button.getAttribute('data-example');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(activeTabId) {
        // Update button states
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
            const buttonTabId = button.getAttribute('data-tab') || button.getAttribute('data-example');
            if (buttonTabId === activeTabId) {
                button.classList.add('active');
            }
        });

        // Update content visibility
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            const contentId = content.getAttribute('id');
            if (contentId === `tab-${activeTabId}` || contentId === `example-${activeTabId}`) {
                content.classList.add('active');
            }
        });
    }
}

// Form Controller
class FormController {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;
        
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.loadingSpan = this.form.querySelector('.btn-loading');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        
        // Remove previous error styling
        field.classList.remove('error');
        
        let isValid = true;
        
        switch (fieldName) {
            case 'name':
                isValid = value.length >= 2;
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                break;
            case 'company':
                isValid = value.length >= 2;
                break;
            case 'team-size':
                isValid = value !== '';
                break;
        }
        
        if (!isValid) {
            field.classList.add('error');
        }
        
        return isValid;
    }

    async handleSubmit() {
        // Validate all fields
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        let isFormValid = true;
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showError('Пожалуйста, заполните все обязательные поля корректно');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate API call
            await this.simulateApiCall(data);
            
            // Show success message
            this.showSuccess('Спасибо! Мы свяжемся с вами в ближайшее время.');
            this.form.reset();
            
        } catch (error) {
            this.showError('Произошла ошибка при отправке формы. Попробуйте еще раз.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async simulateApiCall(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Log form data (in real implementation, send to server)
        console.log('Form submitted:', data);
        
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) {
            return { success: true };
        } else {
            throw new Error('Simulated error');
        }
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitButton.disabled = true;
            this.loadingSpan.style.display = 'inline';
            this.submitButton.querySelector('span:not(.btn-loading)').style.display = 'none';
        } else {
            this.submitButton.disabled = false;
            this.loadingSpan.style.display = 'none';
            this.submitButton.querySelector('span:not(.btn-loading)').style.display = 'inline';
        }
    }

    showSuccess(message) {
        this.removeMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.form.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    showError(message) {
        this.removeMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: var(--error-50);
            color: var(--error-800);
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            border: 1px solid var(--error-200);
            text-align: center;
            margin-top: var(--space-4);
        `;
        errorDiv.textContent = message;
        this.form.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    removeMessages() {
        const messages = this.form.querySelectorAll('.success-message, .error-message');
        messages.forEach(message => message.remove());
    }
}

// Chart Controller for Analytics Demo
class ChartController {
    constructor() {
        this.canvas = document.getElementById('demo-chart');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        
        this.init();
    }

    init() {
        // Create a simple animated chart
        this.drawChart();
        
        // Redraw on resize
        window.addEventListener('resize', debounce(() => {
            this.drawChart();
        }, 250));
    }

    drawChart() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // Chart data
        const data = [65, 45, 80, 70, 90, 75, 85];
        const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;
        
        // Draw bars
        this.ctx.fillStyle = '#0ea5e9';
        data.forEach((value, index) => {
            const barHeight = (value / 100) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = height - padding - barHeight;
            
            // Gradient fill
            const gradient = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#0ea5e9');
            gradient.addColorStop(1, '#14b8a6');
            this.ctx.fillStyle = gradient;
            
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw labels
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '12px Montserrat';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(labels[index], x + barWidth / 2, height - 10);
            this.ctx.fillText(value + '%', x + barWidth / 2, y - 10);
        });
    }
}

// Telegram Messages Animation
class TelegramAnimator {
    constructor() {
        this.messageContainer = document.querySelector('.telegram-messages');
        if (!this.messageContainer) return;
        
        this.messages = [
            { type: 'bot', text: 'Добро пожаловать в HermesTeam! 👋' },
            { type: 'user', text: '/status проект-А' },
            { type: 'bot', text: 'Проект А: 75% выполнено ✅\n3 активные задачи' },
            { type: 'user', text: '/create задача "Подготовить отчет"' },
            { type: 'bot', text: 'Задача создана и назначена! 📋' }
        ];
        
        this.currentMessageIndex = 0;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        // Start animation when telegram demo becomes visible
        const telegramDemo = document.querySelector('.telegram-demo');
        if (telegramDemo) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isAnimating) {
                        this.startAnimation();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(telegramDemo);
        }
    }

    async startAnimation() {
        this.isAnimating = true;
        this.messageContainer.innerHTML = '';
        this.currentMessageIndex = 0;

        for (let i = 0; i < this.messages.length; i++) {
            await this.addMessage(this.messages[i]);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Restart animation after delay
        setTimeout(() => {
            this.isAnimating = false;
            this.startAnimation();
        }, 5000);
    }

    async addMessage(messageData) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${messageData.type}-message`;
        
        // Typing animation
        messageElement.style.opacity = '0';
        this.messageContainer.appendChild(messageElement);
        
        // Animate text typing
        await this.typeText(messageElement, messageData.text);
        
        // Scroll to bottom
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    async typeText(element, text) {
        return new Promise(resolve => {
            element.style.opacity = '1';
            let currentText = '';
            let charIndex = 0;
            
            const typeInterval = setInterval(() => {
                if (charIndex < text.length) {
                    currentText += text[charIndex];
                    element.textContent = currentText;
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    resolve();
                }
            }, 50);
        });
    }
}

// Global Functions
window.scrollToSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};

// Form validation styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: var(--error-500);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .error-message {
            background: var(--error-50);
            color: var(--error-800);
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            border: 1px solid var(--error-200);
            text-align: center;
            margin-top: var(--space-4);
        }
    `;
    document.head.appendChild(style);
});

// Particle System for Hero Background
class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        
        this.setupCanvas();
        this.createParticles();
        this.animate();
    }

    setupCanvas() {
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.appendChild(this.canvas);
        }
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(14, 165, 233, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize controllers
    const navigationController = new NavigationController();
    const featuresTabController = new TabController('.features-tabs');
    const examplesTabController = new TabController('.examples-container');
    const formController = new FormController();
    const chartController = new ChartController();
    const telegramAnimator = new TelegramAnimator();
    
    // Initialize animation observer
    const animationObserver = new AnimationObserver();
    
    // Observe all elements with data-aos attributes
    document.querySelectorAll('[data-aos]').forEach(element => {
        animationObserver.observe(element);
    });
    
    // Observe counter elements
    document.querySelectorAll('.analytics-number, .stat-number').forEach(element => {
        animationObserver.observe(element);
    });
    
    // Initialize particle system for hero
    if (window.innerWidth > 768) {
        new ParticleSystem();
    }
    
    // Add loading animation to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Progressive image loading
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add smooth hover effects
    document.querySelectorAll('.problem-card, .solution-card, .innovation-card, .analytics-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize tooltips for technical terms
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
    
    function showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--gray-900);
            color: white;
            padding: var(--space-2) var(--space-3);
            border-radius: var(--radius-base);
            font-size: var(--font-size-sm);
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--transition-base);
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        e.target._tooltip = tooltip;
    }
    
    function hideTooltip(e) {
        if (e.target._tooltip) {
            e.target._tooltip.style.opacity = '0';
            setTimeout(() => {
                if (e.target._tooltip) {
                    e.target._tooltip.remove();
                    delete e.target._tooltip;
                }
            }, 200);
        }
    }
    
    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxScroll) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';
    }, 16));
    
    console.log('HermesTeam Presentation Website initialized successfully! 🚀');
});

// Performance optimization
window.addEventListener('load', () => {
    // Mark critical rendering path complete
    performance.mark('hermes-team-loaded');
    
    // Log performance metrics
    const paintMetrics = performance.getEntriesByType('paint');
    paintMetrics.forEach(metric => {
        console.log(`${metric.name}: ${Math.round(metric.startTime)}ms`);
    });
    
    // Preload critical resources
    const criticalImages = [
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
});

// Service Worker for caching (progressive web app features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Note: Service worker would be implemented in a separate file
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Error boundary for JavaScript errors
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    
    // In production, you might want to send this to an error tracking service
    // errorTrackingService.captureException(e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    
    // In production, you might want to send this to an error tracking service
    // errorTrackingService.captureException(e.reason);
});