// Get cart items from localStorage and subscription from URL parameters
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
const urlParams = new URLSearchParams(window.location.search);
const subscription = urlParams.get('type') === 'subscription' ? {
    id: urlParams.get('id'),
    name: urlParams.get('name'),
    price: parseInt(urlParams.get('price'))
} : null;

// Debug output
console.log("Cart items loaded:", cartItems);
console.log("Subscription:", subscription);

const cartItemsContainer = document.getElementById('cart-items');
const subtotalElement = document.getElementById('subtotal');
const vatElement = document.getElementById('vat');
const totalElement = document.getElementById('total');
const placeOrderBtn = document.getElementById('place-order');
const termsCheckbox = document.getElementById('terms');
const voucherInput = document.getElementById('voucher-input');
const applyVoucherBtn = document.getElementById('apply-voucher');
const voucherMessageContainer = document.getElementById('voucher-message');
const appliedVoucherContainer = document.getElementById('applied-voucher-container');
const voucherDiscountContainer = document.getElementById('voucher-discount-container');
const voucherDiscountElement = document.getElementById('voucher-discount');

// Current applied voucher data
let currentVoucher = null;

// Function to check if sale has ended for an item
function hasSaleEnded(itemId) {
    const saleKey = `sale_${itemId}`;
    const saleEndTime = localStorage.getItem(saleKey);
    if (!saleEndTime) return true;
    
    const now = new Date().getTime();
    return now >= parseInt(saleEndTime);
}

function buttonToSubscription(){
    placeOrderBtn.textContent = "Subscribe" ;
}

// Check for applicable vouchers on page load
function checkForAutoApplicableVouchers() {
    if (typeof voucherSystem === 'undefined' || !voucherSystem) {
        console.error("VoucherSystem not initialized!");
        return;
    }
    
    // Only check for auto-applicable vouchers if no voucher is currently applied
    if (currentVoucher) return;
    
    // Make sure we're using the pre-tax amount for voucher eligibility
    console.log("Checking for applicable vouchers with pre-tax amount:", window.currentSubtotal);
    
    const applicableVouchers = voucherSystem.getApplicableVouchers(
        cartItems, 
        subscription !== null,
        subscription
    );
    
    console.log("Applicable vouchers:", applicableVouchers);
    
    if (applicableVouchers.length > 0) {
        // Sort vouchers by value (highest discount first)
        applicableVouchers.sort((a, b) => {
            // Calculate potential discount for each voucher
            let discountA = 0;
            let discountB = 0;
            
            if (a.type === 'percentDiscount') {
                const subtotal = window.currentSubtotal;
                discountA = (subtotal * a.value) / 100;
                if (a.maxDiscount && discountA > a.maxDiscount) {
                    discountA = a.maxDiscount;
                }
            }
            
            if (b.type === 'percentDiscount') {
                const subtotal = window.currentSubtotal;
                discountB = (subtotal * b.value) / 100;
                if (b.maxDiscount && discountB > b.maxDiscount) {
                    discountB = b.maxDiscount;
                }
            }
            
            return discountB - discountA;
        });
        
        // Set the best voucher as suggestion
        const bestVoucher = applicableVouchers[0];
        
        // Show a suggestion message
        voucherMessageContainer.innerHTML = `
            <div class="voucher-success">
                <p>You're eligible for a voucher! Try <strong>${bestVoucher.code}</strong> for ${bestVoucher.description}</p>
            </div>
        `;
    }
}

function displayCartItems() {
    // Check if cart is empty and there's no subscription
    if (cartItems.length === 0 && !subscription) {
        cartItemsContainer.innerHTML = `
            <div class="empty-checkout">
                <i class="fas fa-shopping-cart fa-3x"></i>
                <p>Your cart is empty</p>
                <a href="index.html" class="btn-custom">Return to Homepage</a>
            </div>
        `;
        // Hide voucher input when cart is empty
        document.querySelector('.voucher-input-container').style.display = 'none';
        // Hide order totals
        document.querySelector('.order-totals').style.display = 'none';
        // Hide terms checkbox
        document.querySelector('.terms-checkbox').style.display = 'none';
        // Disable place order button
        placeOrderBtn.disabled = true;
        return;
    }

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    let totalDiscount = 0;

    // Display regular cart items
    cartItems.forEach(item => {
        // Check if sale has ended for this item
        const saleEnded = hasSaleEnded(item.id);
        if (saleEnded && item.originalPrice) {
            item.price = item.originalPrice;
            delete item.originalPrice;
        }

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Check if item has original price (discounted item)
        const originalPrice = item.originalPrice || item.price;
        const isDiscounted = originalPrice > item.price;
        const itemDiscount = isDiscounted ? (originalPrice - item.price) * item.quantity : 0;
        totalDiscount += itemDiscount;
        
        // Calculate total price for this item
        const itemTotal = item.price * item.quantity;

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
                ${isDiscounted ? `
                <div class="cart-item-price-discount">
                    <span class="original-price">₱${originalPrice.toFixed(2)}</span>
                    <span class="discounted-price">₱${item.price.toFixed(2)}</span>
                </div>
                ` : `
                <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                `}
                <div class="cart-item-quantity">
                    <span class="quantity-label">× ${item.quantity}</span>
                </div>
                <div class="cart-item-total">
                    <span>₱${itemTotal.toFixed(2)}</span>
                </div>
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

    // Store the subtotal for voucher calculations (pre-tax amount)
    window.currentSubtotal = subtotal;
    console.log("Pre-tax subtotal for voucher eligibility:", subtotal);

    // Calculate VAT and total (initial calculation without voucher)
    calculateTotals(subtotal);

    // Add discount summary if there are discounted items
    if (totalDiscount > 0) {
        const discountElement = document.createElement('div');
        discountElement.className = 'discount-summary';
        discountElement.innerHTML = `
            <div class="discount-amount">
                <span>Total Savings:&nbsp;</span>
                <span>₱${totalDiscount.toFixed(2)}</span>
            </div>
        `;
        document.querySelector('.order-totals').insertBefore(
            discountElement,
            document.querySelector('.total')
        );
    }

    // Check for applicable vouchers
    checkForAutoApplicableVouchers();
}

// Calculate totals with proper application of vouchers and taxes
function calculateTotals(subtotal, voucherDiscount = 0) {
    // Store original subtotal for voucher eligibility (pre-tax)
    const originalSubtotal = subtotal;
    
    // Apply voucher discount if exists to pre-tax amount
    const discountedSubtotal = subtotal - voucherDiscount;
    
    // Calculate VAT on the discounted subtotal (tax applied after discount)
    const vat = discountedSubtotal * 0.12;
    const total = discountedSubtotal + vat;

    // Update totals display
    subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    
    // Show or hide voucher discount
    if (voucherDiscount > 0) {
        voucherDiscountContainer.style.display = 'flex';
        voucherDiscountElement.textContent = `-₱${voucherDiscount.toFixed(2)}`;
    } else {
        voucherDiscountContainer.style.display = 'none';
    }
    
    vatElement.textContent = `₱${vat.toFixed(2)}`;
    totalElement.textContent = `₱${total.toFixed(2)}`;
    
    return { subtotal: originalSubtotal, voucherDiscount, vat, total };
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

// Handle voucher application
function applyVoucher() {
    const code = voucherInput.value.trim().toUpperCase();
    if (!code) {
        showVoucherMessage('Please enter a voucher code', 'error');
        return;
    }
    
    console.log("Applying voucher code:", code);

    // Check if voucherSystem is available
    if (typeof voucherSystem === 'undefined' || !voucherSystem) {
        console.error("VoucherSystem not initialized!");
        showVoucherMessage('Voucher system is not available. Please try again later.', 'error');
        return;
    }

    // Clear any existing voucher first
    if (currentVoucher) {
        removeVoucher();
    }

    // Ensure we're using the pre-tax subtotal for voucher eligibility
    const preVatSubtotal = window.currentSubtotal;
    console.log("Using pre-tax subtotal for voucher validation:", preVatSubtotal);

    // Use the voucher system to validate and apply the voucher
    const result = voucherSystem.applyVoucher(
        code, 
        cartItems, 
        subscription !== null,
        subscription
    );
    
    console.log("Voucher application result:", result);

    if (result.success) {
        // Store current voucher
        currentVoucher = {
            code: result.code,
            discount: result.discount,
            description: result.voucher.description,
            icon: result.voucher.icon
        };

        // Show success message
        showVoucherMessage(`Voucher applied successfully! You saved ₱${result.discount.toFixed(2)}`, 'success');
        
        // Display applied voucher
        displayAppliedVoucher(currentVoucher);
        
        // Recalculate totals using pre-tax subtotal
        calculateTotals(preVatSubtotal, currentVoucher.discount);
        
        // Clear input
        voucherInput.value = '';
    } else {
        // Show error message
        showVoucherMessage(result.message, 'error');
        
        // Check for alternative vouchers
        const applicableVouchers = voucherSystem.getApplicableVouchers(
            cartItems, 
            subscription !== null,
            subscription
        );
        
        if (applicableVouchers.length > 0) {
            // Show alternative voucher suggestion
            const bestVoucher = applicableVouchers[0];
            
            // Create suggestion element
            const suggestionEl = document.createElement('div');
            suggestionEl.className = 'voucher-suggestion';
            suggestionEl.innerHTML = `
                <p>Try <strong>${bestVoucher.code}</strong> instead for ${bestVoucher.description}</p>
                <button class="try-suggested-voucher">Use this code</button>
            `;
            voucherMessageContainer.appendChild(suggestionEl);
            
            // Add click handler for the suggestion button
            suggestionEl.querySelector('.try-suggested-voucher').addEventListener('click', () => {
                voucherInput.value = bestVoucher.code;
                applyVoucher();
            });
        }
        
        // Make sure no discount is applied
        calculateTotals(preVatSubtotal, 0);
    }
}

// Display applied voucher
function displayAppliedVoucher(voucher) {
    appliedVoucherContainer.innerHTML = `
        <div class="applied-voucher">
            <div class="applied-voucher-header">
                <div class="applied-voucher-title">
                    <div class="applied-voucher-icon">
                        <i class="fas ${voucher.icon}"></i>
                    </div>
                    <div class="applied-voucher-code">${voucher.code}</div>
                </div>
                <button class="remove-voucher" id="remove-voucher">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
            <div class="applied-voucher-description">${voucher.description}</div>
            <div class="applied-voucher-discount">-₱${voucher.discount.toFixed(2)}</div>
        </div>
    `;

    // Add event listener to remove button
    document.getElementById('remove-voucher').addEventListener('click', removeVoucher);
}

// Remove applied voucher
function removeVoucher() {
    // Clear current voucher
    currentVoucher = null;
    
    // Clear applied voucher display
    appliedVoucherContainer.innerHTML = '';
    
    // Recalculate totals without voucher (using pre-tax subtotal)
    calculateTotals(window.currentSubtotal, 0);
    
    // Clear voucher message
    voucherMessageContainer.innerHTML = '';
    
    // Re-check for auto-applicable vouchers
    checkForAutoApplicableVouchers();
}

// Show voucher success/error message
function showVoucherMessage(message, type) {
    voucherMessageContainer.innerHTML = `
        <div class="voucher-${type}">
            <p>${message}</p>
        </div>
    `;
}

// Handle terms checkbox
termsCheckbox.addEventListener('change', () => {
    placeOrderBtn.disabled = !termsCheckbox.checked;
});

// Handle voucher application
applyVoucherBtn.addEventListener('click', applyVoucher);

// Handle voucher input on Enter key
voucherInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        applyVoucher();
    }
});

// Handle place order button click
placeOrderBtn.addEventListener('click', () => {
    if (!termsCheckbox.checked) return;

    // Mark voucher as used if one was applied
    if (currentVoucher) {
        voucherSystem.markVoucherAsUsed(currentVoucher.code);
    }

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

// Function to check for soon-to-expire vouchers
function checkForExpiringVouchers() {
    if (typeof voucherSystem === 'undefined' || !voucherSystem) {
        console.error("VoucherSystem not initialized for expiry check!");
        return;
    }
    
    const vouchers = voucherSystem.getAllVouchers();
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    // Find vouchers expiring in the next 24 hours
    const expiringVouchers = Object.values(vouchers).filter(voucher => {
        const expiryDate = new Date(voucher.expiry);
        const timeUntilExpiry = expiryDate - now;
        return timeUntilExpiry > 0 && timeUntilExpiry <= oneDayInMs;
    });
    
    // If we have expiring vouchers and no banner exists yet, show banner
    if (expiringVouchers.length > 0 && !document.querySelector('.expiring-voucher-banner')) {
        // Sort by closest to expiry
        expiringVouchers.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
        const mostUrgentVoucher = expiringVouchers[0];
        
        // Create banner
        const banner = document.createElement('div');
        banner.className = 'expiring-voucher-banner';
        banner.innerHTML = `
            <div class="expiring-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>Voucher <strong>${mostUrgentVoucher.code}</strong> expires today! ${mostUrgentVoucher.description}</p>
            </div>
            <button class="use-expiring-voucher">Use Voucher</button>
            <button class="close-banner"><i class="fas fa-times"></i></button>
        `;
        
        // Add to page
        document.querySelector('.checkout-container').prepend(banner);
        
        // Add event listeners
        banner.querySelector('.use-expiring-voucher').addEventListener('click', () => {
            voucherInput.value = mostUrgentVoucher.code;
            applyVoucher();
            banner.remove();
        });
        
        banner.querySelector('.close-banner').addEventListener('click', () => {
            banner.remove();
        });
    }
}

// Initialize checkout page
displayCartItems();
checkForAutoApplicableVouchers();
checkForExpiringVouchers(); 