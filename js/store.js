
const PHILIPPINE_LOGISTICS_REGIONS = {
    "Pampanga": {
        zone: "Zone 1 - Pampanga Local",
        zoneCode: "250",
        deliveryFee: 250.00,
        cities: [
            { name: "Candaba", defaultZip: "2013", barangays: ["Pasig", "Mandasig", "Bahay Pare", "San Agustin", "Tagulod", "Poblacion", "Dulong Ilog"] },
            { name: "Angeles City", defaultZip: "2009", barangays: ["Pulung Maragul", "Balibago", "Cutcut", "Anunas", "Malabanias", "Sto. Domingo"] },
            { name: "San Fernando (Capital)", defaultZip: "2000", barangays: ["Dolores", "Sindalan", "San Agustin", "Telabastagan", "Quebiawan"] },
            { name: "Mabalacat City (Clark)", defaultZip: "2010", barangays: ["Clark Freeport Zone", "Dau", "Mabiga", "Camachiles", "Dolores"] },
            { name: "Guagua", defaultZip: "2003", barangays: ["San Matias", "Sta. Ines", "Siran", "Plaza Burgos"] },
            { name: "Mexico", defaultZip: "2021", barangays: ["Lagundi", "Parian", "San Antonio", "San Vicente"] },
            { name: "Arayat", defaultZip: "2012", barangays: ["Poblacion", "San Juan", "Gatiawin", "Cacutud"] },
            { name: "Lubao", defaultZip: "2005", barangays: ["Sta. Cruz", "Prado Siongco", "San Nicolas"] },
            { name: "Bacolor", defaultZip: "2001", barangays: ["Cabambangan", "San Vicente", "Cabalantian"] }
        ]
    },
    "Bulacan": {
        zone: "Zone 2 - Central Luzon",
        zoneCode: "450",
        deliveryFee: 450.00,
        cities: [
            { name: "Baliuag", defaultZip: "3006", barangays: ["Poblacion", "Bagong Nayon", "Concepcion", "Subic", "Tarcan"] },
            { name: "Malolos City", defaultZip: "3000", barangays: ["Catmon", "Dakila", "Guinhawa", "Mojon", "Sumapang Matanda"] },
            { name: "San Jose del Monte", defaultZip: "3023", barangays: ["Tungkong Mangga", "Muzon", "Graceville", "Kaypian"] },
            { name: "Meycauayan City", defaultZip: "3020", barangays: ["Calvario", "Bancal", "Camalig", "Perez"] },
            { name: "Marilao", defaultZip: "3019", barangays: ["Ibayo", "Lias", "Saog", "Tabing Ilog"] },
            { name: "Plaridel", defaultZip: "3004", barangays: ["Banga 1st", "Banga 2nd", "Parulan", "Agnaya"] }
        ]
    },
    "Tarlac": {
        zone: "Zone 2 - Central Luzon",
        zoneCode: "450",
        deliveryFee: 450.00,
        cities: [
            { name: "Tarlac City", defaultZip: "2300", barangays: ["San Roque", "San Vicente", "Matatalaib", "Sepung Calzada"] },
            { name: "Capas (New Clark City)", defaultZip: "2315", barangays: ["O'Donnell", "Cutcut", "Sto. Domingo", "Cristo Rey"] },
            { name: "Concepcion", defaultZip: "2316", barangays: ["San Nicolas", "Alfonso", "Sta. Rita", "Green Village"] }
        ]
    },
    "Bataan": {
        zone: "Zone 2 - Central Luzon",
        zoneCode: "450",
        deliveryFee: 450.00,
        cities: [
            { name: "Balanga City", defaultZip: "2100", barangays: ["Poblacion", "Cupang North", "Doña Francisca", "Tuyo"] },
            { name: "Dinalupihan", defaultZip: "2110", barangays: ["San Ramon", "Luacan", "Roosevelt", "Layac"] },
            { name: "Mariveles", defaultZip: "2105", barangays: ["Alas-asin", "Baseco Country", "Maligaya"] }
        ]
    },
    "Nueva Ecija": {
        zone: "Zone 2 - Central Luzon",
        zoneCode: "450",
        deliveryFee: 450.00,
        cities: [
            { name: "Cabanatuan City", defaultZip: "3100", barangays: ["Kapitan Pepe", "San Josef", "Barrera", "Zulueta"] },
            { name: "Gapan City", defaultZip: "3105", barangays: ["San Vicente", "Bungo", "Mangino", "Sto. Niño"] },
            { name: "San Jose City", defaultZip: "3121", barangays: ["Malasin", "Caanawan", "Sto. Niño"] }
        ]
    },
    "Metro Manila (NCR)": {
        zone: "Zone 3 - Greater Metro Manila",
        zoneCode: "650",
        deliveryFee: 650.00,
        cities: [
            { name: "Taguig City (BGC)", defaultZip: "1634", barangays: ["Fort Bonifacio (BGC)", "Ususan", "Western Bicutan", "Pinagsama"] },
            { name: "Quezon City", defaultZip: "1100", barangays: ["Diliman", "Loyola Heights", "New Manila", "Batasan Hills", "Commonwealth"] },
            { name: "Makati City", defaultZip: "1200", barangays: ["Bel-Air", "Poblacion", "San Lorenzo", "Urdaneta", "Salcedo Village"] },
            { name: "Pasig City", defaultZip: "1600", barangays: ["Ortigas Center", "San Antonio", "Kapitolyo", "Ugong"] },
            { name: "Mandaluyong City", defaultZip: "1550", barangays: ["Wack-Wack", "Highway Hills", "Plainview", "Barangka"] },
            { name: "Manila City", defaultZip: "1000", barangays: ["Malate", "Ermita", "Binondo", "Sampaloc", "Sta. Mesa"] },
            { name: "Parañaque City", defaultZip: "1700", barangays: ["BF Homes", "Don Bosco", "Moonwalk", "San Antonio"] },
            { name: "Muntinlupa City (Alabang)", defaultZip: "1780", barangays: ["Alabang (Ayala Alabang)", "Cupang", "Sucat", "Poblacion"] }
        ]
    }
};

if (typeof window !== "undefined") window.PHILIPPINE_LOGISTICS_REGIONS = PHILIPPINE_LOGISTICS_REGIONS;
if (typeof module !== "undefined") module.exports = { PHILIPPINE_LOGISTICS_REGIONS };

// EcoHaven Furniture — Live Cloud-First Store & Firebase Realtime Database Sync
// Primary Source of Truth: Firebase Cloud Database (Priority 1) -> LocalStorage Backup (Priority 2)

const ECOHAVEN_DEFAULT_PRODUCT = {
    id: 'tetratable-mahogany',
    name: 'TetraTable Multifunctional 4-in-1 Suite',
    price: 6934.00,
    downPaymentPrice: 3467.00,
    wood: '100% Solid Philippine Mahogany',
    finish: 'Natural Polished Mahogany',
    location: 'Candaba, Pampanga',
    quantity: 1,
    image: 'tetratable_luxury_living_room_1793454407629.jpg'
};

const INITIAL_FALLBACK_ORDERS = {
    "EH-2026-88123": {
        orderId: "EH-2026-88123",
        customerName: "Juan Dela Cruz",
        phone: "+63 917 555 1234",
        email: "juan.delacruz@email.ph",
        address: "Lot 14 Blk 5, Mahogany Hills, Angeles City, Pampanga, 2009",
        destinationZone: "Zone 1: Candaba Local & Pampanga",
        deliveryFee: 250.00,
        stage: 3,
        stageName: "Precision Joinery Assembly & Hand Sanding",
        orderStatus: "In Production",
        paymentMode: "fifty",
        downPaymentPaid: 3717.00,
        balanceDue: 3467.00,
        totalAmount: 7184.00,
        gcashRef: "9021-8841-2910",
        items: [
            {
                productId: "tetratable-mahogany",
                name: "TetraTable 4-in-1 Suite",
                finish: "Natural Polished Mahogany",
                quantity: 1,
                unitPrice: 6934.00
            }
        ],
        createdAt: "2026-10-31T14:40:00Z"
    },
    "EH-2026-88130": {
        orderId: "EH-2026-88130",
        customerName: "Teresa Mendoza",
        phone: "+63 918 987 6543",
        email: "teresa.mendoza@email.ph",
        address: "Block 4, Lot 12, Villa Gloria, San Fernando, Pampanga",
        destinationZone: "Zone 1: Candaba Local & Pampanga",
        deliveryFee: 250.00,
        stage: 1,
        stageName: "50% Down Payment Submitted (Pending Verification)",
        orderStatus: "Pending Review",
        paymentMode: "fifty",
        downPaymentPaid: 3717.00,
        balanceDue: 3467.00,
        totalAmount: 7184.00,
        gcashRef: "7721-3904-8112",
        items: [
            {
                productId: "tetratable-mahogany",
                name: "TetraTable 4-in-1 Suite",
                finish: "Natural Polished Mahogany",
                quantity: 1,
                unitPrice: 6934.00
            }
        ],
        createdAt: "2026-11-01T08:10:00Z"
    },
    "EH-2026-88145": {
        orderId: "EH-2026-88145",
        customerName: "Atty. Rafael Henson",
        phone: "+63 920 441 9922",
        email: "rafael.henson@clarklaw.ph",
        address: "Clark Sun Valley Estate, Clark Freeport Zone, Pampanga",
        destinationZone: "Zone 1: Candaba Local & Pampanga",
        deliveryFee: 250.00,
        stage: 1,
        stageName: "50% Down Payment Submitted (Pending Verification)",
        orderStatus: "Pending Review",
        paymentMode: "fifty",
        downPaymentPaid: 3717.00,
        balanceDue: 3467.00,
        totalAmount: 7184.00,
        gcashRef: "8104-5519-6320",
        items: [
            {
                productId: "tetratable-mahogany",
                name: "TetraTable 4-in-1 Suite",
                finish: "Dark Smoked Walnut",
                quantity: 1,
                unitPrice: 6934.00
            }
        ],
        createdAt: "2026-11-01T09:30:00Z"
    }
};


const DEFAULT_SAVED_ADDRESSES = [
    {
        id: "addr-candaba",
        label: "Home (Candaba Estate)",
        recipientName: "Paolo Magisa",
        phone: "09812558028",
        email: "paomagisa@gmail.com",
        address: "Dalan Batu, Pasig, Candaba, Pampanga, 2013, Philippines",
        zone: "Zone 1 - Pampanga Local",
        zoneCode: "250",
        deliveryFee: 250.00,
        isDefault: true
    },
    {
        id: "addr-clark",
        label: "Office (Clark Freeport)",
        recipientName: "Paolo Magisa",
        phone: "09812558028",
        email: "paomagisa@gmail.com",
        address: "Bldg 4, Clark Sun Valley Estate, Jose Abad Santos Ave, Clark Freeport Zone, Pampanga, 2023",
        zone: "Zone 1 - Pampanga Local",
        zoneCode: "250",
        deliveryFee: 250.00,
        isDefault: false
    },
    {
        id: "addr-bgc",
        label: "Manila Residence",
        recipientName: "Paolo Magisa",
        phone: "09812558028",
        email: "paomagisa@gmail.com",
        address: "Unit 24B, Pacific Plaza Towers, 4th Ave, Bonifacio Global City, Taguig, 1634 Metro Manila",
        zone: "Zone 3 - Greater Metro Manila",
        zoneCode: "650",
        deliveryFee: 650.00,
        isDefault: false
    }
];


const DEFAULT_INVENTORY = {
    products: {
        "tetratable-4in1": {
            id: "tetratable-4in1",
            name: "TetraTable 4-in-1 Suite",
            category: "Modular Transformable",
            units: 14,
            price: 44900,
            downPayment: 22450,
            status: "Ready",
            wood: "Philippine Mahogany (11.4% MC)",
            image: "tetratable_luxury_living_room_1793454407629.jpg"
        },
        "santos-butterfly": {
            id: "santos-butterfly",
            name: "Santos Butterfly Dining",
            category: "Dining Suite",
            units: 6,
            price: 52000,
            downPayment: 26000,
            status: "Ready",
            wood: "Kiln-Dried Narra & Teak",
            image: "santos_butterfly_dining_luxury_pampanga_home_1773454409000.png"
        },
        "tetralift-table": {
            id: "tetralift-table",
            name: "TetraLift Coffee Table",
            category: "Lifting Table",
            units: 4,
            price: 38500,
            downPayment: 19250,
            status: "Ready",
            wood: "Solid Mahogany & Gas Strut",
            image: "tetralift_coffee_dining_luxury_pampanga_home_1773454409000.png"
        },
        "hexaring-round": {
            id: "hexaring-round",
            name: "HexaRing Round Dining",
            category: "Round Expandable",
            units: 3,
            price: 49800,
            downPayment: 24900,
            status: "Low",
            wood: "Candaba Narra Inlay",
            image: "hexaring_round_dining_luxury_pampanga_home_1773454409000.png"
        },
        "transformer-console": {
            id: "transformer-console",
            name: "Transformer Console",
            category: "Console Table",
            units: 5,
            price: 46000,
            downPayment: 23000,
            status: "Ready",
            wood: "Philippine Mahogany & Steel",
            image: "transformer_table_luxury_living_room_1773454409000.png"
        },
        "beeswax-care-kit": {
            id: "beeswax-care-kit",
            name: "Botanical Beeswax & Care",
            category: "Care Kit",
            units: 52,
            price: 1200,
            downPayment: 600,
            status: "Stocked",
            wood: "Organic Beeswax Polish",
            image: "wood_care_kit_luxury_pampanga_home_1773454409000.png"
        },
        "prod-pampanga-credenza---console": {
            id: "prod-pampanga-credenza---console",
            name: "Pampanga Credenza & Console",
            category: "Modular Transformable",
            units: 5,
            price: 44900,
            downPayment: 22450,
            status: "Ready",
            wood: "Philippine Mahogany (11.4% MC)",
            image: "tetratable_luxury_living_room_1793454407629.jpg"
        },
        "stool-mahogany": {
            id: "stool-mahogany",
            name: "Artisan Solid Mahogany Low Stool",
            category: "Stools & Seating",
            units: 24,
            price: 1450,
            downPayment: 725,
            status: "Ready",
            wood: "Philippine Mahogany (Solignum Treated)",
            image: "Picture4.png"
        },
        "cushion-pack-4": {
            id: "cushion-pack-4",
            name: "Orthopedic High-Density Linen Cushions (Set of 4)",
            category: "Add-ons & Accessories",
            units: 30,
            price: 1250,
            downPayment: 625,
            status: "Stocked",
            wood: "High-Density Foam & Linen",
            image: "Picture3.png"
        },
        "wood-care-kit": {
            id: "wood-care-kit",
            name: "Natural Beeswax & Barnis Wood Maintenance Kit",
            category: "Care Kit",
            units: 45,
            price: 580,
            downPayment: 290,
            status: "Stocked",
            wood: "Organic Beeswax Balm & Cloth",
            image: "candaba-wood-care-kit.jpg"
        },
        "ecowax-polish": {
            id: "ecowax-polish",
            name: "EcoWax Botanical Polish",
            category: "Care Kit",
            units: 40,
            price: 450,
            downPayment: 225,
            status: "Stocked",
            wood: "100g Candelilla & Beeswax",
            image: "ecowax-botanical-polish.jpg"
        }
    },
    materials: {
        "ph-mahogany": {
            id: "ph-mahogany",
            name: "Philippine Mahogany",
            quantity: 1450,
            unit: "BF",
            status: "11.4% MC • Safe",
            grade: "FSC Certified Kiln Dried",
            batch: "PMP-2026-ND-491"
        },
        "solignum-barrier": {
            id: "solignum-barrier",
            name: "Solignum Barrier",
            quantity: 35,
            unit: "Liters",
            status: "Anti-Termite",
            grade: "Marine Preservative",
            batch: "SLG-2026-B12"
        },
        "pioneer-epoxy": {
            id: "pioneer-epoxy",
            name: "Pioneer Epoxy",
            quantity: 28,
            unit: "Sets",
            status: "High Tensile",
            grade: "Structural Adhesive",
            batch: "PNR-2026-088"
        },
        "polished-barnis": {
            id: "polished-barnis",
            name: "Polished Barnis",
            quantity: 42,
            unit: "Cans",
            status: "Protective Sheen",
            grade: "Zero-VOC Natural Resin",
            batch: "BRN-2026-104"
        },
        "bubble-wrap": {
            id: "bubble-wrap",
            name: "Bubble Wrap & Tape",
            quantity: 18,
            unit: "Rolls",
            status: "Heavy-Duty",
            grade: "Export Impact Packaging",
            batch: "BBL-2026-04"
        }
    }
};

class EcoHavenStore {
    constructor() {
        this.db = window.ecoHavenDb;
        this.cart = this.loadCart();
        this.orders = this.loadInitialOrders();
        this.users = {};
        this.addresses = this.loadAddresses();
        this.inventory = this.loadInitialInventory();
        this.drawerPaymentMode = 'fifty'; // 'fifty' or 'full'
        this.init();
    }

    init() {
        console.log("🪵 EcoHaven Store: Initializing Cloud-First Data Layer...");
        this.updateCartBadge();
        this.setupRealtimeSync();
        this.setupGlobalCartDrawer();
        this.setupResponsiveMobileShell();
    }

    loadInitialOrders() {
        try {
            const cached = localStorage.getItem('ecohaven_cloud_orders_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Object.keys(parsed).length > 0) return parsed;
            }
        } catch (e) {
            console.warn("Storage read error:", e);
        }
        return { ...INITIAL_FALLBACK_ORDERS };
    }

    // 1. REALTIME FIREBASE DATABASE SYNC (CLOUD FIRST)
    setupRealtimeSync() {
        if (window.ecoHavenDb) {
            const ordersRef = window.ecoHavenDb.ref('ecohaven/orders');
            ordersRef.on('value', (snapshot) => {
                const cloudOrders = snapshot.val();
                if (cloudOrders && Object.keys(cloudOrders).length > 0) {
                    this.orders = cloudOrders;
                    console.log("☁️ EcoHaven: Real-time Cloud Orders Synced:", Object.keys(cloudOrders).length, "orders active.");
                    this.saveLocalBackup('ecohaven_cloud_orders_cache', cloudOrders);
                } else {
                    console.log("☁️ Firebase orders node empty, seeding default workshop state...");
                    ordersRef.set(this.orders);
                }
                window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));
            }, (error) => {
                console.warn("⚠️ Firebase listen warning:", error.message);
                this.fallbackToLocalOrders();
            });

            // Sync Workshop Telemetry
            const telemetryRef = window.ecoHavenDb.ref('ecohaven/telemetry');
            telemetryRef.on('value', (snap) => {
                const tel = snap.val();
                if (tel && tel.kilnMoistureContent) {
                    const telElements = document.querySelectorAll('.kiln-telemetry-text');
                    telElements.forEach(el => {
                        el.innerText = `🟢 Live Candaba Workshop Telemetry • Kiln Moisture: ${tel.kilnMoistureContent} • DTI Reg. ${tel.dtiRegistration}`;
                    });
                }
            });

            
            // Sync Saved Delivery Addresses
            const addressesRef = window.ecoHavenDb.ref('ecohaven/addresses');
            addressesRef.on('value', (snap) => {
                const cloudAddrs = snap.val();
                if (cloudAddrs && Array.isArray(cloudAddrs) && cloudAddrs.length > 0) {
                    this.addresses = cloudAddrs;
                    this.saveLocalBackup('ecohaven_saved_addresses', cloudAddrs);
                    console.log("📍 EcoHaven: Real-time Saved Addresses Synced:", cloudAddrs.length, "addresses.");
                } else {
                    addressesRef.set(DEFAULT_SAVED_ADDRESSES);
                }
                window.dispatchEvent(new CustomEvent('ecohaven_addresses_updated', { detail: this.addresses }));
            });

            // Sync Workshop Inventory & Finished Products
            const invRef = window.ecoHavenDb.ref('ecohaven/inventory');
            invRef.on('value', (snap) => {
                const cloudInv = snap.val();
                if (cloudInv && (cloudInv.products || cloudInv.materials)) {
                    if (!this.inventory) this.inventory = {};
                    if (cloudInv.products) this.inventory.products = cloudInv.products;
                    if (cloudInv.materials) this.inventory.materials = cloudInv.materials;
                    this.saveLocalBackup('ecohaven_inventory_cache', this.inventory);
                    console.log("🪵 EcoHaven: Real-time Workshop Inventory Synced.");
                } else {
                    console.log("🪵 Seeding default workshop inventory to Firebase...");
                    invRef.set(DEFAULT_INVENTORY);
                }
                window.dispatchEvent(new CustomEvent('ecohaven_inventory_updated', { detail: this.inventory }));
            });


            // Sync Users
            const usersRef = window.ecoHavenDb.ref('ecohaven/users');
            usersRef.on('value', (snap) => {
                const cloudUsers = snap.val();
                if (cloudUsers) {
                    this.users = cloudUsers;
                    console.log("👤 EcoHaven: Real-time Users Synced:", Object.keys(cloudUsers).length, "users active.");
                }
            });
        } else {
            this.fallbackToLocalOrders();
        }
    }

    fallbackToLocalOrders() {
        console.log("💾 Operating on LocalStorage fallback.");
        try {
            const local = localStorage.getItem('ecohaven_cloud_orders_cache');
            if (local) {
                this.orders = JSON.parse(local);
            }
        } catch (e) {
            this.orders = { ...INITIAL_FALLBACK_ORDERS };
        }
        window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));
    }

    saveLocalBackup(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn("LocalStorage quota or access restriction:", e);
        }
    }

    getOrder(identifier) {
        if (!identifier) return null;
        const clean = identifier.trim().toLowerCase();
        
        // Sync latest orders from localStorage if available
        try {
            const raw = localStorage.getItem('ecohaven_orders');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    this.orders = Object.assign({}, parsed, this.orders);
                }
            }
        } catch(e) {}

        // 1. Exact match on Order ID
        for (const id in this.orders) {
            if (id.toLowerCase() === clean) {
                return this.orders[id];
            }
        }

        // 2. Alphanumeric match (ignoring dashes/spaces, e.g. "EH20268841" or "8841")
        const cleanAlphaNum = clean.replace(/[^a-z0-9]/g, '');
        for (const id in this.orders) {
            const idAlphaNum = id.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (idAlphaNum === cleanAlphaNum || (cleanAlphaNum.length >= 4 && idAlphaNum.endsWith(cleanAlphaNum))) {
                return this.orders[id];
            }
        }

        // 3. Customer mobile number match
        const cleanDigits = clean.replace(/[^0-9]/g, '');
        if (cleanDigits.length >= 7) {
            for (const id in this.orders) {
                const ord = this.orders[id];
                const phoneDigits = (ord.phone || ord.customerPhone || '').replace(/[^0-9]/g, '');
                if (phoneDigits && phoneDigits.includes(cleanDigits)) {
                    return ord;
                }
            }
        }

        // Return null if not found (Never return dummy/example order fallback)
        return null;
    }

    // 2. ORDER SUBMISSION (SAVES DIRECTLY TO CLOUD FIREBASE)
    async submitOrder(orderData) {
        const orderId = orderData.orderId || ('EH-2026-' + Math.floor(10000 + Math.random() * 90000));
        orderData.orderId = orderId;
        orderData.createdAt = orderData.createdAt || new Date().toISOString();
        orderData.orderStatus = orderData.orderStatus || 'Pending Review';
        orderData.stage = orderData.stage || 1;
        orderData.stageName = orderData.stageName || '50% Down Payment Submitted (Pending Verification)';
        orderData.totalAmount = orderData.totalAmount || 7184.00;
        orderData.items = orderData.items || [
            {
                productId: 'tetratable-mahogany',
                name: 'TetraTable 4-in-1 Suite',
                finish: 'Natural Polished Mahogany',
                quantity: 1,
                unitPrice: 6934.00
            }
        ];

        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/orders/' + orderId).set(orderData);
                console.log("✅ Order successfully written to Firebase Cloud Database:", orderId);
            } catch (err) {
                console.warn("Firebase write failed, saving to local cache:", err.message);
            }
        }

        this.orders[orderId] = orderData;
        this.saveLocalBackup('ecohaven_cloud_orders_cache', this.orders);
        localStorage.setItem('ecohaven_last_order_id', orderId);
        window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));

        return orderId;
    }

    // 3. CRAFTSMAN PAYMENT APPROVAL (UPDATES CLOUD FIREBASE LIVE)
    async approveOrderPayment(orderId) {
        const updates = {
            'orderStatus': 'In Production',
            'stage': 2,
            'stageName': 'Mahogany Lumber Cut & Solignum Treated',
            'updatedAt': new Date().toISOString()
        };

        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/orders/' + orderId).update(updates);
                console.log("✅ Order", orderId, "approved in Firebase Cloud Database!");
            } catch (err) {
                console.error("Firebase update error:", err);
            }
        }

        if (this.orders[orderId]) {
            this.orders[orderId].orderStatus = 'In Production';
            this.orders[orderId].stage = 2;
            this.orders[orderId].stageName = 'Mahogany Lumber Cut & Solignum Treated';
            this.saveLocalBackup('ecohaven_cloud_orders_cache', this.orders);
            window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));
        }
    }

    // 4. ADVANCE ORDER TO NEXT STAGE
    async advanceOrderStage(orderId, nextStage, nextStageName) {
        const updates = {
            'stage': nextStage,
            'stageName': nextStageName,
            'updatedAt': new Date().toISOString()
        };

        if (nextStage >= 4) {
            updates.orderStatus = 'In Transit';
        }
        if (nextStage === 5) {
            updates.orderStatus = 'Delivered & Complete';
        }

        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/orders/' + orderId).update(updates);
            } catch (err) {
                console.error("Firebase advance error:", err);
            }
        }

        if (this.orders[orderId]) {
            Object.assign(this.orders[orderId], updates);
            this.saveLocalBackup('ecohaven_cloud_orders_cache', this.orders);
            window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));
        }
    }

    // ==========================================================
    // WORKSHOP INVENTORY & REJECTION WORKFLOW
    // ==========================================================
    loadInitialInventory() {
        try {
            const cached = localStorage.getItem('ecohaven_inventory_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && (parsed.products || parsed.materials)) return parsed;
            }
        } catch(e) {}
        return JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
    }

    async addProduct(productData) {
        if (!productData.id) {
            productData.id = 'prod-' + (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : Date.now());
        }
        if (!this.inventory.products) this.inventory.products = {};
        this.inventory.products[productData.id] = productData;
        
        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/inventory/products/' + productData.id).set(productData);
                console.log("✅ Product added to Firebase RTDB:", productData.name);
            } catch(e) {
                console.warn("Firebase addProduct warning:", e);
            }
        }
        this.saveLocalBackup('ecohaven_inventory_cache', this.inventory);
        window.dispatchEvent(new CustomEvent('ecohaven_inventory_updated', { detail: this.inventory }));
        return productData;
    }

    async updateProductStock(productId, deltaOrQty, isDelta = true) {
        if (!this.inventory.products || !this.inventory.products[productId]) return;
        const prod = this.inventory.products[productId];
        if (isDelta) {
            prod.units = Math.max(0, (parseInt(prod.units) || 0) + deltaOrQty);
        } else {
            prod.units = Math.max(0, parseInt(deltaOrQty) || 0);
        }
        prod.status = prod.units === 0 ? "Out of Stock" : (prod.units <= 3 ? "Low" : "Ready");
        
        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/inventory/products/' + productId).update({
                    units: prod.units,
                    status: prod.status
                });
            } catch(e) {
                console.warn("Firebase updateStock warning:", e);
            }
        }
        this.saveLocalBackup('ecohaven_inventory_cache', this.inventory);
        window.dispatchEvent(new CustomEvent('ecohaven_inventory_updated', { detail: this.inventory }));
    }

    async addOrRestockMaterial(materialData) {
        if (!materialData.id) {
            materialData.id = 'mat-' + (materialData.name ? materialData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : Date.now());
        }
        if (!this.inventory.materials) this.inventory.materials = {};
        
        if (this.inventory.materials[materialData.id] && materialData.addQuantity) {
            const current = parseFloat(this.inventory.materials[materialData.id].quantity) || 0;
            this.inventory.materials[materialData.id].quantity = current + parseFloat(materialData.addQuantity);
            if (materialData.batch) this.inventory.materials[materialData.id].batch = materialData.batch;
        } else {
            this.inventory.materials[materialData.id] = materialData;
        }
        
        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/inventory/materials/' + materialData.id).set(this.inventory.materials[materialData.id]);
                console.log("✅ Material logged in Firebase RTDB:", materialData.name);
            } catch(e) {
                console.warn("Firebase material warning:", e);
            }
        }
        this.saveLocalBackup('ecohaven_inventory_cache', this.inventory);
        window.dispatchEvent(new CustomEvent('ecohaven_inventory_updated', { detail: this.inventory }));
        return this.inventory.materials[materialData.id];
    }

    // Craftsman Rejection with Specific Reason & Guidance
    async flagOrderPayment(orderId, { reason, code, notes }) {
        const ord = this.orders[orderId] || this.getOrder(orderId);
        if (!ord) return;

        const updates = {
            orderStatus: "Payment Flagged (Action Required)",
            stage: 1,
            stageName: "Payment Flagged: " + (reason || "Action Required"),
            rejectionReason: reason || "Unverified Payment Proof",
            rejectionCode: code || "invalid_reference",
            rejectionNotes: notes || "Please re-upload a clear transaction screenshot.",
            flaggedAt: new Date().toISOString()
        };

        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/orders/' + orderId).update(updates);
                console.log("⚠️ Order", orderId, "flagged with reason in Firebase RTDB:", reason);
            } catch (err) {
                console.error("Firebase flag error:", err);
            }
        }

        Object.assign(ord, updates);
        this.saveLocalBackup('ecohaven_cloud_orders_cache', this.orders);
        window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));
        return ord;
    }

    // Customer Resubmission of Payment Proof
    async resubmitPaymentProof(orderId, { reference, receiptFile, note }) {
        const ord = this.orders[orderId] || this.getOrder(orderId);
        if (!ord) return;

        const updates = {
            orderStatus: "Pending Review",
            stage: 1,
            stageName: "Resubmitted Payment Proof (Under Review)",
            rejectionReason: "",
            rejectionNotes: "",
            rejectionCode: "",
            gcashRef: reference || ord.gcashRef,
            resubmittedAt: new Date().toISOString(),
            customerResubmitNote: note || "Resubmitted by customer"
        };
        if (receiptFile) {
            updates.receiptFile = receiptFile;
        }

        if (window.ecoHavenDb) {
            try {
                await window.ecoHavenDb.ref('ecohaven/orders/' + orderId).update(updates);
                console.log("🔄 Order", orderId, "resubmitted in Firebase RTDB!");
            } catch (err) {
                console.error("Firebase resubmit error:", err);
            }
        }

        Object.assign(ord, updates);
        this.saveLocalBackup('ecohaven_cloud_orders_cache', this.orders);
        window.dispatchEvent(new CustomEvent('ecohaven_orders_updated', { detail: this.orders }));
        return ord;
    }

    // ==========================================================
    // 5. CART & ORDER QUEUE STATE MANAGEMENT
    // ==========================================================
    loadCart() {
        try {
            const saved = localStorage.getItem('ecohaven_cart');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('ecohaven_cart', JSON.stringify(this.cart));
            this.updateCartBadge();
            this.renderCartDrawer();
            window.dispatchEvent(new CustomEvent('ecohaven_cart_updated', { detail: this.cart }));
        } catch (e) {
            console.error("Storage error:", e);
        }
    }

    getCartSubtotal() {
        if (!this.cart || this.cart.length === 0) return 0;
        return this.cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (item.quantity || 1)), 0);
    }

    getCartDownpayment() {
        return this.getCartSubtotal() / 2;
    }

    updateCartBadge() {
        const count = this.cart ? this.cart.length : 0;
        const badges = document.querySelectorAll('#cartBadge, .cart-count-badge');
        badges.forEach(b => {
            b.innerText = count;
            b.style.display = count > 0 ? 'flex' : 'none';
        });
        const mobileBadge = document.getElementById('mobileBottomCartBadge');
        if (mobileBadge) {
            mobileBadge.innerText = count;
            mobileBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // DYNAMIC ADD TO ORDER QUEUE: Always adds item & ALWAYS opens the slide drawer
    addToCart(item) {
        if (!item) return;

        // Normalize item object if string/number arguments passed
        let newItem = {};
        if (typeof item === 'string') {
            const name = arguments[0];
            const price = parseFloat(arguments[1]) || 6934;
            const meta = arguments[2] || 'Candaba Workshop Handcrafted';
            newItem = {
                id: 'item-' + Date.now(),
                name: name,
                price: price,
                downPaymentPrice: price / 2,
                finish: meta,
                wood: 'Solid Philippine Hardwood',
                quantity: 1,
                image: ''
            };
        } else {
            newItem = {
                id: item.id || ('item-' + Date.now()),
                name: item.name || 'Handcrafted Candaba Piece',
                price: parseFloat(item.price) || 6934,
                downPaymentPrice: (parseFloat(item.price) || 6934) / 2,
                finish: item.finish || 'Natural Finish',
                wood: item.wood || '100% Solid Philippine Mahogany',
                quantity: item.quantity || 1,
                image: item.image || ''
            };
        }

        this.cart.push(newItem);
        this.saveCart();

        // Trigger Toast Notification
        window.showEcoHavenToast(`✨ "${newItem.name}" added to your Order Queue!`, 'success');

        // ALWAYS open the Order Queue drawer when an item is added
        this.openCartDrawer();
    }

    removeFromCart(index) {
        if (index >= 0 && index < this.cart.length) {
            const removed = this.cart.splice(index, 1);
            this.saveCart();
            window.showEcoHavenToast(`Removed "${removed[0]?.name || 'Item'}" from Order Queue`, 'info');
        }
    }

    // ==========================================================
    // 6. SLIDE-OUT ORDER QUEUE DRAWER COMPONENT
    // ==========================================================
    setupGlobalCartDrawer() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const initDrawer = () => {
            // Check if global drawer already exists
            if (document.getElementById('cartDrawer') && document.getElementById('cartDrawerBackdrop')) {
                this.bindExistingDrawer();
                return;
            }

            const isPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            const checkoutUrl = isPages ? 'checkout.html' : 'pages/checkout.html';
            const imgPath = isPages ? '../assets/images/' : 'assets/images/';

            const drawerHtml = `
            <!-- GLOBAL SLIDE-OUT Order Queue DRAWER -->
            <div id="cartDrawerBackdrop" onclick="window.ecohaven.closeCartDrawer()" class="fixed inset-0 z-[9998] bg-inverse-surface/60 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none"></div>
            <div id="cartDrawer" class="fixed top-0 right-0 z-[9999] w-full sm:w-[480px] h-full bg-surface-container-lowest shadow-2xl flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <!-- Drawer Header -->
                <div class="p-space-md bg-surface-container-low flex items-center justify-between border-b border-outline-variant/30">
                    <div class="flex items-center gap-space-xs">
                        <span class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                        </span>
                        <div>
                            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">Workshop Order Queue</h3>
                            <span class="font-caption text-caption text-on-surface-variant">Dalan Batu, Pasig Fabrication Queue</span>
                        </div>
                    </div>
                    <button aria-label="Close Order Queue" class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface transition-transform active:scale-90" onclick="window.ecohaven.closeCartDrawer()">
                        <span class="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <!-- Drawer Body: Cart Items List -->
                <div class="p-space-md flex-1 overflow-y-auto space-y-space-md" id="cartDrawerScrollArea">
                    <div id="cartDrawerItemsList" class="space-y-space-sm">
                        <!-- Dynamic items injected here -->
                    </div>

                    <!-- Payment Modality Toggle -->
                    <div class="p-space-md rounded-xl bg-surface-container">
                        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider block mb-2 font-semibold">Payment Settlement Modality</span>
                        <label class="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest cursor-pointer mb-2 border border-primary/20">
                            <div class="flex items-center gap-space-xs">
                                <input checked class="accent-primary w-4 h-4 cursor-pointer" name="globalDrawerPaymentOption" onchange="window.ecohaven.setDrawerPaymentMode('fifty')" type="radio" value="fifty"/>
                                <div>
                                    <span class="font-label-md text-label-md text-on-surface font-bold block">50% Earnest Down Payment</span>
                                    <span class="font-caption text-caption text-on-surface-variant">Remaining 50% due upon white-glove inspection</span>
                                </div>
                            </div>
                            <span class="font-label-md text-label-md text-primary font-bold" id="drawerHalfAmountDisplay">₱3,467.00</span>
                        </label>
                        <label class="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest cursor-pointer border border-outline-variant/30">
                            <div class="flex items-center gap-space-xs">
                                <input class="accent-primary w-4 h-4 cursor-pointer" name="globalDrawerPaymentOption" onchange="window.ecohaven.setDrawerPaymentMode('full')" type="radio" value="full"/>
                                <div>
                                    <span class="font-label-md text-label-md text-on-surface font-bold block">100% Full Payment</span>
                                    <span class="font-caption text-caption text-on-surface-variant">Priority bench queue + free wood care balm</span>
                                </div>
                            </div>
                            <span class="font-label-md text-label-md text-on-surface font-bold" id="drawerFullAmountDisplay">₱6,934.00</span>
                        </label>
                    </div>

                    <!-- Workshop Compliance Seals -->
                    <div class="space-y-1.5 p-space-xs rounded-lg bg-surface-container-low text-caption font-caption text-on-surface-variant">
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                            <span>DTI Registered Candaba Workshop (#4918230)</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px] text-tertiary">local_shipping</span>
                            <span>Direct Workshop Delivery: Pampanga, Bulacan, Clark, NCR</span>
                        </div>
                    </div>
                </div>

                <!-- Drawer Footer -->
                <div class="p-space-md bg-surface-container-low border-t border-outline-variant/30">
                    <div class="flex items-baseline justify-between mb-space-sm">
                        <span class="font-label-md text-label-md text-on-surface-variant font-medium">Due Today at Reservation:</span>
                        <span class="font-headline-md text-headline-md text-primary font-bold" id="drawerDueAmount">₱3,467.00</span>
                    </div>
                    <a id="drawerCheckoutBtn" href="${checkoutUrl}" class="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-on-primary-fixed text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98">
                        <span>Proceed to Logistics & Checkout →</span>
                    </a>
                    <p class="text-center font-caption text-caption text-on-surface-variant mt-2">
                        Philippine Hardwood Joinery • 50% Earnest Escrow Guarantee
                    </p>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', drawerHtml);
            this.bindExistingDrawer();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDrawer);
        } else {
            initDrawer();
        }
    }

    bindExistingDrawer() {
        const backdrop = document.getElementById('cartDrawerBackdrop') || document.getElementById('cart-drawer-backdrop') || document.getElementById('cart-drawer-overlay');
        if (backdrop) {
            backdrop.onclick = () => this.closeCartDrawer();
        }
        // Listen for ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeCartDrawer();
        });
        this.renderCartDrawer();
    }

    setDrawerPaymentMode(mode) {
        this.drawerPaymentMode = mode;
        this.renderCartDrawer();
    }

    openCartDrawer() {
        this.renderCartDrawer();
        const drawer = document.getElementById('cartDrawer') || document.getElementById('cart-drawer') || document.getElementById('cart-drawer-panel');
        const backdrop = document.getElementById('cartDrawerBackdrop') || document.getElementById('cart-drawer-backdrop') || document.getElementById('cart-drawer-overlay');
        
        if (drawer && backdrop) {
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            backdrop.classList.add('opacity-100', 'pointer-events-auto');
            drawer.classList.remove('translate-x-full');
            drawer.classList.add('translate-x-0');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCartDrawer() {
        const drawer = document.getElementById('cartDrawer') || document.getElementById('cart-drawer') || document.getElementById('cart-drawer-panel');
        const backdrop = document.getElementById('cartDrawerBackdrop') || document.getElementById('cart-drawer-backdrop') || document.getElementById('cart-drawer-overlay');
        
        if (drawer && backdrop) {
            backdrop.classList.remove('opacity-100', 'pointer-events-auto');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
            drawer.classList.remove('translate-x-0');
            drawer.classList.add('translate-x-full');
            document.body.style.overflow = '';
        }
    }

    renderCartDrawer() {
        const listContainer = document.getElementById('cartDrawerItemsList') || document.getElementById('cart-items-container');
        const isPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
        const defaultImg = isPages ? '../assets/images/product pic.png' : 'assets/images/product pic.png';

        const hasFurniture = this.cart.some(item => (parseFloat(item.price) || 0) >= 3000);
        if (!hasFurniture && this.cart.length > 0) {
            this.drawerPaymentMode = 'full';
        }

        const subtotal = this.getCartSubtotal();
        const half = subtotal / 2;
        const dueAmount = (this.drawerPaymentMode === 'fifty' && hasFurniture) ? half : subtotal;

        // Update displays
        const dueDisplay = document.getElementById('drawerDueAmount');
        if (dueDisplay) dueDisplay.innerText = this.cart.length === 0 ? '₱0.00' : `₱${dueAmount.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        const halfDisplay = document.getElementById('drawerHalfAmountDisplay');
        if (halfDisplay) halfDisplay.innerText = this.cart.length === 0 ? '₱0.00' : `₱${half.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        const fullDisplay = document.getElementById('drawerFullAmountDisplay');
        if (fullDisplay) fullDisplay.innerText = this.cart.length === 0 ? '₱0.00' : `₱${subtotal.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        const cartSubtotalEl = document.getElementById('cart-subtotal');
        if (cartSubtotalEl) cartSubtotalEl.innerText = `₱${subtotal.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        const cartTotalEl = document.getElementById('cart-total');
        if (cartTotalEl) cartTotalEl.innerText = `₱${subtotal.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        if (!listContainer) return;

        const drawerBtn = document.getElementById('drawerCheckoutBtn');
        if (drawerBtn) {
            if (this.cart.length === 0) {
                drawerBtn.href = isPages ? 'shop.html' : 'pages/shop.html';
                drawerBtn.className = "w-full py-3.5 px-4 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98";
                drawerBtn.innerHTML = `<span>Explore Collection Catalog →</span>`;
            } else {
                drawerBtn.href = isPages ? 'checkout.html' : 'pages/checkout.html';
                drawerBtn.className = "w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-on-primary-fixed text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98";
                drawerBtn.innerHTML = `<span>Proceed to Logistics & Checkout →</span>`;
            }
        }

        if (this.cart.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8 text-on-surface-variant">
                    <span class="material-symbols-outlined text-[36px] text-outline mb-2">shopping_bag</span>
                    <p class="font-body-md text-sm">Your Order Queue is empty.</p>
                    <p class="font-caption text-xs text-outline mt-1">Explore our handcrafted Candaba furniture pieces.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.cart.map((item, idx) => {
            const itemPrice = parseFloat(item.price) || 6934;
            const itemHalf = itemPrice / 2;
            const imgUrl = item.image ? (item.image.startsWith('http') || item.image.startsWith('.') ? item.image : (isPages ? '../assets/images/' + item.image : 'assets/images/' + item.image)) : defaultImg;

            return `
            <div class="p-space-sm rounded-xl bg-surface-container-low flex gap-space-sm items-center border border-outline-variant/30">
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    <img class="w-full h-full object-cover" src="${imgUrl}" alt="${item.name}" onerror="this.src='${defaultImg}'"/>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-1">
                        <h4 class="font-label-md text-label-md text-on-surface font-bold truncate">${item.name}</h4>
                        <span class="font-label-md text-label-md text-primary font-bold flex-shrink-0">₱${itemPrice.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                    </div>
                    <span class="font-caption text-caption text-on-surface-variant block mt-0.5 truncate">${item.finish || item.wood || '100% Solid Philippine Hardwood'}</span>
                    <div class="flex items-center justify-between mt-1">
                        ${(itemPrice < 3000)
    ? `<span class="text-[11px] font-semibold text-tertiary flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Paid in Full (No DP needed)</span>`
    : `<span class="text-[11px] font-semibold text-tertiary">50% DP: ₱${itemHalf.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>`}
                        <button type="button" class="text-outline hover:text-error transition-colors p-1" onclick="window.ecohaven.removeFromCart(${idx})" title="Remove item">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // ==========================================================
    // 7. RESPONSIVE MOBILE APP SHELL (LAYER 3: 320px - 480px)
    // ==========================================================
    setupResponsiveMobileShell() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const initShell = () => {
            const isPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
            const pfx = isPages ? '' : 'pages/';
            const rootPfx = isPages ? '../' : '';

            const currentPath = window.location.pathname.toLowerCase();
            const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
            const isTetra = currentPath.includes('tetratable');
            const isShop = currentPath.includes('shop');
            const isTrack = currentPath.includes('track');
            const isCheckout = currentPath.includes('checkout');

            document.body.classList.add('overflow-x-hidden');

            const main = document.querySelector('main');
            if (main) {
                main.classList.add('pb-24', 'xl:pb-0');
            }

            // Injects Mobile Slide-out Drawer
            if (!document.getElementById('ecohavenMobileDrawerBackdrop')) {
                const drawerHtml = `
                <div id="ecohavenMobileDrawerBackdrop" onclick="window.toggleEcoHavenMobileDrawer(false)" class="xl:hidden fixed inset-0 z-[9990] bg-inverse-surface/60 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none"></div>
                <div id="ecohavenMobileDrawer" class="xl:hidden fixed top-0 left-0 bottom-0 z-[9995] w-72 sm:w-80 bg-surface shadow-2xl flex flex-col justify-between transform -translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-outline-variant/30">
                    <div class="p-5 flex flex-col gap-4 overflow-y-auto">
                        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary text-2xl">carpenter</span>
                                <span class="font-headline-sm text-lg font-bold text-on-surface">EcoHaven</span>
                            </div>
                            <button onclick="window.toggleEcoHavenMobileDrawer(false)" class="p-1 rounded-full hover:bg-surface-container text-on-surface">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <nav class="flex flex-col gap-1 text-sm font-semibold">
                            <a href="${rootPfx}index.html" class="px-3 py-2.5 rounded-lg ${isHome ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}">Showroom Direct</a>
                            <a href="${pfx}tetratable.html" class="px-3 py-2.5 rounded-lg ${isTetra ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}">TetraTable 4-in-1 Suite</a>
                            <a href="${pfx}shop.html" class="px-3 py-2.5 rounded-lg ${isShop ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}">Collection Catalog</a>
                            <a href="${pfx}track.html" class="px-3 py-2.5 rounded-lg ${isTrack ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}">Production Tracker</a>
                            <a href="${pfx}sourcing.html" class="px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container">Sourcing Story</a>
                            <a href="${pfx}dashboard.html" class="px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container">Customer Hub</a>
                            <a href="${pfx}seller.html" class="px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container">Craftsman Portal</a>
                        </nav>
                    </div>
                    <div class="p-4 border-t border-outline-variant/30 bg-surface-container-low text-xs">
                        <span class="font-semibold block text-on-surface">Candaba Woodworking Workshop</span>
                        <a href="tel:+639812558028" class="text-primary font-bold flex items-center gap-1 mt-1 text-sm">
                            <span class="material-symbols-outlined text-sm">call</span>
                            +63 981 255 8028
                        </a>
                        <span class="text-[11px] text-on-surface-variant mt-1 block">Pasig, Candaba, Pampanga</span>
                    </div>
                </div>
                `;
                document.body.insertAdjacentHTML('beforeend', drawerHtml);
            }

            // Injects Fixed 4-Tab Bottom Nav Bar
            if (!document.getElementById('ecohavenMobileNav')) {
                const navHtml = `
                <nav id="ecohavenMobileNav" class="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/40 px-2 py-1.5 flex items-center justify-around shadow-[0_-6px_20px_rgba(46,31,22,0.06)]">
                    <a href="${rootPfx}index.html" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${isHome ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'} transition-all">
                        <span class="material-symbols-outlined text-[22px]">home</span>
                        <span class="text-[10px] font-bold tracking-tight">Showroom</span>
                    </a>
                    <a href="${pfx}tetratable.html" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${isTetra ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'} transition-all">
                        <span class="material-symbols-outlined text-[22px]">view_in_ar</span>
                        <span class="text-[10px] font-bold tracking-tight">TetraTable</span>
                    </a>
                    <a href="${pfx}shop.html" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${isShop ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'} transition-all">
                        <span class="material-symbols-outlined text-[22px]">grid_view</span>
                        <span class="text-[10px] font-bold tracking-tight">Catalog</span>
                    </a>
                    <a href="${pfx}track.html" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${isTrack ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'} transition-all">
                        <span class="material-symbols-outlined text-[22px]">local_shipping</span>
                        <span class="text-[10px] font-bold tracking-tight">Track</span>
                    </a>
                    <button type="button" onclick="window.ecohaven ? window.ecohaven.openCartDrawer() : null" class="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-on-surface-variant hover:text-on-surface transition-all">
                        <span class="material-symbols-outlined text-[22px]">shopping_bag</span>
                        <span class="text-[10px] font-bold tracking-tight">Queue</span>
                        <span id="mobileBottomCartBadge" class="absolute top-0 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center leading-none">${this.cart ? this.cart.length : 1}</span>
                    </button>
                </nav>
                `;
                document.body.insertAdjacentHTML('beforeend', navHtml);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initShell);
        } else {
            initShell();
        }
    }

// ==========================================================
    // 8. SHOPEE-STYLE SAVED DELIVERY ADDRESS BOOK
    // ==========================================================
    loadAddresses() {
        try {
            const saved = localStorage.getItem('ecohaven_saved_addresses');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn("Storage read error for addresses:", e);
        }
        return [...DEFAULT_SAVED_ADDRESSES];
    }

    saveAddresses(addresses) {
        this.addresses = addresses;
        this.saveLocalBackup('ecohaven_saved_addresses', this.addresses);
        if (window.ecoHavenDb) {
            try {
                window.ecoHavenDb.ref('ecohaven/addresses').set(this.addresses);
            } catch (err) {
                console.warn("Firebase address write error:", err.message);
            }
        }
        window.dispatchEvent(new CustomEvent('ecohaven_addresses_updated', { detail: this.addresses }));
    }

    getAddresses() {
        return (this.addresses && this.addresses.length > 0) ? this.addresses : this.loadAddresses();
    }

    getDefaultAddress() {
        const list = this.getAddresses();
        return list.find(a => a.isDefault) || list[0] || null;
    }

    setDefaultAddress(id) {
        const list = this.getAddresses().map(a => ({
            ...a,
            isDefault: a.id === id
        }));
        this.saveAddresses(list);
        window.showEcoHavenToast("Primary delivery destination set as default.", "success");
    }

    saveOrUpdateAddress(addrData) {
        let list = this.getAddresses();
        const id = addrData.id || ('addr-' + Date.now());
        addrData.id = id;

        if (addrData.isDefault) {
            list = list.map(a => ({ ...a, isDefault: false }));
        }

        const existingIdx = list.findIndex(a => a.id === id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...addrData };
        } else {
            if (list.length === 0) addrData.isDefault = true;
            list.push(addrData);
        }

        this.saveAddresses(list);
        window.showEcoHavenToast(`Address "${addrData.label || 'New Address'}" saved!`, "success");
        return id;
    }

    deleteAddress(id) {
        let list = this.getAddresses();
        const target = list.find(a => a.id === id);
        list = list.filter(a => a.id !== id);
        if (target && target.isDefault && list.length > 0) {
            list[0].isDefault = true;
        }
        this.saveAddresses(list);
        window.showEcoHavenToast("Delivery address removed.", "info");
    }

}


    // Mobile Drawer Toggle Helper
window.toggleEcoHavenMobileDrawer = function(open) {
    const backdrop = document.getElementById('ecohavenMobileDrawerBackdrop');
    const drawer = document.getElementById('ecohavenMobileDrawer');
    if (!backdrop || !drawer) return;

    if (open) {
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100', 'pointer-events-auto');
        drawer.classList.remove('-translate-x-full');
        drawer.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
    } else {
        backdrop.classList.remove('opacity-100', 'pointer-events-auto');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        drawer.classList.remove('translate-x-0');
        drawer.classList.add('-translate-x-full');
        document.body.style.overflow = '';
    }
};

// Global Toast Notification Engine
window.showEcoHavenToast = function(message, type = 'info') {
    let container = document.getElementById('ecohavenToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ecohavenToastContainer';
        container.className = 'fixed top-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
        'success': 'bg-[#1b3d22] text-[#d4f5d2] border-[#2e6939]',
        'error': 'bg-[#4a1313] text-[#ffdad6] border-[#802323]',
        'info': 'bg-inverse-surface text-inverse-on-surface border-outline-variant/40'
    };
    const iconNames = {
        'success': 'check_circle',
        'error': 'error',
        'info': 'info'
    };

    toast.className = `${bgColors[type] || bgColors['info']} pointer-events-auto shadow-2xl rounded-2xl p-3.5 px-4 flex items-center gap-3 border backdrop-blur-md transform transition-all duration-300 translate-y-[-20px] opacity-0 text-sm font-medium`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px] flex-shrink-0">${iconNames[type] || 'info'}</span>
        <span class="flex-1 text-xs sm:text-sm font-semibold leading-tight">${message}</span>
        <button class="opacity-70 hover:opacity-100 transition-opacity p-0.5" onclick="this.parentElement.remove()">
            <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 350);
    }, 3500);
};

// Global Drawer Forwarders for Backward Compatibility
window.openCartDrawer = function() {
    if (window.ecohaven) window.ecohaven.openCartDrawer();
};
window.closeCartDrawer = function() {
    if (window.ecohaven) window.ecohaven.closeCartDrawer();
};
window.toggleCartDrawer = function(open) {
    if (window.ecohaven) {
        if (open) window.ecohaven.openCartDrawer();
        else window.ecohaven.closeCartDrawer();
    }
};
window.addToCart = function(item, price, meta) {
    if (window.ecohaven) {
        if (typeof item === 'string') {
            window.ecohaven.addToCart(item, price, meta);
        } else {
            window.ecohaven.addToCart(item);
        }
    }
};

// Instantiate global store singleton
window.ecohaven = new EcoHavenStore();
