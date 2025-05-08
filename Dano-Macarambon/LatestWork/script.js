// Get modal elements
const modal = document.getElementById('orderModal');
const orderBtn = document.querySelector('.btn-order');
const closeBtn = document.querySelector('.close');

function generateRandomStock(baseStock) {
    const variation = Math.floor(Math.random() * 16) - 10; // Random number between -10 and +5
    return Math.max(0, baseStock + variation);
}

function getItemIcon(itemName) {
    const icons = {
        'N.O.P.E. Anniversary Collector\'s Box': 'fa-box-open',
        'Digital Fun Pack': 'fa-gamepad',
        'Party & Games Kit': 'fa-dice',
        'Digital Content Subscription': 'fa-digital-tachograph',
        'Experience Package': 'fa-star'
    };
    return icons[itemName] || 'fa-shopping-bag';
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

// Initialize sale timers and stock updates
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
});

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
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
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

// Subscribe functionality
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

// Update add to cart functionality
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
        const imagePath = productCard.querySelector('.product-image img').src;
        
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

