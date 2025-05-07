// Get modal elements
const modal = document.getElementById('orderModal');
const orderBtn = document.querySelector('.btn-order');
const closeBtn = document.querySelector('.close');

// Function to generate random stock
function generateRandomStock(baseStock) {
    const variation = Math.floor(Math.random() * 16) - 10; // Random number between -10 and +5
    return Math.max(0, baseStock + variation);
}

// Sale timer functionality
function startSaleTimer(productCard) {
    const timerElement = productCard.querySelector('.sale-timer');
    const endTime = new Date().getTime() + (10 * 60 * 1000); // 10 minutes from now
    timerElement.dataset.endTime = endTime;

    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            // Sale ended
            const priceElement = productCard.querySelector('.price');
            const originalPrice = productCard.querySelector('.add-to-cart').dataset.originalPrice;
            priceElement.textContent = `₱${originalPrice}`;
            productCard.classList.remove('sale');
            timerElement.remove();
            return;
        }

        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        timerElement.textContent = `Sale ends in: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        setTimeout(updateTimer, 1000);
    }

    updateTimer();
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

// Update add to cart functionality to check stock
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
        const price = parseInt(this.dataset.price);
        const imagePath = productCard.querySelector('.product-image img').src;
        const originalPrice = this.dataset.originalPrice ? parseInt(this.dataset.originalPrice) : null;
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            if (existingItem.quantity >= currentStock) {
                showCustomAlert('Cannot add more than available stock!', 'error');
                return;
            }
            existingItem.quantity++;
        } else {
            cart.push({ 
                id, 
                name, 
                price, 
                quantity: 1, 
                imagePath,
                originalPrice 
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showCustomAlert('Added to cart!');
    });
}); 

