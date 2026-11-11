// EcoHaven Furniture - Order Received, Proof of Delivery (POD) & Review Engine
// Addresses Thesis Panel Suggestions:
// #2: "Order Received" button & Proof of Delivery (POD) Inspection
// #5: Customer Feedback & 5-Star Review System
// #7: Automated Email & 5-Year Warranty Certificate Generation

(function() {
  let activeReviewOrderId = null;
  let activeSelectedRating = 5;
  let activeSelectedTags = new Set(['Smooth 320-Grit Sanding', 'Sturdy Joinery']);

  // Dynamic POD Image Path resolver based on Courier selection
  function getPodImageForCourier(order) {
    if (!order) return '../assets/images/pod/pod-workshop-van.jpg';
    const cId = (order.courierId || '').toLowerCase();
    const cName = (order.courierName || '').toLowerCase();

    // Check if we are running in root (index.html) or subfolder (/pages/)
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../assets/images/pod/' : 'assets/images/pod/';

    if (cId === 'jnt' || cName.includes('j&t') || cName.includes('jnt')) {
      return basePath + 'pod-jnt-cargo.jpg';
    }
    if (cId === 'flash' || cName.includes('flash')) {
      return basePath + 'pod-flash-express.jpg';
    }
    return basePath + 'pod-workshop-van.jpg';
  }

  function injectModals() {
    if (document.getElementById('ecohavenReviewEngineContainer')) return;

    const html = `
      <div id="ecohavenReviewEngineContainer">
        
        <!-- ========================================================================= -->
        <!-- 1. PROOF OF DELIVERY (POD) & ORDER RECEIVED INSPECTION MODAL (ITEM #2)     -->
        <!-- ========================================================================= -->
        <div id="podInspectionBackdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden transition-opacity duration-300 opacity-0" onclick="window.closePodInspectionModal()"></div>
        <div id="podInspectionModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none hidden">
          <div class="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-outline-variant/40 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[92vh] flex flex-col overflow-hidden" id="podInspectionCard">
            
            <!-- Header -->
            <div class="p-4 sm:p-5 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs">
                  <span class="material-symbols-outlined text-[22px]">verified</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-headline text-lg sm:text-xl font-bold text-on-surface">Official Proof of Delivery (POD)</h3>
                    <span id="podModalCourierBadge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">J&amp;T Cargo</span>
                  </div>
                  <p class="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                    <span>Authenticated courier handover record</span>
                    <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span class="text-primary font-bold flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-[14px]">visibility</span>
                      <span>Shared Customer &amp; Workshop Verification</span>
                    </span>
                  </p>
                </div>
              </div>
              <button type="button" onclick="window.closePodInspectionModal()" class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all" aria-label="Close">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Content Body -->
            <div class="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow">
              
              <!-- POD Photo Showcase with Overlays -->
              <div class="relative rounded-2xl overflow-hidden aspect-[16/11] bg-surface-container border border-outline-variant/40 shadow-sm group">
                <img id="podModalImage" src="../assets/images/pod/pod-jnt-cargo.jpg" alt="Courier Proof of Delivery Photo" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"/>
                
                <!-- Overlay Badges -->
                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span id="podModalOverlayTag" class="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Doorstep Handover Verified</span>
                  </span>
                  <span id="podModalWaybillTag" class="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-tertiary-fixed font-mono text-xs font-bold shadow-md">
                    Waybill: JNT-PH-422365
                  </span>
                </div>

                <div class="absolute bottom-3 left-3 right-3 p-3 bg-black/80 backdrop-blur-md rounded-xl text-white text-xs flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-amber-400 text-[18px]">location_on</span>
                    <span id="podModalGeotag">San Fernando, Pampanga • Doorstep Handover</span>
                  </div>
                  <span id="podModalTimestamp" class="text-[11px] font-mono text-white/80">Nov 09, 2026 • 15:42 PST</span>
                </div>
              </div>

              <!-- Handover Details Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-xs">
                <div>
                  <span class="text-outline text-[11px] block">Order Number</span>
                  <strong id="podModalOrderId" class="font-mono text-primary font-bold text-sm">#EH-2026-46346</strong>
                </div>
                <div>
                  <span class="text-outline text-[11px] block">Handover Courier</span>
                  <strong id="podModalCourierName" class="text-on-surface font-semibold text-xs">J&amp;T Cargo (Heavy Crating)</strong>
                </div>
                <div>
                  <span class="text-outline text-[11px] block">Settlement Status</span>
                  <strong id="podModalSettlement" class="text-emerald-700 font-bold text-xs">100% Settled (₱0.00 Due)</strong>
                </div>
              </div>

              <!-- Doorstep Quality Inspection Checklist -->
              <div class="space-y-2 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-xs">
                <span class="text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wide">
                  <span class="material-symbols-outlined text-primary text-[17px]">fact_check</span>
                  <span>Handover Condition Quality Standard</span>
                </span>
                <ul class="space-y-1.5 text-on-surface-variant text-[11px] leading-relaxed">
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-[15px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Wood &amp; Finish:</strong> Philippine Mahogany 320-grit satin finish confirmed scratch-free and smooth.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-[15px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Structural Joinery:</strong> Mortise &amp; tenon joints fully solid, level, and rigid under load.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-[15px] flex-shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Package Complete:</strong> Includes 4 nesting stools and Candaba natural wood care wax guide.</span>
                  </li>
                </ul>
              </div>

            </div>

            <!-- Modal Action Footer -->
            <div class="p-4 sm:p-5 bg-surface-container-lowest border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onclick="window.closePodInspectionModal()" class="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container transition-all">
                Dismiss
              </button>
              
              <div class="flex items-center gap-2" id="podModalActionButtons">
                <button type="button" id="podConfirmReceivedBtn" onclick="window.handleConfirmReceiptClick()" class="px-5 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-container text-on-tertiary text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95">
                  <span class="material-symbols-outlined text-sm">mark_email_read</span>
                  <span>I Have Received My Order in Good Condition</span>
                </button>
                <button type="button" id="podViewWarrantyBtn" onclick="window.openWarrantyModalFromActivePod()" class="hidden px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed text-xs font-bold transition-all flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">verified_user</span>
                  <span>View 5-Year Warranty</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 2. CUSTOMER FEEDBACK & 5-STAR REVIEW MODAL (ITEM #5)                       -->
        <!-- ========================================================================= -->
        <div id="reviewModalBackdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden transition-opacity duration-300 opacity-0" onclick="window.closeReviewModal()"></div>
        <div id="reviewModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none hidden">
          <div class="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-outline-variant/40 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[92vh] flex flex-col overflow-hidden" id="reviewModalCard">
            
            <!-- Header -->
            <div class="p-5 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <span class="material-symbols-outlined text-[24px]">grade</span>
                </div>
                <div>
                  <h3 class="font-headline text-lg sm:text-xl font-bold text-on-surface leading-tight">Rate Your Handcrafted Furniture</h3>
                  <p class="text-xs text-on-surface-variant">Your feedback directly supports Candaba woodturners &amp; joiners</p>
                </div>
              </div>
              <button type="button" onclick="window.closeReviewModal()" class="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all" aria-label="Close">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <!-- Form Body -->
            <form id="reviewSubmissionForm" onsubmit="window.handleReviewSubmit(event)" class="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              
              <!-- Product info chip -->
              <div class="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-outline block uppercase tracking-wide">Furniture Suite</span>
                  <strong id="reviewModalProductName" class="text-on-surface text-xs font-bold">TetraTable 4-in-1 Suite</strong>
                  <span id="reviewModalFinish" class="text-[11px] text-on-surface-variant block">Natural Warm Teak • 320-Grit Finish</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">VERIFIED PURCHASE</span>
              </div>

              <!-- Interactive Star Rating -->
              <div class="text-center py-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                <span class="text-xs font-bold text-outline block mb-1">Select Star Rating</span>
                <div class="flex items-center justify-center gap-1.5 text-amber-400 text-3xl my-1 select-none" id="starRatingContainer">
                  <button type="button" onclick="window.setReviewRating(1)" class="star-btn transition-transform hover:scale-125 focus:outline-none" data-star="1">★</button>
                  <button type="button" onclick="window.setReviewRating(2)" class="star-btn transition-transform hover:scale-125 focus:outline-none" data-star="2">★</button>
                  <button type="button" onclick="window.setReviewRating(3)" class="star-btn transition-transform hover:scale-125 focus:outline-none" data-star="3">★</button>
                  <button type="button" onclick="window.setReviewRating(4)" class="star-btn transition-transform hover:scale-125 focus:outline-none" data-star="4">★</button>
                  <button type="button" onclick="window.setReviewRating(5)" class="star-btn transition-transform hover:scale-125 focus:outline-none" data-star="5">★</button>
                </div>
                <span id="starRatingLabel" class="text-xs font-bold text-primary">5 Stars — Heirloom Masterpiece (Exceptional Craftsmanship)</span>
              </div>

              <!-- Quick Praise Chips (Toggleable) -->
              <div>
                <span class="text-[11px] font-bold text-on-surface block mb-1.5">What impressed you the most? (Tap to toggle)</span>
                <div class="flex flex-wrap gap-1.5" id="reviewPraiseChipsContainer">
                  <button type="button" onclick="window.toggleReviewTag('Smooth 320-Grit Sanding', this)" class="tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-primary text-white border-primary">🪵 Smooth 320-Grit Sanding</button>
                  <button type="button" onclick="window.toggleReviewTag('Sturdy Joinery', this)" class="tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-primary text-white border-primary">🪑 Sturdy Joinery</button>
                  <button type="button" onclick="window.toggleReviewTag('Kiln-Dried 11.4% MC', this)" class="tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-surface-container text-on-surface-variant border-outline-variant/30">🔥 Kiln-Dried 11.4% MC</button>
                  <button type="button" onclick="window.toggleReviewTag('Punctual Delivery', this)" class="tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-surface-container text-on-surface-variant border-outline-variant/30">⏱️ Punctual Delivery</button>
                  <button type="button" onclick="window.toggleReviewTag('Perfect Condo Space Saver', this)" class="tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-surface-container text-on-surface-variant border-outline-variant/30">🛋️ Perfect Space Saver</button>
                  <button type="button" onclick="window.toggleReviewTag('White-Glove Unboxing', this)" class="tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-surface-container text-on-surface-variant border-outline-variant/30">🛡️ White-Glove Unboxing</button>
                </div>
              </div>

              <!-- Detailed Feedback Comment -->
              <div>
                <label for="reviewCommentInput" class="text-[11px] font-bold text-on-surface block mb-1">Detailed Review &amp; Experience</label>
                <textarea id="reviewCommentInput" rows="3" required placeholder="Tell other homeowners about the solid mahogany wood grain, sturdiness, how it fits your living room, or your courier delivery experience..."
                  class="w-full p-3 rounded-xl border border-outline-variant/40 bg-surface text-xs text-on-surface leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              </div>

              <!-- Author & Town Fields -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-on-surface block mb-1">Your Name / Title</label>
                  <input type="text" id="reviewAuthorInput" required value="" placeholder="Enter your full name or title" class="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label class="text-[11px] font-bold text-on-surface block mb-1">Town / Province</label>
                  <input type="text" id="reviewLocationInput" required value="" placeholder="e.g., Angeles City, Pampanga" class="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-2">
                <button type="submit" class="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98">
                  <span class="material-symbols-outlined text-sm">stars</span>
                  <span>Publish Review to Live Showroom</span>
                </button>
              </div>
            </form>

          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 3. OFFICIAL 5-YEAR STRUCTURAL FRAME WARRANTY CERTIFICATE MODAL (ITEM #7)    -->
        <!-- ========================================================================= -->
        <div id="warrantyModalBackdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden transition-opacity duration-300 opacity-0" onclick="window.closeWarrantyModal()"></div>
        <div id="warrantyModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none hidden">
          <div class="relative w-full max-w-2xl bg-[#fffbf7] rounded-3xl shadow-2xl border-4 border-amber-800/30 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[92vh] flex flex-col overflow-hidden text-on-surface" id="warrantyModalCard">
            
            <!-- Certificate Header Banner -->
            <div class="p-6 text-center border-b border-amber-900/20 bg-gradient-to-b from-amber-500/10 to-transparent relative">
              <button type="button" onclick="window.closeWarrantyModal()" class="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-black/5 text-on-surface flex items-center justify-center transition-all" aria-label="Close">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary shadow-sm mb-2">
                <span class="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <h2 class="font-headline text-xl sm:text-2xl font-bold tracking-tight text-primary">EcoHaven Furniture Atelier</h2>
              <p class="font-label-caps text-[10px] tracking-widest uppercase text-amber-900 font-bold mt-0.5">Dalan Batu, Pasig, Candaba, Pampanga • DTI Reg. #4918230</p>
              <h3 class="font-headline text-lg sm:text-xl font-bold text-on-surface mt-3">Certificate of 5-Year Structural Frame Warranty</h3>
            </div>

            <!-- Certificate Body -->
            <div class="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs leading-relaxed">
              
              <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div>
                  <span class="text-outline text-[10px] uppercase font-bold tracking-wider block">Warranty Policy Serial</span>
                  <span id="warrantyCertSerial" class="font-mono text-sm sm:text-base font-bold text-primary">WARR-CANDABA-2026-46346</span>
                </div>
                <div class="text-right">
                  <span class="text-outline text-[10px] uppercase font-bold tracking-wider block">Status</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">ACTIVE &amp; GUARANTEED</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-amber-900/15">
                <div>
                  <span class="text-outline text-[11px] block">Registered Client / Homeowner:</span>
                  <strong id="warrantyCertClient" class="text-sm font-bold text-on-surface">Rose Timbol</strong>
                </div>
                <div>
                  <span class="text-outline text-[11px] block">Delivery Location:</span>
                  <strong id="warrantyCertAddress" class="text-sm font-semibold text-on-surface">San Fernando, Pampanga</strong>
                </div>
                <div>
                  <span class="text-outline text-[11px] block">Handcrafted Furniture:</span>
                  <strong id="warrantyCertProduct" class="text-xs font-semibold text-on-surface">TetraTable 4-in-1 Suite (Natural Warm Teak)</strong>
                </div>
                <div>
                  <span class="text-outline text-[11px] block">Official Handover Waybill:</span>
                  <strong id="warrantyCertWaybill" class="font-mono text-xs text-primary font-bold">JNT-PH-422365 (J&amp;T Cargo)</strong>
                </div>
              </div>

              <!-- Scope of Coverage -->
              <div class="space-y-1.5 text-[11px] text-on-surface-variant">
                <span class="font-bold text-on-surface block text-xs">5-Year Structural Coverage Terms:</span>
                <p>1. <strong>Mortise &amp; Tenon Joinery:</strong> Full guarantee against loosening, frame sagging, or separation of load-bearing wood joints under standard residential living conditions.</p>
                <p>2. <strong>Timber Seasoning:</strong> Certified kiln-dried to 11.4% moisture content to prevent tropical warping, seasonal swelling, and shrinkage cracks.</p>
                <p>3. <strong>Anti-Termite Guarantee:</strong> Deep-pressure Solignum treatment protecting against powder-post beetles and wood-boring insects.</p>
              </div>

              <!-- Signatures -->
              <div class="pt-4 grid grid-cols-2 gap-4 text-center">
                <div class="border-t border-amber-900/20 pt-2">
                  <span class="font-headline italic text-xs font-bold text-primary block">Danilo Santos</span>
                  <span class="text-[10px] text-outline">Master Woodworker (Lead Joiner)</span>
                </div>
                <div class="border-t border-amber-900/20 pt-2">
                  <span class="font-headline italic text-xs font-bold text-primary block">Ronaldo Santos</span>
                  <span class="text-[10px] text-outline">Workshop Quality &amp; Fleet Logistics</span>
                </div>
              </div>

            </div>

            <!-- Actions -->
            <div class="p-4 bg-amber-500/10 border-t border-amber-900/20 flex flex-wrap items-center justify-between gap-3">
              <span class="text-[11px] text-outline">Preserve this digital policy code for prompt artisan support.</span>
              <div class="flex items-center gap-2">
                <button type="button" onclick="window.printWarrantyCertificate()" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1 shadow-xs">
                  <span class="material-symbols-outlined text-sm">print</span>
                  <span>Print Certificate</span>
                </button>
                <button type="button" onclick="window.closeWarrantyModal()" class="px-3 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container">
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  // =========================================================================
  // MODAL CONTROLLERS & LOGIC
  // =========================================================================

  let activeModalOrder = null;

  window.openPodInspectionModal = function(orderId) {
    injectModals();
    let order = null;
    if (window.ecohaven && typeof window.ecohaven.getOrder === 'function') {
      order = window.ecohaven.getOrder(orderId);
    }
    if (order) {
      const stageNum = parseInt(order.stage, 10) || 1;
      const isDelivered = stageNum >= 5 || order.orderStatus === 'Delivered & Complete' || order.orderStatus === 'Customer Confirmed Receipt' || Boolean(order.deliveredAt);
      if (!isDelivered) {
        if (typeof window.showEcoHavenToast === 'function') {
          window.showEcoHavenToast('📦 Order Received & Proof of Delivery (POD) will be available once your order is delivered.', 'info');
        }
        return;
      }
    }
    activeModalOrder = order;

    const imgEl = document.getElementById('podModalImage');
    const badgeEl = document.getElementById('podModalCourierBadge');
    const waybillTag = document.getElementById('podModalWaybillTag');
    const geotag = document.getElementById('podModalGeotag');
    const timestamp = document.getElementById('podModalTimestamp');
    const orderIdEl = document.getElementById('podModalOrderId');
    const courierNameEl = document.getElementById('podModalCourierName');
    const settlementEl = document.getElementById('podModalSettlement');
    const confirmBtn = document.getElementById('podConfirmReceivedBtn');
    const warrantyBtn = document.getElementById('podViewWarrantyBtn');

    if (order) {
      if (imgEl) imgEl.src = getPodImageForCourier(order);
      if (badgeEl) badgeEl.innerText = order.courierName ? order.courierName.split('(')[0] : 'Workshop Fleet';
      if (waybillTag) waybillTag.innerText = `Waybill: ${order.courierTracking || 'EH-FLEET-CBD4821'}`;
      if (geotag) {
        const dest = order.address ? (order.address.split(',')[1] || order.address) : (order.shippingAddress || 'Pampanga');
        geotag.innerText = `${dest.trim()} • Doorstep Handover`;
      }
      if (timestamp) {
        const dt = order.deliveredAt || order.updatedAt || new Date().toISOString();
        timestamp.innerText = new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      if (orderIdEl) orderIdEl.innerText = '#' + order.orderId;
      if (courierNameEl) courierNameEl.innerText = order.courierName || 'EcoHaven Workshop Van';
      if (settlementEl) {
        const isDone = (parseInt(order.stage, 10) === 5) || order.orderStatus === 'Delivered & Complete' || order.orderStatus === 'Customer Confirmed Receipt' || (order.balanceDue === 0);
        if (isDone) {
          settlementEl.innerHTML = '<span class="text-emerald-700 font-bold flex items-center gap-1"><span class="material-symbols-outlined text-[15px]">check_circle</span><span>100% Fully Settled • ₱0.00 Balance Remaining</span></span>';
        } else {
          const bal = parseFloat(order.balanceDue !== undefined ? order.balanceDue : (order.totalAmount || 7184));
          settlementEl.innerHTML = `<span class="text-blue-700 font-bold flex items-center gap-1"><span class="material-symbols-outlined text-[15px]">payments</span><span>Doorstep Settlement: ₱${bal.toLocaleString('en-PH', {minimumFractionDigits: 2})} Due</span></span>`;
        }
      }

      // Check if already confirmed received
      const isConfirmed = order.orderStatus === 'Customer Confirmed Receipt' || (parseInt(order.stage, 10) === 5 && order.warrantyCode);
      if (isConfirmed) {
        if (confirmBtn) confirmBtn.classList.add('hidden');
        if (warrantyBtn) warrantyBtn.classList.remove('hidden');
      } else {
        if (confirmBtn) confirmBtn.classList.remove('hidden');
        if (warrantyBtn) warrantyBtn.classList.add('hidden');
      }
    }

    const backdrop = document.getElementById('podInspectionBackdrop');
    const modal = document.getElementById('podInspectionModal');
    const card = document.getElementById('podInspectionCard');
    if (!backdrop || !modal || !card) return;

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  };

  window.closePodInspectionModal = function() {
    const backdrop = document.getElementById('podInspectionBackdrop');
    const modal = document.getElementById('podInspectionModal');
    const card = document.getElementById('podInspectionCard');
    if (!backdrop || !card) return;

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      if (modal) modal.classList.add('hidden');
    }, 280);
  };

  window.handleConfirmReceiptClick = async function() {
    if (!activeModalOrder || !activeModalOrder.orderId) return;
    const orderId = activeModalOrder.orderId;

    if (window.ecohaven && typeof window.ecohaven.customerConfirmReceipt === 'function') {
      await window.ecohaven.customerConfirmReceipt(orderId);
    }

    window.closePodInspectionModal();

    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast(`🎉 Order #${orderId} marked received! 5-Year Warranty Certificate has been activated.`, 'success');
    }

    // Automatically prompt review modal
    setTimeout(() => {
      const prodName = activeModalOrder.productName || (activeModalOrder.items && activeModalOrder.items[0] && activeModalOrder.items[0].name) || 'TetraTable 4-in-1 Suite';
      const finish = (activeModalOrder.items && activeModalOrder.items[0] && activeModalOrder.items[0].finish) || 'Natural Warm Teak';
      window.openReviewModal(orderId, prodName, finish);
    }, 450);
  };

  window.openWarrantyModalFromActivePod = function() {
    if (activeModalOrder && activeModalOrder.orderId) {
      window.closePodInspectionModal();
      setTimeout(() => window.openWarrantyModal(activeModalOrder.orderId), 300);
    }
  };

  // Review Modal Handler
  window.openReviewModal = function(orderId, productName, finish) {
    injectModals();
    activeReviewOrderId = orderId;
    activeSelectedRating = 5;
    window.setReviewRating(5);

    const nameEl = document.getElementById('reviewModalProductName');
    const finishEl = document.getElementById('reviewModalFinish');
    const authorEl = document.getElementById('reviewAuthorInput');
    const locEl = document.getElementById('reviewLocationInput');

    if (nameEl) nameEl.innerText = productName || 'TetraTable 4-in-1 Suite';
    if (finishEl) finishEl.innerText = (finish || 'Natural Warm Teak') + ' • 320-Grit Finish';

    // Reset fields to blank by default (Guest Customer enters manually)
    if (authorEl) authorEl.value = '';
    if (locEl) locEl.value = '';

    // Only autofill Name and Town/Province if a registered user is currently logged in
    let loggedInUser = null;
    try {
      const userRaw = localStorage.getItem('ecohaven_user') || localStorage.getItem('currentUser');
      if (userRaw) loggedInUser = JSON.parse(userRaw);
    } catch (e) {}

    if (loggedInUser) {
      if (authorEl) {
        authorEl.value = loggedInUser.displayName || loggedInUser.fullName || loggedInUser.name || '';
      }
      // Resolve town/province from user's default saved address, profile address, or attached order
      let resolvedLocation = '';
      if (window.ecohaven && typeof window.ecohaven.getDefaultAddress === 'function') {
        const defAddr = window.ecohaven.getDefaultAddress();
        if (defAddr && (defAddr.city || defAddr.province)) {
          resolvedLocation = [defAddr.city, defAddr.province].filter(Boolean).join(', ');
        }
      }
      if (!resolvedLocation && loggedInUser.city && loggedInUser.province) {
        resolvedLocation = `${loggedInUser.city}, ${loggedInUser.province}`;
      }
      if (!resolvedLocation && orderId && window.ecohaven && typeof window.ecohaven.getOrder === 'function') {
        const ord = window.ecohaven.getOrder(orderId);
        if (ord && ord.address) {
          const parts = ord.address.split(',').map(s => s.trim()).filter(Boolean);
          resolvedLocation = parts.length >= 3 ? `${parts[parts.length - 4] || parts[1]}, ${parts[parts.length - 3] || parts[2]}` : (parts[1] || ord.address);
        }
      }
      if (locEl) locEl.value = resolvedLocation;
    }

    const backdrop = document.getElementById('reviewModalBackdrop');
    const modal = document.getElementById('reviewModal');
    const card = document.getElementById('reviewModalCard');
    if (!backdrop || !modal || !card) return;

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  };

  window.closeReviewModal = function() {
    const backdrop = document.getElementById('reviewModalBackdrop');
    const modal = document.getElementById('reviewModal');
    const card = document.getElementById('reviewModalCard');
    if (!backdrop || !card) return;

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      if (modal) modal.classList.add('hidden');
    }, 280);
  };

  window.setReviewRating = function(rating) {
    activeSelectedRating = rating;
    const buttons = document.querySelectorAll('#starRatingContainer .star-btn');
    buttons.forEach((btn, idx) => {
      if (idx < rating) {
        btn.classList.add('text-amber-500');
        btn.classList.remove('text-outline-variant');
      } else {
        btn.classList.remove('text-amber-500');
        btn.classList.add('text-outline-variant');
      }
    });

    const labels = [
      '',
      '1 Star — Disappointed (Needs Improvement)',
      '2 Stars — Fair (Room for Polish)',
      '3 Stars — Good Handcrafted Quality',
      '4 Stars — Very Impressed (Smooth & Solid)',
      '5 Stars — Heirloom Masterpiece (Exceptional Craftsmanship)'
    ];
    const lblEl = document.getElementById('starRatingLabel');
    if (lblEl) lblEl.innerText = labels[rating] || '5 Stars — Heirloom Masterpiece';
  };

  window.toggleReviewTag = function(tag, btn) {
    if (activeSelectedTags.has(tag)) {
      activeSelectedTags.delete(tag);
      btn.className = 'tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-surface-container text-on-surface-variant border-outline-variant/30';
    } else {
      activeSelectedTags.add(tag);
      btn.className = 'tag-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-primary text-white border-primary';
    }
  };

  window.handleReviewSubmit = async function(e) {
    if (e) e.preventDefault();
    const commentEl = document.getElementById('reviewCommentInput');
    const authorEl = document.getElementById('reviewAuthorInput');
    const locEl = document.getElementById('reviewLocationInput');
    const prodNameEl = document.getElementById('reviewModalProductName');
    const finishEl = document.getElementById('reviewModalFinish');

    const reviewData = {
      orderId: activeReviewOrderId,
      author: authorEl ? authorEl.value.trim() : 'Verified Homeowner',
      location: locEl ? locEl.value.trim() : 'Pampanga, Philippines',
      productName: prodNameEl ? prodNameEl.innerText : 'TetraTable 4-in-1 Suite',
      finish: finishEl ? finishEl.innerText.split('•')[0].trim() : 'Natural Warm Teak',
      rating: activeSelectedRating,
      comment: commentEl ? commentEl.value.trim() : 'Exceptional craftsmanship and smooth 320-grit wood finish.',
      tags: Array.from(activeSelectedTags)
    };

    if (window.ecohaven && typeof window.ecohaven.submitReview === 'function') {
      await window.ecohaven.submitReview(reviewData);
    }

    window.closeReviewModal();

    // Show warranty modal next if an order was attached
    if (activeReviewOrderId) {
      setTimeout(() => window.openWarrantyModal(activeReviewOrderId), 400);
    }
  };

  // 5-Year Warranty Modal Handler
  window.openWarrantyModal = function(orderId) {
    injectModals();
    let order = null;
    if (window.ecohaven && typeof window.ecohaven.getOrder === 'function') {
      order = window.ecohaven.getOrder(orderId);
    }

    const serialEl = document.getElementById('warrantyCertSerial');
    const clientEl = document.getElementById('warrantyCertClient');
    const addressEl = document.getElementById('warrantyCertAddress');
    const productEl = document.getElementById('warrantyCertProduct');
    const waybillEl = document.getElementById('warrantyCertWaybill');

    if (order) {
      const serial = order.warrantyCode || ('WARR-CANDABA-2026-' + (String(order.orderId).replace(/[^0-9]/g, '').slice(-5) || '46346'));
      if (serialEl) serialEl.innerText = serial;
      if (clientEl) clientEl.innerText = order.customerName || 'Valued Homeowner';
      if (addressEl) addressEl.innerText = order.address ? (order.address.split(',')[1] || order.address).trim() : 'Pampanga, Philippines';
      if (productEl) productEl.innerText = order.productName || (order.items && order.items[0] && order.items[0].name) || 'TetraTable 4-in-1 Suite';
      if (waybillEl) waybillEl.innerText = `${order.courierTracking || 'EH-FLEET-CBD4821'} (${order.courierName || 'Workshop Fleet'})`;
    }

    const backdrop = document.getElementById('warrantyModalBackdrop');
    const modal = document.getElementById('warrantyModal');
    const card = document.getElementById('warrantyModalCard');
    if (!backdrop || !modal || !card) return;

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  };

  window.closeWarrantyModal = function() {
    const backdrop = document.getElementById('warrantyModalBackdrop');
    const modal = document.getElementById('warrantyModal');
    const card = document.getElementById('warrantyModalCard');
    if (!backdrop || !card) return;

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      if (modal) modal.classList.add('hidden');
    }, 280);
  };

  window.printWarrantyCertificate = function() {
    window.print();
  };

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModals);
  } else {
    injectModals();
  }
})();
