// EcoHaven Furniture - Simulated Notification Engine (Email & SMS)
// Provides realistic prototype notifications ("Email sent" and "SMS sent") without actual third-party charges.
// Ideal for prototype demonstrations, thesis evaluations, and stakeholder walkthroughs.

(function() {
  const COMMS_STORAGE_KEY = 'ecohaven_simulated_comms';

  function getCommsLog() {
    try {
      const stored = localStorage.getItem(COMMS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [];
  }

  function saveCommsLog(log) {
    try {
      localStorage.setItem(COMMS_STORAGE_KEY, JSON.stringify(log));
      window.dispatchEvent(new CustomEvent('ecohaven_simulated_comms_updated', { detail: log }));
    } catch(e) {
      console.error('Failed to save simulated comms log:', e);
    }
  }

  // Ensure Toast Container exists
  function ensureToastContainer() {
    let container = document.getElementById('ecohavenCommsToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ecohavenCommsToastContainer';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-[420px] w-[92vw] pointer-events-none';
      document.body.appendChild(container);
    }
    return container;
  }

  // Show a floating simulated notification toast
  function showCommsToast(entry) {
    const container = ensureToastContainer();
    const isEmail = entry.type === 'email';
    const toastId = 'toast_' + entry.id;

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'pointer-events-auto bg-surface/95 backdrop-blur-md border rounded-2xl shadow-2xl p-4 transition-all duration-300 transform translate-y-4 opacity-0 flex flex-col gap-2.5 overflow-hidden ' + 
      (isEmail ? 'border-sky-500/40 ring-1 ring-sky-500/20' : 'border-emerald-500/40 ring-1 ring-emerald-500/20');

    const icon = isEmail ? 'mark_email_read' : 'sms';
    const badgeBg = isEmail ? 'bg-sky-500/15 text-sky-700' : 'bg-emerald-500/15 text-emerald-800';
    const tagText = isEmail ? 'SIMULATED EMAIL SENT' : 'SIMULATED SMS SENT';
    const metaRoute = isEmail ? 'Mock SMTP: mail.ecohaven.ph (Port 587)' : 'Gateway: Semaphore PH (Smart/Globe Route)';

    toast.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg ${badgeBg} flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[17px]">${icon}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${badgeBg}">${tagText}</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px] text-on-surface-variant font-mono">Just now</span>
          <button type="button" onclick="document.getElementById('${toastId}')?.remove()" class="w-6 h-6 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Dismiss">
            <span class="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-on-surface truncate">To: ${entry.to}</span>
          ${entry.orderId ? `<span class="font-mono text-[11px] text-primary font-bold">#${entry.orderId}</span>` : ''}
        </div>
        ${isEmail ? `<p class="text-xs font-semibold text-on-surface truncate">${entry.subject}</p>` : ''}
        <p class="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">${entry.body || entry.message}</p>
      </div>

      <div class="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px] text-on-surface-variant">
        <span class="flex items-center gap-1 font-mono text-outline">
          <span class="w-1.5 h-1.5 rounded-full ${isEmail ? 'bg-sky-500' : 'bg-emerald-500'} animate-ping"></span>
          ${metaRoute}
        </span>
        <button type="button" onclick="window.openSimulatedCommsModal('${entry.id}')" class="font-bold text-primary hover:underline flex items-center gap-0.5">
          <span>Open Email Inbox</span>
          <span class="material-symbols-outlined text-[12px]">open_in_new</span>
        </button>
      </div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto-dismiss after 6.5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }
    }, 6500);
  }

  // 1. SIMULATE EMAIL DISPATCH
  window.simulateEmailNotification = function(opts) {
    if (!opts || !opts.to) return;
    const entry = {
      id: 'email_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'email',
      to: opts.to,
      subject: opts.subject || 'EcoHaven Furniture Notification',
      body: opts.body || '',
      orderId: opts.orderId || null,
      category: opts.category || 'General',
      timestamp: Date.now(),
      status: 'DELIVERED_SIMULATED',
      gateway: 'Mock SMTP / SendGrid Simulator'
    };

    const log = getCommsLog();
    log.unshift(entry);
    saveCommsLog(log);
    showCommsToast(entry);

    // REALTIME CLOUD SYNC TO FIREBASE (ecohaven/emails)
    if (window.ecoHavenDb) {
      try {
        window.ecoHavenDb.ref('ecohaven/emails/' + entry.id).set({
          id: entry.id,
          subject: entry.subject,
          fromName: opts.fromName || 'EcoHaven Workshop Dispatch',
          fromEmail: opts.fromEmail || 'notifications@ecohaven.ph',
          toEmail: entry.to,
          orderId: entry.orderId || 'WF-2026-ONLINE',
          dateStr: new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          timestamp: entry.timestamp,
          unread: true,
          body: entry.body || ''
        });
        console.log("☁️ Simulated Email Synced to Firebase Cloud (ecohaven/emails):", entry.id);
      } catch(err) {
        console.warn("Firebase email sync notice:", err);
      }
    }

    return entry;
  };

  // 2. SIMULATE SMS DISPATCH
  window.simulateSmsNotification = function(opts) {
    if (!opts || !opts.to) return;
    const entry = {
      id: 'sms_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'sms',
      to: opts.to,
      message: opts.message || '',
      orderId: opts.orderId || null,
      category: opts.category || 'Order Status',
      timestamp: Date.now(),
      status: 'DELIVERED_SIMULATED',
      gateway: opts.gateway || 'Semaphore PH Gateway (Infobip Fallback)'
    };

    const log = getCommsLog();
    log.unshift(entry);
    saveCommsLog(log);
    showCommsToast(entry);

    // REALTIME CLOUD SYNC TO FIREBASE (ecohaven/sms)
    if (window.ecoHavenDb) {
      try {
        window.ecoHavenDb.ref('ecohaven/sms/' + entry.id).set({
          id: entry.id,
          type: 'sms',
          to: entry.to,
          message: entry.message || '',
          orderId: entry.orderId || 'WF-2026-ONLINE',
          category: entry.category || 'Order Status',
          timestamp: entry.timestamp,
          status: entry.status,
          gateway: entry.gateway
        });
        console.log("☁️ Simulated SMS Synced to Firebase Cloud (ecohaven/sms):", entry.id);
      } catch(err) {
        console.warn("Firebase SMS sync notice:", err);
      }
    }

    return entry;
  };

  // Retrieve raw log
  window.getAllRawSimulatedCommsLog = getCommsLog;

  function extractOrderIdFromCommsItem(item) {
    if (!item) return null;
    if (item.orderId && String(item.orderId).toUpperCase().startsWith('EH-')) {
      return String(item.orderId).replace(/^#/, '').trim();
    }
    const text = `${item.subject || ''} ${item.body || ''} ${item.message || ''}`;
    const m = text.match(/#?(EH-\d{4}-\d{4,6})/i);
    return m ? m[1].toUpperCase() : (item.orderId ? String(item.orderId).replace(/^#/, '').trim() : null);
  }

  function itemMatchesOrderId(item, targetOrderId) {
    if (!item || !targetOrderId) return false;
    const cleanTarget = String(targetOrderId).replace(/^#/, '').trim().toUpperCase();
    if (!cleanTarget) return false;
    const itemOrd = extractOrderIdFromCommsItem(item);
    if (itemOrd && itemOrd.toUpperCase() === cleanTarget) return true;
    const text = `${item.orderId || ''} ${item.subject || ''} ${item.body || ''} ${item.message || ''}`.toUpperCase();
    return text.includes(cleanTarget);
  }

  // Cascade-delete all Emails, SMS, and Notifications for a deleted orderId from Firebase & LocalStorage
  window.deleteSimulatedCommsByOrderId = async function(orderId) {
    if (!orderId) return;
    const cleanOrderId = String(orderId).replace(/^#/, '').trim().toUpperCase();
    if (!cleanOrderId) return;

    // 1. Filter local simulated comms
    const currentLog = getCommsLog();
    const removedItems = currentLog.filter(item => itemMatchesOrderId(item, cleanOrderId));
    const remainingLog = currentLog.filter(item => !itemMatchesOrderId(item, cleanOrderId));
    _cloudEmailsSnapshot = (_cloudEmailsSnapshot || []).filter(item => !itemMatchesOrderId(item, cleanOrderId));
    _cloudSmsSnapshot = (_cloudSmsSnapshot || []).filter(item => !itemMatchesOrderId(item, cleanOrderId));
    saveCommsLog(remainingLog);

    // 2. Filter seller emails cache
    try {
      const sellerEmailsRaw = localStorage.getItem('ecohaven_seller_emails');
      if (sellerEmailsRaw) {
        const parsed = JSON.parse(sellerEmailsRaw);
        if (Array.isArray(parsed)) {
          const kept = parsed.filter(e => !itemMatchesOrderId(e, cleanOrderId));
          localStorage.setItem('ecohaven_seller_emails', JSON.stringify(kept));
          window.dispatchEvent(new CustomEvent('ecohaven_seller_emails_updated', { detail: kept }));
        }
      }
    } catch (e) {}

    // 3. Filter notifications cache
    try {
      const notifsRaw = localStorage.getItem('ecohaven_notifications');
      if (notifsRaw) {
        const parsedN = JSON.parse(notifsRaw);
        if (Array.isArray(parsedN)) {
          const keptN = parsedN.filter(n => !itemMatchesOrderId(n, cleanOrderId));
          localStorage.setItem('ecohaven_notifications', JSON.stringify(keptN));
          window.dispatchEvent(new CustomEvent('ecohaven_notifications_updated', { detail: keptN }));
        }
      }
    } catch (e) {}

    // 4. Delete matching Emails, SMS, Notifications, and Chat Rooms from Firebase RTDB
    if (window.ecoHavenDb) {
      const deletePromises = [];

      // Remove already-known IDs immediately
      removedItems.forEach(item => {
        if (item && item.id) {
          const path = item.type === 'sms' ? ('ecohaven/sms/' + item.id) : ('ecohaven/emails/' + item.id);
          deletePromises.push(window.ecoHavenDb.ref(path).remove().catch(() => {}));
        }
      });

      // Scan ecohaven/emails in Firebase to catch any cloud records matching cleanOrderId
      deletePromises.push(
        window.ecoHavenDb.ref('ecohaven/emails').once('value').then(snap => {
          const val = snap.val();
          if (!val) return;
          const p = [];
          Object.keys(val).forEach(key => {
            if (itemMatchesOrderId(val[key], cleanOrderId)) {
              p.push(window.ecoHavenDb.ref('ecohaven/emails/' + key).remove().catch(() => {}));
            }
          });
          return Promise.all(p);
        }).catch(() => {})
      );

      // Scan ecohaven/sms in Firebase to catch any cloud records matching cleanOrderId
      deletePromises.push(
        window.ecoHavenDb.ref('ecohaven/sms').once('value').then(snap => {
          const val = snap.val();
          if (!val) return;
          const p = [];
          Object.keys(val).forEach(key => {
            if (itemMatchesOrderId(val[key], cleanOrderId)) {
              p.push(window.ecoHavenDb.ref('ecohaven/sms/' + key).remove().catch(() => {}));
            }
          });
          return Promise.all(p);
        }).catch(() => {})
      );

      // Scan ecohaven/notifications in Firebase to remove notifications for deleted orderId
      deletePromises.push(
        window.ecoHavenDb.ref('ecohaven/notifications').once('value').then(snap => {
          const val = snap.val();
          if (!val) return;
          const p = [];
          Object.keys(val).forEach(key => {
            const n = val[key];
            if (n && (String(n.orderId || '').toUpperCase() === cleanOrderId || String(n.title || '').toUpperCase().includes(cleanOrderId))) {
              p.push(window.ecoHavenDb.ref('ecohaven/notifications/' + key).remove().catch(() => {}));
            }
          });
          return Promise.all(p);
        }).catch(() => {})
      );

      // Scan ecohaven/chats in Firebase to remove chat rooms tied to deleted orderId
      deletePromises.push(
        window.ecoHavenDb.ref('ecohaven/chats').once('value').then(snap => {
          const val = snap.val();
          if (!val) return;
          const p = [];
          Object.keys(val).forEach(key => {
            const c = val[key];
            if (c && String(c.orderId || '').toUpperCase() === cleanOrderId) {
              p.push(window.ecoHavenDb.ref('ecohaven/chats/' + key).remove().catch(() => {}));
            }
          });
          return Promise.all(p);
        }).catch(() => {})
      );

      await Promise.all(deletePromises);
      console.log(`🗑️ Purged all related Emails, SMS, and Notifications in Firebase for deleted Order #${cleanOrderId}`);
    }

    renderCommsModalContent();
  };

  // Automatically purge orphan emails/SMS in Firebase whose EH-2026-XXXXX orderId was previously deleted
  let _orphanPurgeInProgress = false;
  window.purgeOrphanOrderCommsFromFirebase = function() {
    if (_orphanPurgeInProgress) return;
    if (!window.ecohaven || !window.ecohaven.cloudSynced) return;
    const activeOrdersMap = window.ecohaven.orders || {};
    const activeOrderIds = new Set(Object.keys(activeOrdersMap).map(k => k.toUpperCase()));

    const allItems = getCommsLog();
    const orphanIds = new Set();

    allItems.forEach(item => {
      const ordId = extractOrderIdFromCommsItem(item);
      if (ordId && /^EH-\d{4}-\d{4,6}$/i.test(ordId)) {
        if (!activeOrderIds.has(ordId.toUpperCase())) {
          orphanIds.add(ordId.toUpperCase());
        }
      }
    });

    if (orphanIds.size > 0) {
      _orphanPurgeInProgress = true;
      Promise.all(Array.from(orphanIds).map(oid => window.deleteSimulatedCommsByOrderId(oid)))
        .finally(() => { _orphanPurgeInProgress = false; });
    }
  };

  // Helper to get current logged-in user
  function getActiveViewerUser() {
    try {
      const raw = localStorage.getItem('ecohaven_user') || localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return null;
  }

  function isViewerSeller(user) {
    const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
    if (path.includes('seller.html') || path.endsWith('/seller')) return true;
    if (!user) return false;
    const role = String(user.role || '').toLowerCase();
    const email = String(user.email || '').toLowerCase();
    return role === 'seller' || role === 'admin' || email === 'artisan@ecohaven.ph' || email === 'admin@ecohaven.ph' || email === 'seller@ecohaven.ph';
  }

  let activeModalFilter = 'all';
  let activeSelectedEntryId = null;
  let activeModalOrderFilter = null;

  // Recipient-Scoped Comms Log:
  // - On track.html when tracking an order (or when activeModalOrderFilter is set): shows ONLY that order's emails & SMS
  // - Seller on seller.html: shows all active orders' emails & SMS
  // - Logged-in Customer: shows ONLY emails & SMS addressed to their email/phone or belonging to their active orders
  // - Guest not tracking an order: shows only their current session's last placed order (if active), never other customers' logs
  function getScopedCommsLog() {
    let list = getCommsLog();
    const activeOrdersMap = (window.ecohaven && window.ecohaven.orders) ? window.ecohaven.orders : null;
    const cloudSynced = !!(window.ecohaven && window.ecohaven.cloudSynced);

    // 1. Exclude any comms from deleted orders
    if (activeOrdersMap && (cloudSynced || Object.keys(activeOrdersMap).length > 0)) {
      const validIds = new Set(Object.keys(activeOrdersMap).map(k => k.toUpperCase()));
      list = list.filter(item => {
        const ordId = extractOrderIdFromCommsItem(item);
        if (ordId && /^EH-\d{4}-\d{4,6}$/i.test(ordId)) {
          return validIds.has(ordId.toUpperCase());
        }
        return true;
      });
    }

    const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
    const isTrackPage = path.includes('track.html') || path.endsWith('/track');
    const trackedOrderId = activeModalOrderFilter || (isTrackPage && window.currentActiveOrderId ? window.currentActiveOrderId : null);

    // 2. If tracking a specific order on track.html (Guest or Customer), scope strictly to that tracked order!
    if (trackedOrderId) {
      return list.filter(item => itemMatchesOrderId(item, trackedOrderId));
    }

    const user = getActiveViewerUser();

    // 3. Seller / Admin sees all non-deleted workshop dispatches
    if (isViewerSeller(user)) {
      return list;
    }

    // 4. Logged-in Customer Account: scope strictly to receiver email, phone, or customer's own active orders
    if (user && (user.email || user.phone || user.uid)) {
      const uEmail = String(user.email || '').trim().toLowerCase();
      const uPhoneTail = String(user.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const uUid = user.uid || user.id || '';
      const myOrderIds = new Set();

      if (activeOrdersMap) {
        Object.values(activeOrdersMap).forEach(ord => {
          if (!ord || !ord.orderId) return;
          const oEmail = String(ord.email || ord.customerEmail || '').trim().toLowerCase();
          const oPhoneTail = String(ord.phone || ord.contactPhone || '').replace(/[^0-9]/g, '').slice(-10);
          if (
            (uUid && ord.userId === uUid) ||
            (uEmail && oEmail && oEmail === uEmail) ||
            (uPhoneTail.length >= 10 && oPhoneTail === uPhoneTail)
          ) {
            myOrderIds.add(String(ord.orderId).toUpperCase());
          }
        });
      }

      return list.filter(item => {
        const itemOrd = extractOrderIdFromCommsItem(item);
        // If item belongs to a specific EH order and we know the orders, check if it's the user's order or addressed to the user
        if (itemOrd && myOrderIds.has(itemOrd.toUpperCase())) return true;
        const toRaw = String(item.to || '').trim().toLowerCase();
        const toPhoneTail = String(item.to || '').replace(/[^0-9]/g, '').slice(-10);
        if (uEmail && toRaw === uEmail) return true;
        if (uPhoneTail.length >= 10 && toPhoneTail === uPhoneTail) return true;
        return false;
      });
    }

    // 5. Guest Customer not currently tracking an order on track.html:
    // Only show dispatches for their own session's last placed order (if any)
    try {
      const lastOrderId = localStorage.getItem('ecohaven_last_order_id');
      if (lastOrderId && (!activeOrdersMap || activeOrdersMap[lastOrderId])) {
        return list.filter(item => itemMatchesOrderId(item, lastOrderId));
      }
    } catch (e) {}

    return [];
  }

  window.getSimulatedCommsLog = getScopedCommsLog;
  window.getScopedSimulatedCommsLog = getScopedCommsLog;

  // Clear log (clears scoped items for customer/tracked order, or all for seller)
  window.clearSimulatedCommsLog = function() {
    const user = getActiveViewerUser();
    const isSeller = isViewerSeller(user) && !activeModalOrderFilter;

    if (isSeller) {
      localStorage.removeItem(COMMS_STORAGE_KEY);
      _cloudEmailsSnapshot = [];
      _cloudSmsSnapshot = [];
      saveCommsLog([]);
      if (window.ecoHavenDb) {
        try {
          window.ecoHavenDb.ref('ecohaven/emails').remove();
          window.ecoHavenDb.ref('ecohaven/sms').remove();
        } catch (e) {}
      }
    } else {
      const scopedItems = getScopedCommsLog();
      const scopedIds = new Set(scopedItems.map(x => x.id));
      const remaining = getCommsLog().filter(x => !scopedIds.has(x.id));
      _cloudEmailsSnapshot = (_cloudEmailsSnapshot || []).filter(x => !scopedIds.has(x.id));
      _cloudSmsSnapshot = (_cloudSmsSnapshot || []).filter(x => !scopedIds.has(x.id));
      saveCommsLog(remaining);
      if (window.ecoHavenDb) {
        scopedItems.forEach(item => {
          if (item && item.id) {
            const path = item.type === 'sms' ? ('ecohaven/sms/' + item.id) : ('ecohaven/emails/' + item.id);
            try { window.ecoHavenDb.ref(path).remove(); } catch (e) {}
          }
        });
      }
    }
    renderCommsModalContent();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('Inbox notifications cleared.', 'info');
    }
  };

  // ==============================================================================
  // SIMULATED OUTBOX & GATEWAY VIEWER MODAL
  // ==============================================================================

  function injectCommsModal() {
    if (document.getElementById('ecohavenCommsModal')) return;

    const modalHTML = `
      <div id="ecohavenCommsModalBackdrop" class="fixed inset-0 bg-black/25 backdrop-blur-[3px] z-50 hidden transition-opacity duration-300 opacity-0" onclick="window.closeSimulatedCommsModal()"></div>
      <div id="ecohavenCommsModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none hidden">
        <div class="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl border border-outline-variant/40 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[90vh] flex flex-col overflow-hidden" id="ecohavenCommsModalCard">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-secondary-container text-primary flex items-center justify-center font-bold shadow-sm">
                <span class="material-symbols-outlined text-[22px]">mail</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-headline text-lg sm:text-xl font-bold text-on-surface leading-tight">My Incoming Emails &amp; Workshop Alerts</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">LIVE INBOX</span>
                </div>
                <p class="text-xs text-on-surface-variant">Official incoming emails, warranty certificates, and SMS updates from EcoHaven Candaba Atelier</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="window.clearSimulatedCommsLog()" class="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1" title="Clear all logs">
                <span class="material-symbols-outlined text-sm">delete</span>
                <span class="hidden sm:inline">Clear Inbox</span>
              </button>
              <button type="button" onclick="window.closeSimulatedCommsModal()" class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all" aria-label="Close">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <!-- Controls Bar -->
          <div class="p-3 bg-surface-container-low border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-1.5">
              <button type="button" id="commsFilterAll" onclick="window.filterSimulatedComms('all')" class="px-3 py-1.5 rounded-lg font-bold bg-primary text-white shadow-xs">All Incoming</button>
              <button type="button" id="commsFilterEmail" onclick="window.filterSimulatedComms('email')" class="px-3 py-1.5 rounded-lg font-medium text-on-surface-variant hover:text-on-surface">Incoming Emails</button>
              <button type="button" id="commsFilterSms" onclick="window.filterSimulatedComms('sms')" class="px-3 py-1.5 rounded-lg font-medium text-on-surface-variant hover:text-on-surface">SMS Alerts</button>
            </div>
            <div class="text-[11px] text-on-surface-variant font-mono" id="commsStatsBadge">
              Loading dispatches...
            </div>
          </div>

          <!-- Content Split: List & Preview Pane -->
          <div class="grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-grow min-h-[380px]">
            
            <!-- Left List -->
            <div class="md:col-span-5 border-r border-outline-variant/30 overflow-y-auto no-scrollbar p-3 space-y-2 bg-surface" id="commsItemsList">
              <!-- Dynamically populated -->
            </div>

            <!-- Right Detail Preview -->
            <div class="md:col-span-7 p-4 sm:p-6 overflow-y-auto bg-surface-container-lowest flex flex-col justify-between" id="commsPreviewPane">
              <!-- Dynamically populated -->
            </div>

          </div>

          <!-- Footer Notice -->
          <div class="p-3 bg-surface-container-lowest border-t border-outline-variant/30 text-center text-xs text-on-surface-variant flex items-center justify-between px-5">
            <span class="text-[11px] text-outline">⚡ Realistic simulation: displays live outgoing alerts for user validation without external gateway billing.</span>
            <span class="text-[11px] font-bold text-primary">EcoHaven Security Suite</span>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function renderCommsModalContent() {
    const listContainer = document.getElementById('commsItemsList');
    const previewContainer = document.getElementById('commsPreviewPane');
    const statsBadge = document.getElementById('commsStatsBadge');
    if (!listContainer || !previewContainer) return;

    const log = getScopedCommsLog();
    let filtered = log;
    if (activeModalFilter === 'email') filtered = log.filter(x => x.type === 'email');
    if (activeModalFilter === 'sms') filtered = log.filter(x => x.type === 'sms');

    const emailCount = log.filter(x => x.type === 'email').length;
    const smsCount = log.filter(x => x.type === 'sms').length;
    if (statsBadge) {
      const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
      const isTrackPage = path.includes('track.html') || path.endsWith('/track');
      const trackedOrderId = activeModalOrderFilter || (isTrackPage && window.currentActiveOrderId ? window.currentActiveOrderId : null);
      const user = getActiveViewerUser();
      let scopeLabel = '100% Simulated Delivery';
      if (trackedOrderId) {
        scopeLabel = `Order #${String(trackedOrderId).replace(/^#/, '')}`;
      } else if (user && !isViewerSeller(user) && user.email) {
        scopeLabel = `Receiver: ${user.email}`;
      } else if (isViewerSeller(user)) {
        scopeLabel = 'All Active Workshop Orders';
      }
      statsBadge.innerText = `${emailCount} Emails • ${smsCount} SMS (${scopeLabel})`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl text-outline-variant mb-2 block">outgoing_mail</span>
          <p class="text-xs font-bold text-on-surface">No incoming emails or SMS for this recipient yet</p>
          <p class="text-[11px] text-on-surface-variant mt-1">Updates for your active order or registered account will appear here in real time.</p>
        </div>
      `;
      previewContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center py-16 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl text-outline-variant/50 mb-3 block">mark_email_unread</span>
          <h4 class="text-sm font-bold text-on-surface">Outbox Preview Pane</h4>
          <p class="text-xs text-on-surface-variant max-w-sm mt-1">Select any simulated notification from the list to inspect formatted HTML email layouts or realistic mobile phone messages.</p>
        </div>
      `;
      return;
    }

    // Default select first item if none active
    if (!activeSelectedEntryId || !filtered.some(x => x.id === activeSelectedEntryId)) {
      activeSelectedEntryId = filtered[0].id;
    }

    // Render List Items
    listContainer.innerHTML = filtered.map(item => {
      const isEmail = item.type === 'email';
      const isSelected = item.id === activeSelectedEntryId;
      const icon = isEmail ? 'mail' : 'chat';
      const timeStr = new Date(item.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

      return `
        <div onclick="window.selectSimulatedCommsItem('${item.id}')" 
             class="p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-secondary-container/30 border-primary shadow-xs' : 'bg-surface hover:bg-surface-container-low border-outline-variant/30'}">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isEmail ? 'text-sky-700' : 'text-emerald-800'}">
              <span class="material-symbols-outlined text-[13px]">${icon}</span>
              <span>${isEmail ? 'Email' : 'SMS'}</span>
            </span>
            <span class="text-[10px] text-on-surface-variant font-mono">${timeStr}</span>
          </div>
          <div class="text-xs font-bold text-on-surface truncate">${item.to}</div>
          <div class="text-[11px] text-on-surface-variant truncate mt-0.5">${item.subject || item.message}</div>
          ${item.orderId ? `<div class="mt-1 inline-block px-1.5 py-0.2 rounded bg-surface-container text-[10px] font-mono text-primary font-bold">#${item.orderId}</div>` : ''}
        </div>
      `;
    }).join('');

    // Render Preview Pane for active item
    const selected = filtered.find(x => x.id === activeSelectedEntryId) || filtered[0];
    if (selected) {
      const isEmail = selected.type === 'email';
      const dateFormatted = new Date(selected.timestamp).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

      if (isEmail) {
        previewContainer.innerHTML = `
          <div class="space-y-4">
            <div class="p-3 bg-surface rounded-2xl border border-outline-variant/30 space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-on-surface-variant">SMTP Envelope:</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">200 OK • SIMULATED</span>
              </div>
              <div><strong class="text-on-surface">To:</strong> <span class="font-mono text-primary font-bold">${selected.to}</span></div>
              <div><strong class="text-on-surface">From:</strong> <span class="font-mono text-on-surface-variant">EcoHaven Candaba &lt;notifications@ecohaven.ph&gt;</span></div>
              <div><strong class="text-on-surface">Subject:</strong> <span class="font-semibold text-on-surface">${selected.subject}</span></div>
              <div><strong class="text-on-surface">Date:</strong> <span class="text-on-surface-variant">${dateFormatted}</span></div>
            </div>

            <!-- Simulated HTML Email Template Box -->
            <div class="border border-outline-variant/30 rounded-2xl p-6 bg-white text-gray-800 shadow-xs space-y-4 font-sans text-sm">
              <div class="flex items-center justify-between border-b pb-3 border-gray-200">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">EH</div>
                  <span class="font-bold text-gray-900 tracking-tight">EcoHaven Furniture</span>
                </div>
                <span class="text-xs text-gray-600">Candaba, Pampanga</span>
              </div>

              <div>
                <h4 class="text-base font-bold text-gray-900 mb-2">${selected.subject}</h4>
                <p class="text-xs leading-relaxed text-gray-700 whitespace-pre-line">${selected.body}</p>
              </div>

              ${selected.orderId ? `
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <span class="font-bold text-gray-700 block mb-1">Order Reference: #${selected.orderId}</span>
                  <span class="text-gray-500">Live Fabrication Status: Solignum Treated • Kiln Dried Solid Philippine Mahogany</span>
                </div>
              ` : ''}

              <div class="pt-3 border-t border-gray-200 text-[11px] text-gray-600 flex justify-between items-center">
                <span>Dalan Batu, Pasig, Candaba, Pampanga 2013</span>
                <span>Hotline: +63 981 255 8028</span>
              </div>
            </div>
          </div>
        `;
      } else {
        // SMS Phone Mock Preview
        previewContainer.innerHTML = `
          <div class="space-y-4">
            <div class="p-3 bg-surface rounded-2xl border border-outline-variant/30 space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-on-surface-variant">Telco Gateway:</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">DELIVERED • SIMULATED</span>
              </div>
              <div><strong class="text-on-surface">Recipient Phone:</strong> <span class="font-mono text-primary font-bold">${selected.to}</span></div>
              <div><strong class="text-on-surface">Sender ID:</strong> <span class="font-mono text-on-surface-variant">EcoHavenPH (Semaphore Gateway)</span></div>
              <div><strong class="text-on-surface">Timestamp:</strong> <span class="text-on-surface-variant">${dateFormatted}</span></div>
            </div>

            <!-- Realistic Smartphone Message Bubble -->
            <div class="max-w-sm mx-auto bg-stone-900 rounded-[32px] p-4 text-white shadow-xl border-4 border-stone-800">
              <div class="text-center text-[10px] text-stone-400 mb-4 pb-2 border-b border-stone-800">
                Messages • Semaphore Gateway (Smart/Globe)
              </div>
              
              <div class="space-y-3">
                <div class="text-center text-[10px] text-stone-400">Today ${new Date(selected.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div class="p-3.5 rounded-2xl bg-emerald-700 text-white text-xs leading-relaxed max-w-[90%] shadow-md">
                  ${selected.message}
                </div>
                <div class="text-right text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                  <span>Delivered</span>
                  <span class="material-symbols-outlined text-[12px]">done_all</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  window.selectSimulatedCommsItem = function(id) {
    activeSelectedEntryId = id;
    renderCommsModalContent();
  };

  window.filterSimulatedComms = function(filter) {
    activeModalFilter = filter;
    const btnAll = document.getElementById('commsFilterAll');
    const btnEmail = document.getElementById('commsFilterEmail');
    const btnSms = document.getElementById('commsFilterSms');

    const activeCls = 'px-3 py-1.5 rounded-lg font-bold bg-primary text-white shadow-xs';
    const inactiveCls = 'px-3 py-1.5 rounded-lg font-medium text-on-surface-variant hover:text-on-surface';

    if (btnAll) btnAll.className = filter === 'all' ? activeCls : inactiveCls;
    if (btnEmail) btnEmail.className = filter === 'email' ? activeCls : inactiveCls;
    if (btnSms) btnSms.className = filter === 'sms' ? activeCls : inactiveCls;

    renderCommsModalContent();
  };

  window.openSimulatedCommsModal = function(highlightId, scopeOpts) {
    injectCommsModal();
    if (scopeOpts && typeof scopeOpts === 'object' && scopeOpts.orderId) {
      activeModalOrderFilter = scopeOpts.orderId;
    } else {
      activeModalOrderFilter = null;
    }
    if (highlightId) activeSelectedEntryId = highlightId;
    renderCommsModalContent();

    const backdrop = document.getElementById('ecohavenCommsModalBackdrop');
    const modal = document.getElementById('ecohavenCommsModal');
    const card = document.getElementById('ecohavenCommsModalCard');
    if (!backdrop || !modal || !card) return;

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  };

  window.closeSimulatedCommsModal = function() {
    const backdrop = document.getElementById('ecohavenCommsModalBackdrop');
    const modal = document.getElementById('ecohavenCommsModal');
    const card = document.getElementById('ecohavenCommsModalCard');
    if (!backdrop || !card) return;

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      backdrop.classList.add('hidden');
      if (modal) modal.classList.add('hidden');
    }, 280);
  };

  // Sync live with Firebase RTDB (ecohaven/emails & ecohaven/sms) — FIREBASE IS #1 PRIORITY, LOCALSTORAGE MIRRORS CLOUD
  let _cloudEmailsSnapshot = [];
  let _cloudSmsSnapshot = [];

  function syncCloudCommsToLocal() {
    const merged = [..._cloudEmailsSnapshot, ..._cloudSmsSnapshot].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    saveCommsLog(merged);
    if (typeof window.purgeOrphanOrderCommsFromFirebase === 'function') {
      window.purgeOrphanOrderCommsFromFirebase();
    }
    if (document.getElementById('ecohavenCommsModal') && !document.getElementById('ecohavenCommsModal').classList.contains('hidden')) {
      renderCommsModalContent();
    }
  }

  function initCloudEmailInboxListener() {
    if (!window.ecoHavenDb) return;
    try {
      window.ecoHavenDb.ref('ecohaven/emails').on('value', (snap) => {
        const cloudEmails = snap.val();
        if (!cloudEmails) {
          _cloudEmailsSnapshot = [];
        } else {
          _cloudEmailsSnapshot = Object.values(cloudEmails).filter(Boolean).map(ce => ({
            id: ce.id || ('email_' + (ce.timestamp || Date.now())),
            type: 'email',
            to: ce.toEmail || ce.to || 'customer@ecohaven.ph',
            fromName: ce.fromName || 'EcoHaven Candaba Workshop',
            fromEmail: ce.fromEmail || 'notifications@ecohaven.ph',
            subject: ce.subject || 'EcoHaven Workshop Update',
            body: ce.body || ce.message || '',
            orderId: ce.orderId || null,
            timestamp: ce.timestamp || Date.now(),
            unread: ce.unread !== false,
            status: 'DELIVERED_SIMULATED',
            gateway: 'Firebase Cloud SMTP Sync'
          }));
        }
        syncCloudCommsToLocal();
      });

      window.ecoHavenDb.ref('ecohaven/sms').on('value', (snap) => {
        const cloudSms = snap.val();
        if (!cloudSms) {
          _cloudSmsSnapshot = [];
        } else {
          _cloudSmsSnapshot = Object.values(cloudSms).filter(Boolean).map(cs => ({
            id: cs.id || ('sms_' + (cs.timestamp || Date.now())),
            type: 'sms',
            to: cs.to || '09170000000',
            message: cs.message || '',
            orderId: cs.orderId || null,
            category: cs.category || 'Order Status',
            timestamp: cs.timestamp || Date.now(),
            status: cs.status || 'DELIVERED_SIMULATED',
            gateway: cs.gateway || 'Firebase Cloud SMS Sync'
          }));
        }
        syncCloudCommsToLocal();
      });
    } catch (e) {}
  }

  window.addEventListener('ecohaven_orders_updated', () => {
    if (typeof window.purgeOrphanOrderCommsFromFirebase === 'function') {
      window.purgeOrphanOrderCommsFromFirebase();
    }
    if (document.getElementById('ecohavenCommsModal') && !document.getElementById('ecohavenCommsModal').classList.contains('hidden')) {
      renderCommsModalContent();
    }
  });

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectCommsModal();
      setTimeout(initCloudEmailInboxListener, 400);
    });
  } else {
    injectCommsModal();
    setTimeout(initCloudEmailInboxListener, 400);
  }
})();

