# EcoHaven Furniture — Web Platform
> **Sustainable Space-Saving Furniture Handcrafted in Dalan Batu, Pasig, Candaba, Pampanga, Philippines**  
> **DTI Registration #4918230 | Kiln Dry 11.4% MC | Solignum Termite Certified**

---

## 🪵 Project Overview
EcoHaven Furniture is a modern e-commerce web platform showcasing the **TetraTable** (₱6,934.00)—an innovative, handcrafted side table made from 100% solid Philippine Mahogany that cleanly separates into **four (4) standalone dining chairs**.

### Architecture Highlights
* **Zero Build Step (Pure Vanilla Web):** Built with HTML5, CSS3, Tailwind CSS CDN, and Google Fonts. Runs immediately in any browser—no `npm install` or node build process required!
* **Warm Wood Bento-Grid Design Architecture:** Mathematical interlocking Bento cards mirroring the TetraTable's precision joinery.
* **Live Cloud-First Firebase Backend:** Connected to your live Firebase Cloud Realtime Database (`ecohavenfurniture-d0114`).
* **GCash App-to-App Gateway Simulation:** Seamless mobile payment authorization, QR fallback, and receipt upload.
* **Real-Time 5-Stage Workshop Tracker (`track.html`):** Dynamic customer telemetry reflecting live fabrication milestones.
* **Craftsman & Seller Hub (`seller.html`):** 4-column visual Kanban board with interactive GCash Receipt Verification Lightbox.

---

## 📁 Directory Structure
```
EcoHaven Furniture/
├── 📄 index.html                           # Entry Point: Home & Candaba Workshop Showroom
├── 📂 pages/                               # Multi-Page Subpages
│   ├── 📄 tetratable.html                  # TetraTable 4-in-1 Interactive Configurator & Mode Visualizer
│   ├── 📄 shop.html                        # Furniture Catalog & Companion Add-Ons
│   ├── 📄 checkout.html                    # Split Checkout & GCash App-to-App Gateway
│   ├── 📄 track.html                       # 5-Stage Live Workshop Production & Delivery Tracker
│   ├── 📄 seller.html                      # Craftsman & Seller Hub (Live Kanban Board & GCash Lightbox)
│   ├── 📄 dashboard.html                   # Customer Account, Saved Address & Order Status
│   ├── 📄 sourcing.html                    # Material Sourcing Transparency (Mahogany, Solignum, Barnis)
│   └── 📄 legal.html                       # Terms, RA 10173 Data Privacy, & 30-Day Returns
├── 📂 assets/
│   └── 📂 images/                          # High-resolution lifestyle renders, emblems, GCash proofs
├── 📂 js/
│   ├── 📄 firebase-config.js               # Live Firebase Realtime Database SDK configuration
│   └── 📄 store.js                         # Cloud-first data store & bidirectional sync engine
├── 📄 firebase-database-seed.json          # Seed data ready for 1-click Firebase import
├── 📄 database.rules.json                  # Security rules for Firebase Console
└── 📄 README.md                            # Documentation
```

---

## ☁️ Firebase Realtime Database Setup (2 Minutes)

Your live Firebase project is already configured in `js/firebase-config.js` and `js/store.js`:
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
   - Click **Verify GCash Proof**. The verification lightbox opens showing the receipt screenshot.
   - Click **Approve & Start Cutting**.
   - The card moves instantly to **Column 2: Lumber & Solignum**.
6. Switch back to **Tab 2 (`pages/track.html`)**:
   - Notice that the customer's 5-stage stepper has advanced from Stage 1 to Stage 2 in real time—**without any page refresh**!

---

## 🚀 How to Deploy to GitHub Pages (Free Hosting)

When you're ready to publish the website live:

```bash
# 1. Open terminal in this folder
cd "c:\Users\gueva\Desktop\Paolo Ecom\EcoHaven Furniture"

# 2. Initialize git and commit files
git init
git add .
git commit -m "feat: EcoHaven Furniture live platform with Firebase real-time sync"

# 3. Connect to your GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ecohaven-furniture.git
git push -u origin main
```

4. In your GitHub repository settings:
   - Go to **Settings** ➔ **Pages**.
   - Under **Build and deployment**, select **Source: Deploy from a branch** ➔ **Branch: main** ➔ **/ (root)** ➔ **Save**.
   - Your website will be live in 60 seconds with a free HTTPS URL!
