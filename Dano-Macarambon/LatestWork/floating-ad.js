/**
 * Floating Advertisement Component for NOPE E-Commerce
 * Displays voucher promotions as floating banners
 */

// List of promotional messages
const promos = [
    {
        title: 'Limited Time Offer!',
        message: 'Get 20% off your purchase of ₱2000 or more! Use code: SAVE20',
        icon: 'fa-tag',
        type: 'discount'
    },
    {
        title: 'Bundle Deal!',
        message: 'Buy 4 Party Kits and get 50% off! Use code: PARTY50',
        icon: 'fa-gift',
        type: 'bundle'
    },
    {
        title: 'New Subscriber Special!',
        message: 'First month FREE for new subscribers! Code: FIRST100',
        icon: 'fa-star',
        type: 'subscription' 
    },
    {
        title: 'Time-Limited Deal!',
        message: '10% off when you spend ₱3000+ on non-sale items! Code: TIME10',
        icon: 'fa-clock',
        type: 'discount'
    }
];

// Function to create and manage floating ads
function initFloatingAd() {
    // Create ad container
    const adContainer = document.createElement('div');
    adContainer.className = 'floating-ad';
    adContainer.id = 'floatingAd';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ad-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.setAttribute('aria-label', 'Close promotion');
    
    // Add navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'ad-nav prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Previous promotion');
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'ad-nav next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Next promotion');
    
    // Add dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'ad-dots';
    
    // Create dots for each promo
    promos.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'ad-dot';
        if (index === 0) dot.classList.add('active');
        dot.dataset.index = index;
        dotsContainer.appendChild(dot);
    });
    
    // Set initial ad content
    updateAdContent(adContainer, 0);
    
    // Add all elements to container
    adContainer.appendChild(closeBtn);
    adContainer.appendChild(prevBtn);
    adContainer.appendChild(nextBtn);
    adContainer.appendChild(dotsContainer);
    
    // Add container to document
    document.body.appendChild(adContainer);
    
    // Current ad index and animation state
    let currentAdIndex = 0;
    let isAnimating = false;
    
    // Close button event listener
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adContainer.classList.add('hidden');
        // Store that the user has closed the ad in this session
        sessionStorage.setItem('adClosed', 'true');
    });
    
    // Previous button event listener
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = (currentAdIndex - 1 + promos.length) % promos.length;
            updateAdContent(adContainer, currentAdIndex);
            updateActiveDot(dotsContainer, currentAdIndex);
            
            setTimeout(() => {
                adContainer.classList.remove('fade-out');
                isAnimating = false;
            }, 50);
        }, 300);
    });
    
    // Next button event listener
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAnimating) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = (currentAdIndex + 1) % promos.length;
            updateAdContent(adContainer, currentAdIndex);
            updateActiveDot(dotsContainer, currentAdIndex);
            
            setTimeout(() => {
                adContainer.classList.remove('fade-out');
                isAnimating = false;
            }, 50);
        }, 300);
    });
    
    // Dot navigation event listener
    dotsContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const dot = e.target.closest('.ad-dot');
        if (!dot || isAnimating) return;
        
        const newIndex = parseInt(dot.dataset.index);
        if (newIndex === currentAdIndex) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = newIndex;
            updateAdContent(adContainer, currentAdIndex);
            updateActiveDot(dotsContainer, currentAdIndex);
            
            setTimeout(() => {
                adContainer.classList.remove('fade-out');
                isAnimating = false;
            }, 50);
        }, 300);
    });
    
    // Ad container click event (open order modal)
    adContainer.addEventListener('click', () => {
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Auto-rotate ads
    let autoRotateInterval = setInterval(() => {
        if (document.hidden || isAnimating || adContainer.classList.contains('hidden')) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = (currentAdIndex + 1) % promos.length;
            updateAdContent(adContainer, currentAdIndex);
            updateActiveDot(dotsContainer, currentAdIndex);
            
            setTimeout(() => {
                adContainer.classList.remove('fade-out');
                isAnimating = false;
            }, 50);
        }, 300);
    }, 8000);
    
    // Check if ad was previously closed
    if (sessionStorage.getItem('adClosed') === 'true') {
        adContainer.classList.add('hidden');
    }
    
    // Add resize event listener for responsiveness
    window.addEventListener('resize', () => {
        checkPosition(adContainer);
    });
    
    // Position check initial run
    checkPosition(adContainer);
    
    return {
        element: adContainer,
        show: () => {
            adContainer.classList.remove('hidden');
            sessionStorage.removeItem('adClosed');
        },
        hide: () => {
            adContainer.classList.add('hidden');
            sessionStorage.setItem('adClosed', 'true');
        },
        stopAutoRotate: () => {
            clearInterval(autoRotateInterval);
        }
    };
}

// Helper function to update active dot
function updateActiveDot(dotsContainer, activeIndex) {
    const dots = dotsContainer.querySelectorAll('.ad-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

// Helper function to update ad content
function updateAdContent(adContainer, index) {
    const promo = promos[index];
    
    // First, remove existing content
    const existingContent = adContainer.querySelector('.ad-content');
    if (existingContent) {
        existingContent.remove();
    }
    
    // Create new content container
    const newContent = document.createElement('div');
    newContent.className = 'ad-content';
    newContent.innerHTML = `
        <div class="ad-icon"><i class="fas ${promo.icon}"></i></div>
        <div class="ad-text">
            <h3>${promo.title}</h3>
            <p>${promo.message}</p>
        </div>
        <div class="notification-dot"></div>
    `;
    
    // Add type class for styling
    newContent.classList.add(`ad-type-${promo.type}`);
    
    // Insert content after close button, or append if not found or nextSibling is null
    const closeBtn = adContainer.querySelector('.ad-close');
    if (closeBtn) {
        if (closeBtn.nextSibling) {
            adContainer.insertBefore(newContent, closeBtn.nextSibling);
        } else {
            adContainer.appendChild(newContent);
        }
    } else {
        adContainer.appendChild(newContent);
    }
}

// Helper function to check position and adjust for mobile
function checkPosition(adContainer) {
    if (window.innerWidth <= 768) {
        adContainer.style.left = '20px';
        adContainer.style.width = 'calc(100% - 40px)';
    } else {
        adContainer.style.left = '20px';
        adContainer.style.width = '300px';
    }
    
    // Ensure the ad is visible by removing 'hidden' class when needed
    if (sessionStorage.getItem('adClosed') !== 'true') {
        adContainer.classList.remove('hidden');
    }
}

// Initialize floating ad when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove any stored state that the ad should be hidden
    sessionStorage.removeItem('adClosed');
    
    // Initialize the floating ad component
    initFloatingAd();
}); 