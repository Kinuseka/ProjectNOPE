/**
 * Floating Advertisement Component for NOPE E-Commerce
 * Displays voucher promotions as floating banners
 */

// Function to generate promotions from available vouchers
function getVoucherPromos() {
    // Default promos in case voucher system is not available
    let defaultPromos = [
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
        }
    ];
    
    // If voucher system is not available, return default promos
    if (typeof voucherSystem === 'undefined' || !voucherSystem) {
        console.log("VoucherSystem not available for ads, using defaults");
        return defaultPromos;
    }
    
    try {
        // Get all available vouchers
        const allVouchers = voucherSystem.getAllVouchers();
        const voucherCodes = Object.keys(allVouchers);
        
        // If no vouchers available, return defaults
        if (voucherCodes.length === 0) {
            console.log("No vouchers available, using default promos");
            return defaultPromos;
        }
        
        // Shuffle the voucher codes array
        const shuffledCodes = voucherCodes.sort(() => 0.5 - Math.random());
        
        // Take up to 3 random vouchers
        const selectedCodes = shuffledCodes.slice(0, Math.min(3, shuffledCodes.length));
        
        // Convert vouchers to promo format
        const promos = selectedCodes.map(code => {
            const voucher = allVouchers[code];
            
            // Determine promo type based on voucher properties
            let type = 'discount';
            let title = 'Special Offer!';
            
            if (voucher.eligibleItems === 'subscription') {
                type = 'subscription';
                title = 'Subscription Deal!';
            } else if (voucher.minQuantity && voucher.eligibleItems !== 'all') {
                type = 'bundle';
                title = 'Bundle Offer!';
            } else if (voucher.expiryDays <= 7 || new Date(voucher.expiry) - new Date() < 7 * 24 * 60 * 60 * 1000) {
                title = 'Limited Time Offer!';
            }
            
            return {
                title: title,
                message: `${voucher.description} Use code: ${code}`,
                icon: voucher.icon || 'fa-tag',
                type: type
            };
        });
        
        return promos;
    } catch (error) {
        console.error("Error generating voucher promos:", error);
        return defaultPromos;
    }
}

// Function to create and manage floating ads
function initFloatingAd() {
    // Get promos from voucher system
    const promos = getVoucherPromos();
    
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
    if (promos.length > 0) {
        updateAdContent(adContainer, 0, promos);
    } else {
        // Hide ad if no promos available
        adContainer.classList.add('hidden');
    }
    
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
        if (isAnimating || promos.length <= 1) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = (currentAdIndex - 1 + promos.length) % promos.length;
            updateAdContent(adContainer, currentAdIndex, promos);
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
        if (isAnimating || promos.length <= 1) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = (currentAdIndex + 1) % promos.length;
            updateAdContent(adContainer, currentAdIndex, promos);
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
        if (!dot || isAnimating || promos.length <= 1) return;
        
        const newIndex = parseInt(dot.dataset.index);
        if (newIndex === currentAdIndex) return;
        
        isAnimating = true;
        adContainer.classList.add('fade-out');
        
        setTimeout(() => {
            currentAdIndex = newIndex;
            updateAdContent(adContainer, currentAdIndex, promos);
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
    
    // Auto-rotate ads if more than one promo
    let autoRotateInterval;
    if (promos.length > 1) {
        autoRotateInterval = setInterval(() => {
            if (document.hidden || isAnimating || adContainer.classList.contains('hidden')) return;
            
            isAnimating = true;
            adContainer.classList.add('fade-out');
            
            setTimeout(() => {
                currentAdIndex = (currentAdIndex + 1) % promos.length;
                updateAdContent(adContainer, currentAdIndex, promos);
                updateActiveDot(dotsContainer, currentAdIndex);
                
                setTimeout(() => {
                    adContainer.classList.remove('fade-out');
                    isAnimating = false;
                }, 50);
            }, 300);
        }, 8000);
    }
    
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
            if (autoRotateInterval) {
                clearInterval(autoRotateInterval);
            }
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
function updateAdContent(adContainer, index, promos) {
    if (!promos || promos.length === 0 || index >= promos.length) {
        return;
    }
    
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
    // Check if voucher system is loaded first, otherwise wait
    if (typeof voucherSystem !== 'undefined' && voucherSystem) {
        initFloatingAd();
    } else {
        // Wait for voucher system to load
        window.addEventListener('load', () => {
            // Remove any stored state that the ad should be hidden
            sessionStorage.removeItem('adClosed');
            
            // Initialize the floating ad component
            initFloatingAd();
        });
    }
}); 