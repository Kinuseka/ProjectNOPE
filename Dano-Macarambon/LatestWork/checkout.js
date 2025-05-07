// Get cart items from localStorage and subscription from URL parameters
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
const urlParams = new URLSearchParams(window.location.search);
const subscription = urlParams.get('type') === 'subscription' ? {
    id: urlParams.get('id'),
    name: urlParams.get('name'),
    price: parseInt(urlParams.get('price'))
} : null;

const cartItemsContainer = document.getElementById('cart-items');
const subtotalElement = document.getElementById('subtotal');
const vatElement = document.getElementById('vat');
const totalElement = document.getElementById('total');
const placeOrderBtn = document.getElementById('place-order');
const termsCheckbox = document.getElementById('terms');

function buttonToSubscription(){
    placeOrderBtn.textContent = "Subscribe" ;
}
function displayCartItems() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    let totalDiscount = 0;

    // Display regular cart items
    cartItems.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Check if item has original price (discounted item)
        const originalPrice = item.originalPrice ? item.originalPrice : item.price;
        const isDiscounted = originalPrice > item.price;
        const itemDiscount = isDiscounted ? (originalPrice - item.price) * item.quantity : 0;
        totalDiscount += itemDiscount;

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.imagePath}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">
                        <i class="fas ${getItemIcon(item.name)}"></i>
                        ${item.name}
                    </div>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-quantity">
                    <span>Quantity: ${item.quantity}</span>
                </div>
                ${isDiscounted ? `
                    <div class="cart-item-price-discount">
                        <span class="original-price">₱${originalPrice.toFixed(2)}</span>
                        <span class="discounted-price">₱${item.price.toFixed(2)}</span>
                    </div>
                ` : `
                    <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                `}
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
        subtotal += item.price * item.quantity;
    });

    // Display subscription if exists
    if (subscription) {
        buttonToSubscription();
        const subscriptionItem = document.createElement('div');
        subscriptionItem.className = 'cart-item subscription-item';
        subscriptionItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-details">
                    <div class="cart-item-name">
                        <i class="fas fa-sync-alt"></i>
                        ${subscription.name} (Monthly Subscription)
                    </div>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-price">₱${subscription.price.toFixed(2)}/month</div>
            </div>
        `;
        cartItemsContainer.appendChild(subscriptionItem);
        subtotal += subscription.price;
    }

    // Calculate VAT and total
    const vat = subtotal * 0.12;
    const total = subtotal + vat;

    // Update totals display
    subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    vatElement.textContent = `₱${vat.toFixed(2)}`;
    totalElement.textContent = `₱${total.toFixed(2)}`;

    // Add discount summary if there are discounted items
    if (totalDiscount > 0) {
        const discountElement = document.createElement('div');
        discountElement.className = 'discount-summary';
        discountElement.innerHTML = `
            <div class="discount-amount">
                <span>Total Savings:</span>
                <span>₱${totalDiscount.toFixed(2)}</span>
            </div>
        `;
        document.querySelector('.order-totals').insertBefore(
            discountElement,
            document.querySelector('.total')
        );
    }
}

// Helper function to get appropriate icon for items
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

// Handle terms checkbox
termsCheckbox.addEventListener('change', () => {
    placeOrderBtn.disabled = !termsCheckbox.checked;
});

// Handle place order button click
placeOrderBtn.addEventListener('click', () => {
    if (!termsCheckbox.checked) return;

    // Clear all cart and subscription data
    localStorage.removeItem('cart');
    sessionStorage.removeItem('subscription');
    
    // Show success message
    const checkoutContent = document.querySelector('.checkout-content');
    if (subscription){
        checkoutContent.innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <h2>Subscribed successfully!</h2>
            <p>You have officially subscribed to our services. Thank you for your purchase!</p>
            <p>Details will be delivered to your email address within 1-5 business days</p>
            <a href="index.html" class="btn-custom">Return to Home</a>
        </div>
        `;
        return;
    }
    checkoutContent.innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <h2>Order Success!</h2>
            <p>Thank you for your purchase.</p>
            <a href="index.html" class="btn-custom">Return to Home</a>
        </div>
    `;
});

// Initialize checkout page
displayCartItems(); 