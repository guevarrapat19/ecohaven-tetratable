// EcoHaven Furniture - Natural E-Commerce Customer Notifications System
// Live Order & Workshop Milestone updates from Candaba Workshop to Customer
// User-Scoped Visibility: Customers see only their own notifications; Sellers see all workshop notifications.

(function() {
  const STORAGE_KEY = 'ecohaven_notifications';

  // Retrieve raw stored list of all notifications
  function getAllNotifications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    return [];
  }

  function saveAllNotifications(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      updateBadge();
      window.dispatchEvent(new CustomEvent('ecohaven_notifications_updated', { detail: list }));
    } catch(e) {
      console.error('Failed to save notifications:', e);
    }
  }

  // Get currently logged-in user
  function getCurrentUser() {
    try {
      const u = localStorage.getItem('ecohaven_user') || localStorage.getItem('ecohaven_auth_user') || localStorage.getItem('currentUser');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    if (typeof window.getCurrentEcoHavenUser === 'function') {
      try { return window.getCurrentEcoHavenUser(); } catch (e) {}
    }
    return null;
  }

  // Check if current user is seller/craftsman
  function isSellerUser(user) {
    const isSellerPage = typeof window !== 'undefined' && window.location && (window.location.pathname.includes('seller.html') || window.location.pathname.includes('/seller'));
    if (isSellerPage) return true;
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return role === 'seller' || role === 'admin' || email === 'artisan@ecohaven.ph' || email === 'admin@ecohaven.ph' || email === 'seller@ecohaven.ph';
  }

  // Retrieve notifications filtered strictly by current user scope
  function getNotifications() {
    const all = getAllNotifications();
    const user = getCurrentUser();

    // 1. Seller or Admin: sees ALL notifications across all workshop orders & customers
    if (isSellerUser(user)) {
      return all;
    }

    // 2. Customer: MUST ONLY see notifications addressed to their name / email / order IDs
    if (user && (user.fullName || user.email || user.uid)) {
      const userEmail = (user.email || '').trim().toLowerCase();
      const userName = (user.fullName || user.name || '').trim().toLowerCase();
      const userUid = user.uid || user.id;

      // Collect order IDs placed by this specific customer
      const myOrderIds = [];
      try {
        const storeOrders = (window.ecohaven && window.ecohaven.orders) ? window.ecohaven.orders : {};
        Object.values(storeOrders).forEach(ord => {
          const ordEmail = (ord.email || '').trim().toLowerCase();
          const ordName = (ord.customerName || '').trim().toLowerCase();
          if ((userEmail && ordEmail === userEmail) || (userName && ordName === userName) || (userUid && ord.userId === userUid)) {
            if (ord.orderId) myOrderIds.push(ord.orderId);
          }
        });
      } catch (e) {}

      return all.filter(n => {
        // Direct customer email match
        if (n.customerEmail && userEmail && n.customerEmail.trim().toLowerCase() === userEmail) return true;
        // Direct customer name match
        if (n.customerName && userName && n.customerName.trim().toLowerCase() === userName) return true;
        // Direct UID match
        if (n.userId && userUid && n.userId === userUid) return true;
        // Associated with customer's order
        if (n.orderId && myOrderIds.includes(n.orderId)) return true;
        return false;
      });
    }

    // 3. Guest / Not logged in: NEVER show someone else's private order notifications
    return [];
  }

  function formatTimeAgo(ts) {
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  // Update all alert badges on the page based on scoped notifications
  function updateBadge() {
    const list = getNotifications();
    const unreadCount = list.filter(n => !n.read).length;
    const badges = document.querySelectorAll('#headerAlertBadge, .header-alert-badge');
    badges.forEach(b => {
      if (unreadCount > 0) {
        b.textContent = unreadCount > 9 ? '9+' : unreadCount;
        b.classList.remove('hidden');
        b.style.display = 'flex';
      } else {
        b.classList.add('hidden');
        b.style.display = 'none';
      }
    });
  }

  let activeTab = 'all';

  function renderNotificationItems() {
    const container = document.getElementById('notifItemsList');
    if (!container) return;

    const user = getCurrentUser();
    const isSeller = isSellerUser(user);
    const list = getNotifications();

    let filtered = list;
    if (activeTab === 'orders') {
      filtered = list.filter(n => n.type === 'order' || n.type === 'payment' || n.type === 'alert' || n.type === 'deletion');
    } else if (activeTab === 'workshop') {
      filtered = list.filter(n => n.type === 'workshop');
    }

    // Empty state handling
    if (filtered.length === 0) {
      if (!user) {
        container.innerHTML = `
          <div class="py-10 px-4 text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-[36px] text-outline mb-2 block">lock</span>
            <p class="text-xs font-bold text-on-surface">Customer Notifications are Private</p>
            <p class="text-[11px] text-on-surface-variant mt-1 mb-3">Sign in to your account to view notifications for your handcrafted orders.</p>
            <button type="button" onclick="toggleEcoHavenNotifications(); typeof openAuthModal === 'function' ? openAuthModal() : null;" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-xs">
              <span class="material-symbols-outlined text-[15px]">person</span>
              <span>Sign In / Register</span>
            </button>
          </div>
        `;
      } else {
        const displayName = isSeller ? 'Workshop Master' : (user.fullName || user.name || 'Customer');
        container.innerHTML = `
          <div class="py-10 text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-[36px] text-outline-variant mb-2 block">notifications_paused</span>
            <p class="text-xs font-semibold text-on-surface">No updates for ${displayName}</p>
            <p class="text-[11px] text-on-surface-variant mt-0.5">Order milestones and timber alerts will appear here in real time.</p>
          </div>
        `;
      }
      return;
    }

    const isPagesDir = window.location.pathname.includes('/pages/');
    const trackPath = isPagesDir ? 'track.html' : 'pages/track.html';

    container.innerHTML = filtered.map(item => `
      <div class="relative p-3.5 sm:p-4 rounded-2xl transition-all border ${item.read ? 'bg-surface-container-lowest border-outline-variant/30 opacity-90' : 'bg-surface-container-low border-primary/20 shadow-xs'}" id="${item.id}">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl ${item.badgeColor || 'bg-primary/10 text-primary'} flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
            <span class="material-symbols-outlined text-[19px]">${item.icon || 'notifications'}</span>
          </div>
          <div class="flex-grow min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h4 class="text-xs font-bold text-on-surface truncate leading-tight">${item.title}</h4>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-[10px] text-on-surface-variant font-medium">${formatTimeAgo(item.timestamp)}</span>
                ${!item.read ? `<span class="w-2 h-2 rounded-full bg-primary" title="Unread"></span>` : ''}
              </div>
            </div>
            <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-3">${item.body}</p>
            
            ${item.orderId ? `
              <div class="mt-2.5 flex items-center gap-2">
                ${item.isDeleted ? `
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold">
                    <span class="material-symbols-outlined text-[14px]">delete_forever</span>
                    <span>Order Deleted &amp; Space Cleared</span>
                  </span>
                ` : `
                  <a href="${trackPath}?orderId=${encodeURIComponent(item.orderId)}" onclick="window.markEcoHavenNotificationRead('${item.id}')" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary-container transition-all shadow-xs">
                    <span class="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span>Track Order #${item.orderId.replace('EH-2026-', '')}</span>
                  </a>
                `}
                ${!item.read ? `
                  <button type="button" onclick="window.markEcoHavenNotificationRead('${item.id}')" class="text-[11px] text-on-surface-variant hover:text-primary font-medium px-2 py-1">
                    Mark as read
                  </button>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  function injectNotificationDrawer() {
    if (document.getElementById('ecohavenNotifDrawer')) return;

    const drawerHTML = `
      <div id="ecohavenNotifBackdrop" class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 hidden transition-opacity duration-300 opacity-0" onclick="toggleEcoHavenNotifications()"></div>
      <div id="ecohavenNotifDrawer" class="fixed top-20 right-3 sm:right-6 md:right-10 z-50 w-[94vw] sm:w-[440px] max-w-[440px] bg-surface rounded-3xl shadow-2xl border border-outline-variant/40 hidden transition-all duration-300 transform scale-95 opacity-0 max-h-[85vh] flex flex-col overflow-hidden pointer-events-auto">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 pb-3 border-b border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-secondary-container text-primary flex items-center justify-center font-bold shadow-xs">
              <span class="material-symbols-outlined text-[20px]">notifications_active</span>
            </div>
            <div>
              <h3 class="font-headline text-base sm:text-lg font-bold text-on-surface leading-tight">Order Updates</h3>
              <p class="text-[11px] text-on-surface-variant" id="notifScopeSubtitle">Candaba Workshop Notifications</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.openSimulatedCommsModal()" class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 transition-colors flex items-center gap-1 border border-sky-200" title="View Simulated Email &amp; SMS Outbox">
              <span class="material-symbols-outlined text-[13px]">cell_tower</span>
              <span class="hidden sm:inline">SMS &amp; Email Outbox</span>
              <span class="sm:hidden">Outbox</span>
            </button>
            <button type="button" onclick="window.markAllEcoHavenNotificationsRead()" class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors" title="Mark all read">
              Mark all read
            </button>
            <button type="button" onclick="toggleEcoHavenNotifications()" class="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all" aria-label="Close">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="grid grid-cols-3 p-1 bg-surface-container-low border-b border-outline-variant/20 text-xs">
          <button type="button" id="notifTabAll" onclick="window.switchEcoHavenNotifTab('all')" class="py-1.5 rounded-lg font-bold transition-all bg-primary text-white shadow-xs">
            All
          </button>
          <button type="button" id="notifTabOrders" onclick="window.switchEcoHavenNotifTab('orders')" class="py-1.5 rounded-lg font-medium transition-all text-on-surface-variant hover:text-on-surface">
            Orders & Transit
          </button>
          <button type="button" id="notifTabWorkshop" onclick="window.switchEcoHavenNotifTab('workshop')" class="py-1.5 rounded-lg font-medium transition-all text-on-surface-variant hover:text-on-surface">
            Workshop
          </button>
        </div>

        <!-- Notification Items List -->
        <div id="notifItemsList" class="p-3 sm:p-4 space-y-2.5 overflow-y-auto flex-grow max-h-[58vh]">
          <!-- Injected via renderNotificationItems() -->
        </div>

        <!-- Footer -->
        <div class="p-3 bg-surface-container-lowest border-t border-outline-variant/30 text-center text-[11px] text-on-surface-variant flex items-center justify-between px-4">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Workshop MC: 11.4% Kiln Stabilized
          </span>
          <button type="button" onclick="window.openSimulatedCommsModal()" class="font-bold text-primary hover:underline flex items-center gap-1 text-[11px]">
            <span class="material-symbols-outlined text-[13px]">outgoing_mail</span>
            <span>Simulated Outbox</span>
          </button>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  }

  // Global Toggle Function
  window.toggleEcoHavenNotifications = function() {
    injectNotificationDrawer();
    const backdrop = document.getElementById('ecohavenNotifBackdrop');
    const drawer = document.getElementById('ecohavenNotifDrawer');
    if (!drawer) return;

    const isOpen = !drawer.classList.contains('hidden');
    if (isOpen) {
      drawer.classList.remove('scale-100', 'opacity-100');
      drawer.classList.add('scale-95', 'opacity-0');
      if (backdrop) backdrop.classList.add('opacity-0');
      setTimeout(() => {
        drawer.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
      }, 250);
    } else {
      // Update subtitle to reflect current scope
      const sub = document.getElementById('notifScopeSubtitle');
      const user = getCurrentUser();
      if (sub) {
        if (isSellerUser(user)) {
          sub.textContent = 'All Workshop Orders (Artisan Master)';
        } else if (user) {
          sub.textContent = `Notifications for ${user.fullName || user.name || 'You'}`;
        } else {
          sub.textContent = 'Sign in to see your order updates';
        }
      }

      renderNotificationItems();
      if (backdrop) backdrop.classList.remove('hidden');
      drawer.classList.remove('hidden');
      requestAnimationFrame(() => {
        if (backdrop) backdrop.classList.remove('opacity-0');
        drawer.classList.remove('scale-95', 'opacity-0');
        drawer.classList.add('scale-100', 'opacity-100');
      });
    }
  };

  // Switch filter tabs
  window.switchEcoHavenNotifTab = function(tab) {
    activeTab = tab;
    const tabAll = document.getElementById('notifTabAll');
    const tabOrders = document.getElementById('notifTabOrders');
    const tabWorkshop = document.getElementById('notifTabWorkshop');

    const activeClass = 'py-1.5 rounded-lg font-bold transition-all bg-primary text-white shadow-xs';
    const inactiveClass = 'py-1.5 rounded-lg font-medium transition-all text-on-surface-variant hover:text-on-surface';

    if (tabAll) tabAll.className = tab === 'all' ? activeClass : inactiveClass;
    if (tabOrders) tabOrders.className = tab === 'orders' ? activeClass : inactiveClass;
    if (tabWorkshop) tabWorkshop.className = tab === 'workshop' ? activeClass : inactiveClass;

    renderNotificationItems();
  };

  // Mark single as read
  window.markEcoHavenNotificationRead = function(id) {
    const all = getAllNotifications();
    const item = all.find(n => n.id === id);
    if (item && !item.read) {
      item.read = true;
      saveAllNotifications(all);
      renderNotificationItems();
    }
  };

  // Mark all as read for current user scope
  window.markAllEcoHavenNotificationsRead = function() {
    const all = getAllNotifications();
    const scoped = getNotifications();
    const scopedIds = scoped.map(s => s.id);
    all.forEach(n => {
      if (scopedIds.includes(n.id)) n.read = true;
    });
    saveAllNotifications(all);
    renderNotificationItems();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('Notifications marked as read.', 'success');
    }
  };

  // Add a new notification (called when seller updates or checkout completes)
  window.addEcoHavenNotification = function(notif) {
    const allList = getAllNotifications();

    // Automatically enrich with customer details from order
    let customerName = notif.customerName || null;
    let customerEmail = notif.customerEmail || notif.to || null;
    let userId = notif.userId || null;

    if (notif.orderId && window.ecohaven) {
      try {
        const ord = window.ecohaven.getOrder ? window.ecohaven.getOrder(notif.orderId) : (window.ecohaven.orders ? window.ecohaven.orders[notif.orderId] : null);
        if (ord) {
          if (!customerName) customerName = ord.customerName;
          if (!customerEmail) customerEmail = ord.email;
          if (!userId) userId = ord.userId;
        }
      } catch (e) {}
    }

    const newEntry = {
      id: 'notif_' + Date.now(),
      type: notif.type || 'order',
      title: notif.title || 'Order Update',
      body: notif.body || '',
      orderId: notif.orderId || null,
      isDeleted: !!notif.isDeleted,
      customerName: customerName,
      customerEmail: customerEmail,
      userId: userId,
      timestamp: Date.now(),
      read: false,
      icon: notif.icon || 'notifications',
      badgeColor: notif.badgeColor || 'bg-primary/10 text-primary'
    };

    allList.unshift(newEntry);
    saveAllNotifications(allList);

    // Sync with Firebase Realtime Database
    if (window.ecoHavenDb && notif.orderId) {
      try {
        window.ecoHavenDb.ref('ecohaven/notifications/' + newEntry.id).set(newEntry);
      } catch(e) {}
    }

    // Only show toast if user is allowed to see this notification
    const currentUser = getCurrentUser();
    const isSeller = isSellerUser(currentUser);
    let shouldToast = isSeller;
    if (!isSeller && currentUser) {
      const uEmail = (currentUser.email || '').trim().toLowerCase();
      const uName = (currentUser.fullName || currentUser.name || '').trim().toLowerCase();
      if ((customerEmail && uEmail && customerEmail.toLowerCase() === uEmail) || (customerName && uName && customerName.toLowerCase() === uName)) {
        shouldToast = true;
      }
    }

    if (!notif.silentToast && shouldToast && typeof window.showEcoHavenToast === 'function') {
      const toastType = notif.type === 'alert' || notif.isDeleted ? 'error' : 'info';
      window.showEcoHavenToast(newEntry.title, toastType);
    }
  };

  // Route header alert click to open the notification drawer
  window.handleHeaderAlertClick = function() {
    window.toggleEcoHavenNotifications();
  };

  // Initialize on page load
  function initNotifications() {
    injectNotificationDrawer();
    updateBadge();
    window.addEventListener('ecohaven_notifications_updated', updateBadge);
    window.addEventListener('ecohaven_user_logged_in', () => { updateBadge(); renderNotificationItems(); });
    window.addEventListener('ecohaven_user_logged_out', () => { updateBadge(); renderNotificationItems(); });
    window.addEventListener('storage', () => { updateBadge(); renderNotificationItems(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
  } else {
    initNotifications();
  }
})();
