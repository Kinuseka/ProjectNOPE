/**
 * Product System for NOPE E-Commerce
 * A noice framework to store and manage products for the NOPE website
 */

class ProductSystem {
    constructor() {
        this.products = [];
        this.defaultProducts = [
            // Regular Items
            {
                id: "1",
                name: "N.O.P.E. Anniversary Collector's Box",
                description: "Exclusive enamel pins, art prints, mini booklet, and hand-numbered badge",
                price: 1999,
                baseStock: 5,
                imagePath: "img/items/item-anniv_collector.png",
                type: "rare",
                icon: "fa-box-open"
            },
            {
                id: "2",
                name: "Digital Fun Pack",
                description: "Printable activities and video skits bundle",
                price: 699,
                originalPrice: 1999,
                baseStock: 20,
                imagePath: "img/items/item-funpack.png",
                type: "sale",
                icon: "fa-gamepad"
            },
            {
                id: "3",
                name: "Party & Games Kit",
                description: "Themed décor, DIY escape-room puzzles, trivia packs",
                price: 1500,
                baseStock: 15,
                imagePath: "img/items/item-partykit.png",
                type: "regular",
                icon: "fa-dice"
            },
            // Subscription Items
            {
                id: "4",
                name: "Digital Content Subscription",
                description: "Daily fun drops, mini-games, printable activities",
                price: 299,
                displayPrice: "₱299/month",
                imagePath: "img/items/subscription-ds.png",
                type: "subscription",
                icon: "fa-digital-tachograph"
            },
            {
                id: "5",
                name: "Experience Package",
                description: "Virtual party hosting, storytelling workshops",
                price: 1299,
                displayPrice: "₱1,299/month",
                imagePath: "img/items/subscription-ep.png",
                type: "subscription",
                icon: "fa-star"
            }
        ];
        
        this.loadProducts();
        console.log("ProductSystem initialized:", this.products);
    }

    loadProducts() {
        this.products = [...this.defaultProducts];
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Generate HTML for product display in the order modal
    generateProductHTML() {
        let html = '';
        
        this.products.forEach(product => {
            if (product.type === "subscription") {
                html += this.generateSubscriptionHTML(product);
            } else {
                html += this.generateProductCardHTML(product);
            }
        });
        
        return html;
    }
    
    generateProductCardHTML(product) {
        let html = `<div class="product-card ${product.type}">
            <div class="product-image">
                <img src="${product.imagePath}" alt="${product.name}">`;
                
        // Add special tags based on product type
        if (product.type === "rare") {
            html += `<div class="rare-tag">Limited</div>`;
        } else if (product.type === "sale") {
            html += `<div class="sale-tag">Sale</div>
                    <div class="sale-timer" data-end-time=""></div>`;
        }
        
        html += `</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>`;
        
        // Handle price display based on product type
        if (product.type === "sale") {
            html += `<div class="price-container">
                    <p class="original-price">₱${product.originalPrice}</p>
                    <p class="price">₱${product.price}</p>
                </div>`;
        } else {
            html += `<p class="price">₱${product.price}</p>`;
        }
        
        html += `<p class="stock" data-base-stock="${product.baseStock}">Stock: ${product.baseStock}</p>
                <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" 
                data-price="${product.price}"${product.originalPrice ? ` data-original-price="${product.originalPrice}"` : ''}>Add to Cart</button>
            </div>
        </div>`;
        
        return html;
    }
    
    generateSubscriptionHTML(product) {
        return `<div class="product-card subscription">
            <div class="product-image">
                <img src="${product.imagePath}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                <p class="price">${product.displayPrice}</p>
                <p class="subscription-label">Monthly Subscription</p>
                <button class="subscribe-now" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Subscribe Now</button>
            </div>
        </div>`;
    }
    
    addProduct(productData) {
        const existingIndex = this.products.findIndex(p => p.id === productData.id);
        
        if (existingIndex >= 0) {
            // Update existing product
            this.products[existingIndex] = {...productData};
        } else {
            // Add new product
            this.products.push({...productData});
        }
    }
    
    removeProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
    }
}

const productSystem = new ProductSystem(); 