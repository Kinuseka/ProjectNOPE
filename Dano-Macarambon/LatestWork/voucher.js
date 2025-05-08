/**
 * Voucher System for NOPE E-Commerce
 * A framework for voucher systems for the NOPE lol
 * To make things easier for myself
 */

class VoucherSystem {
    constructor() {
        this.vouchers = {};
        this.defaultVouchers = [
            {
                code: 'SAVE20',
                type: 'percentDiscount',
                value: 20,
                minPurchase: 2500,
                maxDiscount: 200,
                description: '10% off for purchases over ₱2500 (max ₱200)',
                eligibleItems: 'all',
                excludeSaleItems: true,
                excludeSubscription: true,
                expiryDays: 30,
                isOneTime: false,
                icon: 'fa-percent'
            },
            {
                code: 'PARTY50',
                type: 'percentDiscount',
                value: 50,
                minQuantity: 4,
                eligibleItems: 'Party & Games Kit',
                description: '50% off when buying 4 or more Party & Games Kits',
                excludeSubscription: true,
                expiryDays: 15,
                isOneTime: false,
                icon: 'fa-gift'
            },
            {
                code: 'STUDENT20',
                type: 'percentDiscount',
                value: 30,
                minQuantity: 1,
                eligibleItems: 'School Supplies Kit',
                description: 'All School Supplies Kit 30% off (min. purchase 2999)',
                excludeSaleItems: true,
                minPurchase: 2999,
                excludeSubscription: true,
                expiryDays: 30,
                isOneTime: false,
                icon: 'fa-graduation-cap'
            },
            {
                code: 'TEMPE2025',
                type: 'percentDiscount',
                value: 5,
                eligibleItems: 'all',
                description: 'Tempe 2nd anniversary sponsorship 5% off',
                excludeSaleItems: true,
                minPurchase: 4000,
                maxDiscount: 2500,
                excludeSubscription: true,
                expiryDays: 30,
                isOneTime: false,
                icon: 'fa-ticket'
            },
            {
                code: 'FIRST100',
                type: 'percentDiscount',
                value: 100,
                eligibleItems: 'subscription',
                description: '100% off your first subscription!',
                expiryDays: 7,
                isOneTime: true,
                icon: 'fa-star'
            },
            {
                code: 'TIME10',
                type: 'percentDiscount',
                value: 10,
                minPurchase: 3000,
                maxDiscount: 1000,
                description: '10% off when spending ₱3000+ (max ₱1000)',
                eligibleItems: 'all',
                excludeSaleItems: true,
                excludeSubscription: true,
                expiryDays: 3,
                isOneTime: false,
                icon: 'fa-clock'
            }
        ];
        this.loadVouchers();
        console.log("VoucherSystem initialized:", this.vouchers);
        
        // Force update vouchers on page load
        this.updateVouchers();
    }

    loadVouchers() {
        const savedVouchers = localStorage.getItem('vouchers'); //pre-load in memory vouchers
        
        if (savedVouchers) {
            try {
                this.vouchers = JSON.parse(savedVouchers);
                console.log("Loaded vouchers from localStorage:", this.vouchers);
                
                if (Object.keys(this.vouchers).length === 0) {
                    this.createDefaultVouchers();
                }
            } catch (e) {
                console.error("Error parsing saved vouchers:", e);
                this.createDefaultVouchers();
            }
        } else {
            console.log("No saved vouchers found, creating defaults");
            this.createDefaultVouchers();
        }
    }
    updateVouchers() {
        const now = new Date();
        let updated = false;
        
        Object.keys(this.vouchers).forEach(code => {
            const voucher = this.vouchers[code];
            if (new Date(voucher.expiry) < now) {
                console.log(`Removing expired voucher: ${code}`);
                delete this.vouchers[code];
                updated = true;
            }
        });
        this.defaultVouchers.forEach(voucherConfig => {
            if (!this.voucherExists(voucherConfig.code)) {
                const voucherData = { ...voucherConfig };
                delete voucherData.code;
                delete voucherData.expiryDays;
                
                this.addVoucher(voucherConfig.code, {
                    ...voucherData,
                    expiry: this.getExpiryDate(voucherConfig.expiryDays)
                });
                updated = true;
            }
        });

        if (updated) {
            this.saveVouchers();
        }
    }

    createDefaultVouchers() {
        this.defaultVouchers.forEach(voucherConfig => {
            const voucherData = { ...voucherConfig };
            delete voucherData.code;
            delete voucherData.expiryDays;
            
            this.addVoucher(voucherConfig.code, {
                ...voucherData,
                expiry: this.getExpiryDate(voucherConfig.expiryDays || 30)
            });
        });
    }

    getExpiryDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date;
    }

    addVoucher(code, details) {
        this.vouchers[code] = {
            ...details,
            code: code,
            used: this.getUsedVouchers()[code] || false
        };
        this.saveVouchers();
    }

    voucherExists(code) {
        return !!this.vouchers[code];
    }

    getAllVouchers() {
        return this.vouchers;
    }
    getUsedVouchers() {
        try {
            return JSON.parse(localStorage.getItem('usedVouchers')) || {};
        } catch (e) {
            console.error("Error parsing used vouchers:", e);
            return {};
        }
    }

    saveVouchers() {
        try {
            localStorage.setItem('vouchers', JSON.stringify(this.vouchers));
            console.log("Vouchers saved to localStorage");
        } catch (e) {
            console.error("Error saving vouchers to localStorage:", e);
        }
    }

    markVoucherAsUsed(code) {
        const usedVouchers = this.getUsedVouchers();
        usedVouchers[code] = true;
        localStorage.setItem('usedVouchers', JSON.stringify(usedVouchers));
        
        if (this.vouchers[code]) {
            this.vouchers[code].used = true;
            this.saveVouchers();
        }
    }

    validateVoucher(code, cart, isSubscription = false, subscriptionData = null) {
        code = code.trim().toUpperCase();
        console.log("Validating voucher:", code, "Cart:", cart, "Is Subscription:", isSubscription);
        if (!this.voucherExists(code)) {
            console.log("Voucher does not exist:", code);
            return { 
                valid: false, 
                message: 'Invalid voucher code' 
            };
        }

        const voucher = this.vouchers[code];
        
        if (new Date() > new Date(voucher.expiry)) {
            console.log("Voucher expired:", code);
            return { 
                valid: false, 
                message: 'Voucher has expired' 
            };
        }

        if (voucher.isOneTime && voucher.used) {
            console.log("One-time voucher already used:", code);
            return { 
                valid: false, 
                message: 'This voucher can only be used once' 
            };
        }

        if (isSubscription && voucher.excludeSubscription) {
            console.log("Item voucher not applicable to subscription:", code);
            return { 
                valid: false, 
                message: 'This voucher cannot be applied to subscriptions' 
            };
        }

        if (voucher.eligibleItems === 'subscription') {
            if (!isSubscription) {
                console.log("Subscription voucher used on non-subscription order:", code);
                return { 
                    valid: false, 
                    message: 'This voucher is only valid for subscriptions' 
                };
            }
            if (!subscriptionData || !subscriptionData.name || !subscriptionData.price) {
                console.log("Invalid subscription data for voucher:", code);
                return {
                    valid: false,
                    message: 'Invalid subscription data'
                };
            }
            
            console.log("Subscription voucher valid:", code);
            return { valid: true, voucher };
        }
        
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            console.log("Empty cart for voucher:", code);
            return {
                valid: false,
                message: 'Your cart is empty'
            };
        }
        let totalAmount;
        if (voucher.excludeSaleItems) {
            const nonSaleItems = cart.filter(item => !item.originalPrice);
            totalAmount = nonSaleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            console.log("Non-sale items total for voucher validation:", totalAmount);
            if (nonSaleItems.length === 0) {
                return {
                    valid: false,
                    message: 'This voucher requires non-sale items'
                };
            }
        } else {
            totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            console.log("Cart total for voucher validation:", totalAmount);
        }
        if (voucher.minPurchase && totalAmount < voucher.minPurchase) {
            const amountType = voucher.excludeSaleItems ? 'non-sale items' : 'purchase';
            console.log("Minimum purchase not met:", totalAmount, "<", voucher.minPurchase);
            return { 
                valid: false, 
                message: `Minimum ${amountType} of ₱${voucher.minPurchase.toFixed(2)} required (currently ₱${totalAmount.toFixed(2)})` 
            };
        }

        if (voucher.eligibleItems !== 'all' && voucher.minQuantity) {
            const eligibleItems = cart.filter(item => item.name === voucher.eligibleItems);
            
            if (eligibleItems.length === 0) {
                console.log("Required item not in cart:", voucher.eligibleItems);
                return {
                    valid: false,
                    message: `This voucher requires "${voucher.eligibleItems}" in your cart`
                };
            }
            
            const totalQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
            console.log("Eligible item quantity:", totalQuantity, "Required:", voucher.minQuantity);
            
            if (totalQuantity < voucher.minQuantity) {
                return { 
                    valid: false, 
                    message: `Requires ${voucher.minQuantity} ${voucher.eligibleItems} (you have ${totalQuantity})` 
                };
            }
        }

        console.log("Voucher valid:", code);
        return { valid: true, voucher };
    }

    applyVoucher(code, cart, isSubscription = false, subscriptionData = null) {
        console.log("Applying voucher:", code);

        const validation = this.validateVoucher(code, cart, isSubscription, subscriptionData);
        
        if (!validation.valid) {
            console.log(`Voucher "${code}" not applied: ${validation.message}`);
            return {
                success: false,
                message: validation.message
            };
        }

        const voucher = validation.voucher;
        let discount = 0;
        let affectedItems = [];

        try {
            if (voucher.type === 'percentDiscount') {
                if (isSubscription && subscriptionData) {
                    discount = (subscriptionData.price * voucher.value) / 100;
                    affectedItems.push({
                        name: subscriptionData.name,
                        discount: discount
                    });
                } 
                else if (voucher.eligibleItems !== 'all') {
                    cart.forEach(item => {
                        if (item.name === voucher.eligibleItems) {
                            const itemDiscount = (item.price * item.quantity * voucher.value) / 100;
                            discount += itemDiscount;
                            affectedItems.push({
                                name: item.name,
                                discount: itemDiscount
                            });
                        }
                    });
                } 
                else {
                    if (voucher.excludeSaleItems) {
                        const nonSaleItems = cart.filter(item => !item.originalPrice);
                        const subtotal = nonSaleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        discount = (subtotal * voucher.value) / 100;
                        
                        affectedItems = nonSaleItems.map(item => {
                            const itemTotal = item.price * item.quantity;
                            const itemDiscount = itemTotal * (voucher.value / 100);
                            
                            return {
                                name: item.name,
                                discount: itemDiscount
                            };
                        });
                    } else {
                        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        discount = (subtotal * voucher.value) / 100;
                        
                        const discountRatio = discount / subtotal;
                        affectedItems = cart.map(item => {
                            const itemTotal = item.price * item.quantity;
                            const itemDiscount = itemTotal * (voucher.value / 100);
                            const adjustedDiscount = Math.min(itemDiscount, itemTotal * discountRatio);
                            
                            return {
                                name: item.name,
                                discount: adjustedDiscount
                            };
                        });
                    }
                    
                }
            }
            // Apply cap if exists
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                console.log(`Discount capped at ₱${voucher.maxDiscount} (was ₱${discount.toFixed(2)})`);
                discount = voucher.maxDiscount;
            }
            
            if (isNaN(discount) || discount < 0) {
                throw new Error("Invalid discount calculation");
            }
            
            console.log(`Voucher "${code}" applied successfully. Discount: ₱${discount.toFixed(2)}`);
            
            return {
                success: true,
                code: code,
                discount: discount,
                affectedItems: affectedItems,
                voucher: voucher
            };
            
        } catch (error) {
            console.error("Error applying voucher:", error);
            return {
                success: false,
                message: "An error occurred while applying the voucher."
            };
        }
    }

    getApplicableVouchers(cart, isSubscription = false, subscriptionData = null) {
        const applicableVouchers = [];
        
        for (const code in this.vouchers) {
            const validation = this.validateVoucher(code, cart, isSubscription, subscriptionData);
            if (validation.valid) {
                applicableVouchers.push(this.vouchers[code]);
            }
        }
        
        return applicableVouchers;
    }
}
const voucherSystem = new VoucherSystem(); 