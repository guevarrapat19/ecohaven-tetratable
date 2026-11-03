# EcoHaven Furniture — Web Platform
> **Sustainable Space-Saving Furniture Handcrafted in Dalan Batu, Pasig, Candaba, Pampanga, Philippines**  
> **DTI Registration #4918230 | Kiln Dry 11.4% MC | Solignum Termite Certified**

---

## 🪵 Project Overview
EcoHaven Furniture is a modern direct-to-consumer artisanal e-commerce web platform showcasing the flagship **TetraTable 4-in-1 Suite** (₱6,934.00)—an innovative, handcrafted accent table made from 100% solid Philippine Mahogany that smoothly separates into **four (4) standalone dining chairs**—alongside an expanded collection of space-saving modular furniture and workshop maintenance essentials.

### Architecture Highlights
* **Zero Build Step (Pure Vanilla Web):** Built with HTML5, CSS3, Tailwind CSS JIT via CDN, and modern ES6+ JavaScript modules. Runs immediately in any browser—no `npm install` or node build process required!
* **Warm Wood Bento-Grid Design Architecture:** Interlocking geometric Bento cards mirroring the TetraTable's precision mortise-and-tenon joinery.
* **Live Cloud-First Firebase Backend:** Connected to live Firebase Cloud Realtime Database (`ecohavenfurniture-d0114`) with dual-sync `localStorage` offline caching.
* **Intelligent Payment Settlement Modality Rules:**
  * **Under ₱2,000.00:** Low-value orders (cushions, wax polish) allow only 100% Full Payment or Cash on Delivery (COD). The 50% deposit option is dynamically hidden.
  * **₱2,000.00 to ₱5,000.00:** All three payment options (Full, COD, 50% DP) are accessible.
  * **Over ₱5,000.00:** 50% Earnest Downpayment is mandatory to secure bespoke mahogany lumber reservation.
* **10% Welcome Voucher Engine (`WELCOME10`):** Automatic single-use 10% discount awarded upon first account registration, recalculating cart pricing in real time.
* **Automated Downpayment Refund & Rejection Engine:**
  * Cancelling or rejecting an order with advance payment automatically credits back 100% of earnest deposits with an official audit reference (`REF-CANDABA-XXXXXX`).
  * Workshop `Revenue (Net)` telemetry honestly deducts refunded downpayments ("less the refund").
* **9-Chip Workshop Telemetry & 4-Column Kanban (`seller.html`):** Real-time monitoring of Total Orders, Pending Review, Timber Cutting, In Joinery, In Transit, Completed, Rejected / Refunded, Net Revenue, and Balance Due.
* **Hierarchical Philippine Address Book (`dashboard.html`):** Province, City, and Barangay cascading dropdowns, primary default address tagging, and a bespoke luxury confirmation deletion modal (`#deleteAddressModal`).
* **Real-Time 5-Stage Workshop Tracker (`track.html`):** Dynamic customer telemetry reflecting live fabrication milestones and official refund notices.
* **Global Unified Cart Drawer:** Consistent, slide-over order queue standardized across all 11 public pages.

---

## 📁 Directory Structure
```
EcoHaven Furniture/
├── 📄 index.html                           # Entry Point: Home & Candaba Workshop Showroom
├── 📂 pages/                               # Multi-Page Subpages
│   ├── 📄 tetratable.html                  # TetraTable 4-in-1 Interactive Configurator & Mode Visualizer
│   ├── 📄 shop.html                        # Furniture Catalog & Companion Add-Ons
│   ├── 📄 checkout.html                    # Smart Settlement Checkout & GCash App-to-App Gateway
│   ├── 📄 track.html                       # 5-Stage Live Workshop Production & Delivery Tracker
│   ├── 📄 seller.html                      # Craftsman Hub: 9-Chip Telemetry & Live Kanban Board
│   ├── 📄 dashboard.html                   # Customer Account, Saved Address & Order Status
│   ├── 📄 sourcing.html                    # Material Sourcing Transparency (Mahogany, Solignum, Barnis)
│   ├── 📄 contact.html                     # Bespoke Workshop Inquiries & Consultation
│   ├── 📄 about.html                       # Candaba Artisan Woodcraft Heritage Story
│   └── 📄 legal.html                       # Terms, RA 10173 Data Privacy, & 30-Day Returns
├── 📂 assets/
│   ├── 📄 auth-modal.js                    # Global Auth, User Profile & 11-Digit Phone Controller
│   ├── 📄 notifications.js                 # Toast Notifications & Sound Alerts
│   ├── 📄 animations.css                   # Keyframes for pulse, modal scale, and drawer slide
│   └── 📂 images/                          # High-resolution lifestyle renders, emblems, GCash proofs
├── 📂 js/
│   ├── 📄 firebase-config.js               # Live Firebase Realtime Database SDK configuration
│   └── 📄 store.js                         # Cloud-first data store, cart drawer & bidirectional sync engine
├── 📄 firebase-database-seed.json          # Master seed data ready for 1-click Firebase import
├── 📄 database.rules.json                  # Security rules for Firebase Realtime Database
└── 📄 README.md                            # Documentation
```

---

## ☁️ Firebase Realtime Database Setup (2 Minutes)

Your live Firebase project is pre-configured in `js/firebase-config.js` and `js/store.js`:
* **Project ID:** `ecohavenfurniture-d0114`
* **Realtime Database URL:** `https://ecohavenfurniture-d0114-default-rtdb.asia-southeast1.firebasedatabase.app`

### Step 1: Import Database Seed Data
1. Open the [Firebase Console](https://console.firebase.google.com/) and navigate to project `ecohavenfurniture-d0114`.
2. Click **Build** ➔ **Realtime Database** on the left menu.
3. Click the **Data** tab.
4. Click the **three vertical dots (⋮)** in the upper-right corner of the database panel and choose **Import JSON**.
5. Select `firebase-database-seed.json` from this folder and click **Import**.

### Step 2: Apply Security Rules
1. In the same Realtime Database screen, click the **Rules** tab.
2. Replace existing rules with the contents of `database.rules.json`:
```json
{
  "rules": {
    "ecohaven": {
      ".read": true,
      ".write": true
    }
  }
}
```
3. Click **Publish**.

---

## 🧪 Testing Live Cross-Device Real-Time Sync

You can test the real-time cloud synchronization without installing any server:

1. Open **`pages/seller.html`** in **Browser Tab 1** (acting as master craftsman Mang Ronaldo in Candaba).
2. Open **`pages/checkout.html`** in **Browser Tab 2** (acting as a customer in Angeles City or San Fernando).
3. On Tab 2 (`pages/checkout.html`):
   - Choose **50% Earnest Down Payment (₱3,467.00)**.
   - Click **Open in GCash App** or click **Confirm & Track Fabrication Live →**.
   - Tab 2 will automatically redirect to **`pages/track.html?orderId=EH-2026-xxxxx`**.
4. Instantly look at **Tab 1 (`pages/seller.html`)**:
   - The new order card appears automatically in **Column 1: Payment Review**!
5. In Tab 1 (`pages/seller.html`):
   - Click **Audit Proof**. The verification lightbox opens showing the receipt screenshot.
   - Click **Approve & Start Cutting**.
   - The card moves instantly to **Column 2: Lumber & Solignum**.
6. Switch back to **Tab 2 (`pages/track.html`)**:
   - Notice that the customer's 5-stage stepper has advanced from Stage 1 to Stage 2 in real time—**without any page refresh**!
7. In Tab 1 (`pages/seller.html`), test rejecting an order:
   - Click the 🚫 button, select *"Insufficient Raw Timber / Materials in Workshop"*, and confirm.
   - Notice that **Rejected / Refunded** increments to 1, Net Revenue deducts the refund, and Tab 2 displays the official **Refund Issued** notice with reference `REF-CANDABA-XXXXXX`!

---

## 🚀 How to Deploy to GitHub Pages (Free Hosting)

When you're ready to publish the website live:

```bash
# 1. Open terminal in this folder
cd "c:\Users\gueva\Desktop\Paolo Ecom\EcoHaven Furniture"

# 2. Add and commit all files
git add .
git commit -m "feat: EcoHaven Furniture live platform with full refund & payment rules"

# 3. Push to GitHub
git push origin main
```

In your GitHub repository settings:
- Go to **Settings** ➔ **Pages**.
- Under **Build and deployment**, select **Source: Deploy from a branch** ➔ **Branch: main** ➔ **/ (root)** ➔ **Save**.
- Your website is live with free SSL HTTPS!
