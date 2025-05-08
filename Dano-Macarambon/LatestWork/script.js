// Get modal elements
const modal = document.getElementById('orderModal');
const orderBtn = document.querySelector('.btn-order');
const closeBtn = document.querySelector('.close');

function generateRandomStock(baseStock) {
    const variation = Math.floor(Math.random() * 16) - 10; // Random number between -10 and +5
    return Math.max(0, baseStock + variation);
}

function getItemIcon(itemName) {
    // Use product system to get the icon if available
    if (typeof productSystem !== 'undefined') {
        const product = productSystem.products.find(p => p.name === itemName);
        if (product && product.icon) {
            return product.icon;
        }
    }
    
    // Fallback to original mapping
    const icons = {
        'N.O.P.E. Anniversary Collector\'s Box': 'fa-box-open',
        'Digital Fun Pack': 'fa-gamepad',
        'Party & Games Kit': 'fa-dice',
        'Digital Content Subscription': 'fa-digital-tachograph',
        'Experience Package': 'fa-star'
    };
    return icons[itemName] || 'fa-shopping-bag';
}

// Function to populate products in the order modal
function populateProductsGrid() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // Check if product system is available
    if (typeof productSystem === 'undefined') {
        console.error("ProductSystem not initialized!");
        return;
    }
    
    // Generate HTML for all products
    productsGrid.innerHTML = productSystem.generateProductHTML();
    
    // Initialize sale timers and update stock
    document.querySelectorAll('.product-card').forEach(card => {
        if (card.classList.contains('sale')) {
            startSaleTimer(card);
        }
        if (!card.classList.contains('subscription')) {
            updateProductStock(card);
        }
    });
    
    // Reattach event listeners
    attachProductEventListeners();
}

function startSaleTimer(productCard) {
    const timerElement = productCard.querySelector('.sale-timer');
    const saleTag = productCard.querySelector('.sale-tag');
    const itemId = productCard.querySelector('.add-to-cart').dataset.id;
    const saleKey = `sale_${itemId}`;
    
    let saleEndTime = localStorage.getItem(saleKey);
    if (!saleEndTime) {
        saleEndTime = new Date().getTime() + (5 * 60 * 1000); // (Minutes * Seconds * Milliseconds) = Total Milliseconds
        localStorage.setItem(saleKey, saleEndTime);
    }

    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = saleEndTime - now;

        if (timeLeft <= 0) {
            // Sale ended
            const priceElement = productCard.querySelector('.price');
            const originalPrice = productCard.querySelector('.add-to-cart').dataset.originalPrice;
            const priceContainer = productCard.querySelector('.price-container');
            
            // Remove sale-related elements and classes
            productCard.classList.remove('sale');
            timerElement.remove();
            if (saleTag) saleTag.remove();
            
            // Update price display
            if (priceContainer) {
                // If there's a price container, replace it with just the price
                priceContainer.innerHTML = `<p class="price">₱${originalPrice}</p>`;
            } else {
                priceElement.textContent = `₱${originalPrice}`;
            }
            
            // Update cart if item exists
            updateCartAfterSaleEnd(itemId, originalPrice);
            
            // Remove sale from localStorage
            localStorage.removeItem(saleKey);
            return;
        }

        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        timerElement.textContent = `Sale ends in: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        setTimeout(updateTimer, 1000);
    }

    updateTimer();
}

// Function to check if sale has ended for an item
function hasSaleEnded(itemId) {
    const saleKey = `sale_${itemId}`;
    const saleEndTime = localStorage.getItem(saleKey);
    if (!saleEndTime) return true;
    
    const now = new Date().getTime();
    return now >= parseInt(saleEndTime);
}

// Function to get current price based on sale status
function getCurrentPrice(itemId, salePrice, originalPrice) {
    if (hasSaleEnded(itemId)) {
        return originalPrice;
    }
    return salePrice;
}

// Function to update cart after sale ends
function updateCartAfterSaleEnd(itemId, originalPrice) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartUpdated = false;

    cart.forEach(item => {
        if (item.id === itemId) {
            item.price = parseInt(originalPrice);
            delete item.originalPrice;
            cartUpdated = true;
        }
    });

    if (cartUpdated) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        if (cartModal.style.display === 'block') {
            renderCart();
        }
    }
}

function AdjustFontSize(){
    document.querySelectorAll('.product-info h3').forEach(h3 => {
        const originalSize = parseFloat(getComputedStyle(h3).fontSize);
        let size = originalSize;
      
        while (h3.scrollHeight > h3.offsetHeight && size > 10) {
          size -= 0.5;
          h3.style.fontSize = size + 'px';
        }
      });
}

// Update stock display
function updateProductStock(productCard) {
    const stockElement = productCard.querySelector('.stock');
    if (!stockElement || !stockElement.dataset.baseStock) return; // Skip if no stock element or no base stock

    const baseStock = parseInt(stockElement.dataset.baseStock);
    const currentStock = generateRandomStock(baseStock);
    
    if (currentStock <= 0) {
        stockElement.textContent = 'Sold Out';
        stockElement.classList.add('sold-out');
        const addToCartBtn = productCard.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Sold Out';
        }
    } else {
        stockElement.textContent = `Stock: ${currentStock}`;
        stockElement.classList.remove('sold-out');
        const addToCartBtn = productCard.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'Add to Cart';
        }
    }
}

// Open modal when Order Now button is clicked
orderBtn.addEventListener('click', () => {
    // Populate products when opening modal
    populateProductsGrid();
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    AdjustFontSize(); // Adjust font so it doesnt look weird
    document.querySelectorAll('.product-card').forEach(updateProductStock);
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (card.classList.contains('sale')) {
            startSaleTimer(card);
        }
        if (!card.classList.contains('subscription')) {
            updateProductStock(card);
        }
    });

    // Initialize What We Offer carousel
    initOfferCarousel();
    
    // Add extra handling for the What We Offer section to prevent scrollbars
    const whatWeOfferSection = document.querySelector('#page3 .page-content');
    if (whatWeOfferSection) {
        whatWeOfferSection.classList.add('no-scrollbar');
        whatWeOfferSection.style.overflow = 'hidden';
        
        // Add resize listener to ensure scrollbars are hidden at all viewport sizes
        window.addEventListener('resize', function() {
            whatWeOfferSection.style.overflow = 'hidden';
        });
    }
});

// Attach event listeners to product buttons
function attachProductEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const stockElement = productCard.querySelector('.stock');
            if (stockElement && stockElement.textContent === 'Sold Out') {
                showCustomAlert('This item is sold out!', 'error');
                return;
            }

            const currentStock = parseInt(stockElement.textContent.split(': ')[1]);
            const id = this.dataset.id;
            const name = this.dataset.name;
            const salePrice = parseInt(this.dataset.price);
            const originalPrice = this.dataset.originalPrice ? parseInt(this.dataset.originalPrice) : salePrice;
            
            // Get image path from product system
            let imagePath = productCard.querySelector('.product-image img').src;
            if (typeof productSystem !== 'undefined') {
                const product = productSystem.getProductById(id);
                if (product) {
                    imagePath = product.imagePath;
                }
            }
            
            // Get current price based on sale status
            const currentPrice = getCurrentPrice(id, salePrice, originalPrice);
            
            // Check if item already exists in cart
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                if (existingItem.quantity >= currentStock) {
                    showCustomAlert('Cannot add more than available stock!', 'error');
                    return;
                }
                existingItem.quantity++;
                existingItem.price = currentPrice;
                if (!hasSaleEnded(id)) {
                    existingItem.originalPrice = originalPrice;
                } else {
                    delete existingItem.originalPrice;
                }
            } else {
                cart.push({ 
                    id, 
                    name, 
                    price: currentPrice,
                    quantity: 1, 
                    imagePath,
                    originalPrice: !hasSaleEnded(id) ? originalPrice : null
                });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            showCustomAlert('Added to cart!');
        });
    });
    
    // Subscribe buttons
    document.querySelectorAll('.subscribe-now').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            
            // Create query parameters for subscription
            const params = new URLSearchParams({
                type: 'subscription',
                id: id,
                name: name,
                price: price
            });
            
            // Clear cart when subscribing
            localStorage.removeItem('cart');
            window.location.href = `checkout.html?${params.toString()}`;
        });
    });
}

// Carousel for What We Offer section
function initOfferCarousel() {
    const offerItems = document.querySelectorAll('#page3 .offer-item');
    if (offerItems.length === 0) return;
    
    // Create carousel controls if they don't exist
    const pageContent = document.querySelector('#page3 .page-content');
    if (!document.querySelector('.carousel-controls')) {
        const controls = document.createElement('div');
        controls.className = 'carousel-controls';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-btn prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Previous item');
        
        // Dots container
        const dots = document.createElement('div');
        dots.className = 'carousel-dots';
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-btn next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Next item');
        
        // Create dots for each item
        offerItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            dot.setAttribute('data-index', index);
            dot.setAttribute('aria-label', `View item ${index + 1}`);
            dots.appendChild(dot);
        });
        
        // Add everything to controls
        controls.appendChild(prevBtn);
        controls.appendChild(dots);
        controls.appendChild(nextBtn);
        
        // Add controls to page
        pageContent.appendChild(controls);
        
        // Position the dots at bottom
        dots.style.position = 'absolute';
        dots.style.bottom = '-30px';
        dots.style.left = '50%';
        dots.style.transform = 'translateX(-50%)';
    }
    
    // Initialize state
    let currentSlide = 0;
    let isAnimating = false;
    let carouselInterval; // Keep track of the interval
    
    updateCarouselState();
    
    // Add event listeners
    const prevBtn = document.querySelector('#page3 .carousel-btn.prev');
    const nextBtn = document.querySelector('#page3 .carousel-btn.next');
    const dots = document.querySelectorAll('#page3 .carousel-dot');
    const controls = document.querySelector('.carousel-controls');
    
    // Function to restart the timer
    function resetAutoRotate() {
        // Clear existing interval
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
        
        // Start new timer
        startCarouselAutoRotate();
    }
    
    prevBtn.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        
        // Reset the timer when user clicks
        resetAutoRotate();
        
        // Add exit animation to current slide
        offerItems[currentSlide].classList.add('exit');
        
        setTimeout(() => {
            // After exit animation, update current slide
            offerItems[currentSlide].classList.remove('active', 'exit');
            currentSlide = (currentSlide - 1 + offerItems.length) % offerItems.length;
            updateCarouselState();
            isAnimating = false;
        }, 500); // Match this timing with CSS animation duration
    });
    
    nextBtn.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        
        // Reset the timer when user clicks
        resetAutoRotate();
        
        // Add exit animation to current slide
        offerItems[currentSlide].classList.add('exit');
        
        setTimeout(() => {
            // After exit animation, update current slide
            offerItems[currentSlide].classList.remove('active', 'exit');
            currentSlide = (currentSlide + 1) % offerItems.length;
            updateCarouselState();
            isAnimating = false;
        }, 500); // Match this timing with CSS animation duration
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isAnimating || currentSlide === index) return;
            isAnimating = true;
            
            // Reset the timer when user clicks
            resetAutoRotate();
            
            // Add exit animation to current slide
            offerItems[currentSlide].classList.add('exit');
            
            setTimeout(() => {
                // After exit animation, update to new slide
                offerItems[currentSlide].classList.remove('active', 'exit');
                currentSlide = index;
                updateCarouselState();
                isAnimating = false;
            }, 500);
        });
    });
    
    // Function to check window size and update display
    function checkWindowSize() {
        if (window.innerWidth > 1200) {
            // On larger screens, show all items and hide controls
            offerItems.forEach(item => {
                item.classList.remove('active', 'exit');
                item.style.display = 'block';
                item.style.opacity = '1';
            });
            controls.style.display = 'none';
        } else {
            // On smaller screens, use carousel and show controls
            controls.style.display = 'block';
            updateCarouselState();
        }
    }
    
    // Add responsive behavior
    window.addEventListener('resize', checkWindowSize);
    
    // Initial check for screen size
    checkWindowSize();
    
    // Auto-rotate carousel on smaller screens
    function startCarouselAutoRotate() {
        if (window.innerWidth <= 1200) {
            carouselInterval = setInterval(() => {
                if (document.visibilityState === 'visible' && !isAnimating) {
                    // Use the same animation pattern as the next button
                    isAnimating = true;
                    
                    // Add exit animation to current slide
                    offerItems[currentSlide].classList.add('exit');
                    
                    setTimeout(() => {
                        // After exit animation, update current slide
                        offerItems[currentSlide].classList.remove('active', 'exit');
                        currentSlide = (currentSlide + 1) % offerItems.length;
                        updateCarouselState();
                        isAnimating = false;
                    }, 500);
                }
            }, 8000); // Increase from 5000 to 8000 to give more time for viewing content
        }
    }
    
    function stopCarouselAutoRotate() {
        clearInterval(carouselInterval);
    }
    
    // Start auto-rotate
    startCarouselAutoRotate();
    
    // Pause on hover or touch
    pageContent.addEventListener('mouseenter', stopCarouselAutoRotate);
    pageContent.addEventListener('mouseleave', startCarouselAutoRotate);
    pageContent.addEventListener('touchstart', stopCarouselAutoRotate, {passive: true});
    pageContent.addEventListener('touchend', startCarouselAutoRotate);
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            startCarouselAutoRotate();
        } else {
            stopCarouselAutoRotate();
        }
    });
    
    // Function to update carousel state
    function updateCarouselState() {
        // First hide all items
        offerItems.forEach(item => {
            item.classList.remove('active');
            if (window.innerWidth <= 1200) {
                item.style.display = 'none';
                item.style.opacity = '0';
            }
        });
        
        // Show the current item
        offerItems[currentSlide].classList.add('active');
        if (window.innerWidth <= 1200) {
            offerItems[currentSlide].style.display = 'block';
            // Use setTimeout to trigger a smooth fade-in
            setTimeout(() => {
                offerItems[currentSlide].style.opacity = '1';
            }, 50);
        }
        
        // Update dots
        const dots = document.querySelectorAll('#page3 .carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        // Ensure no scrollbars appear
        const pageContent = document.querySelector('#page3 .page-content');
        if (pageContent) {
            pageContent.classList.add('no-scrollbar');
            pageContent.style.overflow = 'hidden';
        }
    }
}

// Cart functionality
const cartModal = document.getElementById('cartModal');
const cartIcon = document.getElementById('cartIcon');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartBadge = document.querySelector('.cart-badge');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartBadge();

// Open cart modal
cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderCart();
});

// Close cart modal
closeCartBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close cart modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Clear cart
clearCartBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        localStorage.removeItem('cart');
        updateCartBadge();
        renderCart();
    }
});

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'checkout.html';
});

// Update cart badge
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
}

// Render cart items
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotalElement.textContent = '₱0.00';
        return;
    }
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const originalPrice = item.originalPrice || item.price;
        const isDiscounted = originalPrice > item.price;
        const discountPercentage = isDiscounted ? Math.round(((originalPrice - item.price) / originalPrice) * 100) : 0;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.imagePath}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-unit-price">
                    ${isDiscounted ? `
                        <span class="original-price">₱${originalPrice.toFixed(2)}</span>
                        <span class="discounted-price">₱${item.price.toFixed(2)}</span>
                        <span class="discount-badge">-${discountPercentage}%</span>
                    ` : `
                        <span>₱${item.price.toFixed(2)}</span>
                    `}
                </div>
                <div class="cart-item-quantity">
                    <span>Quantity:</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-index="${index}">-</button>
                        <span class="cart-quantity-val">${item.quantity}</span>
                        <button class="quantity-btn increase" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="cart-item-total">₱${itemTotal.toFixed(2)}</div>
                <div class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);

    });

    cartTotalElement.textContent = `₱${total.toFixed(2)}`;

    // Add event listeners for quantity buttons and remove buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });

    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

function handleQuantityChange(e) {
    const index = parseInt(e.target.dataset.index);
    const item = cart[index];
    const productCard = document.querySelector(`.product-card [data-id="${item.id}"]`).closest('.product-card');
    const stockElement = productCard.querySelector('.stock');
    const currentStock = parseInt(stockElement.textContent.split(': ')[1]);

    if (e.target.classList.contains('decrease')) {
        if (item.quantity > 1) {
            item.quantity--;
        }
    } else if (e.target.classList.contains('increase')) {
        if (item.quantity < currentStock) {
            item.quantity++;
        } else {
            showCustomAlert('Cannot add more than available stock!', 'error');
            return;
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function handleRemoveItem(e) {
    const index = parseInt(e.target.closest('.cart-item-remove').dataset.index);
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function showCustomAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.innerHTML = `
        <div class="alert-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.classList.add('show'), 10);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

