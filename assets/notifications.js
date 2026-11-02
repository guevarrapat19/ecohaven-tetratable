// EcoHaven Furniture - Natural E-Commerce Customer Notifications System
// Live Order & Workshop Milestone updates from Candaba Workshop to Customer

(function() {
  const STORAGE_KEY = 'ecohaven_notifications';

  const INITIAL_NOTIFICATIONS = [
    {
      id: "notif_01",
      type: "order",
      title: "🚚 Out for Delivery via Workshop Fleet",
      body: "Order #EH-2026-88123 has been quality inspected and dispatched via Workshop Fleet (Plate: CBD 4821). Driver: Mang Juan S. On the way to Pasig, Candaba.",
      orderId: "EH-2026-88123",
      timestamp: Date.now() - 35 * 60 * 1000,
      read: false,
      icon: "local_shipping",
      badgeColor: "bg-amber-100 text-amber-800"
    },
    {
      id: "notif_02",
      type: "order",
      title: "🪚 Production Milestone: Joinery & Sanding",
      body: "Your TetraTable 4-in-1 Suite has progressed to Stage 3! Master woodworkers are assembling the precision interlocking slats and sanding contact surfaces.",
      orderId: "EH-2026-88123",
      timestamp: Date.now() - 3 * 3600 * 1000,
      read: false,
      icon: "handyman",
      badgeColor: "bg-primary/10 text-primary"
    },
    {
      id: "notif_03",
      type: "workshop",
      title: "🪵 Timber Cut & Solignum Termite-Treated",
      body: "Solid Philippine Mahogany stock stabilized to 11.4% moisture content and treated with Solignum anti-termite biocide (Batch #PMP-2026-ND-491).",
      orderId: "EH-2026-88123",
      timestamp: Date.now() - 22 * 3600 * 1000,
      read: true,
      icon: "water_drop",
      badgeColor: "bg-tertiary/10 text-tertiary"
    },
    {
      id: "notif_04",
      type: "payment",
      title: "✅ 50% Earnest Down Payment Verified",
      body: "₱3,467.00 down payment confirmed via GCash (Ref: 9021-8841-2910). Candaba workshop fabrication queue initialized.",
      orderId: "EH-2026-88123",
      timestamp: Date.now() - 48 * 3600 * 1000,
      read: true,
      icon: "verified",
      badgeColor: "bg-emerald-100 text-emerald-800"
    }
  ];

  function getNotifications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }

  function saveNotifications(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      updateBadge();
      window.dispatchEvent(new CustomEvent('ecohaven_notifications_updated', { detail: list }));
    } catch(e) {
      console.error('Failed to save notifications:', e);
    }
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

  // Update all alert badges on the page
  function updateBadge() {
    const list = getNotifications();
    const unreadCount = list.filter(n => !n.read).length;
    const badges = document.querySelectorAll('#headerAlertBadge, .header-alert-badge');
    badges.forEach(b => {
      if (unreadCount > 0) {
        b.textContent = unreadCount > 9 ? '9+' : unreadCount;
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });
  }

  let activeTab = 'all';

  function renderNotificationItems() {
    const container = document.getElementById('notifItemsList');
    if (!container) return;

    const list = getNotifications();
    let filtered = list;
    if (activeTab === 'orders') {
      filtered = list.filter(n => n.type === 'order' || n.type === 'payment');
    } else if (activeTab === 'workshop') {
      filtered = list.filter(n => n.type === 'workshop');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-[36px] text-outline-variant mb-2 block">notifications_paused</span>
          <p class="text-xs font-semibold text-on-surface">No notifications in this tab</p>
          <p class="text-[11px] text-on-surface-variant mt-0.5">Workshop and order alerts will appear here</p>
        </div>
      `;
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
                <a href="${trackPath}?orderId=${encodeURIComponent(item.orderId)}" onclick="window.markEcoHavenNotificationRead('${item.id}')" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary-container transition-all shadow-xs">
                  <span class="material-symbols-outlined text-[14px]">local_shipping</span>
                  <span>Track Order #${item.orderId.replace('EH-2026-', '')}</span>
                </a>
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
              <p class="text-[11px] text-on-surface-variant">Live Candaba Workshop Notifications</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
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
        <div id="notifItemsList" class="p-3 sm:p-4 space-y-2.5 overflow-y-auto no-scrollbar flex-grow max-h-[58vh]">
          <!-- Injected via renderNotificationItems() -->
        </div>

        <!-- Footer -->
        <div class="p-3 bg-surface-container-lowest border-t border-outline-variant/30 text-center text-[11px] text-on-surface-variant flex items-center justify-between px-4">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Workshop MC: 11.4% Kiln Stabilized
          </span>
          <span class="font-medium text-outline">Mon–Sun 8AM–5PM</span>
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
    const list = getNotifications();
    const item = list.find(n => n.id === id);
    if (item && !item.read) {
      item.read = true;
      saveNotifications(list);
      renderNotificationItems();
    }
  };

  // Mark all as read
  window.markAllEcoHavenNotificationsRead = function() {
    const list = getNotifications();
    list.forEach(n => n.read = true);
    saveNotifications(list);
    renderNotificationItems();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('All notifications marked as read.', 'success');
    }
  };

  // Add a new notification (called when seller updates or checkout completes)
  window.addEcoHavenNotification = function(notif) {
    const list = getNotifications();
    const newEntry = {
      id: 'notif_' + Date.now(),
      type: notif.type || 'order',
      title: notif.title || 'Order Update',
      body: notif.body || '',
      orderId: notif.orderId || null,
      timestamp: Date.now(),
      read: false,
      icon: notif.icon || 'notifications',
      badgeColor: notif.badgeColor || 'bg-primary/10 text-primary'
    };

    list.unshift(newEntry);
    saveNotifications(list);

    // Sync with Firebase Realtime Database
    if (window.ecoHavenDb && notif.orderId) {
      try {
        window.ecoHavenDb.ref('ecohaven/notifications/' + newEntry.id).set(newEntry);
      } catch(e) {}
    }

    // Show toast announcement for incoming notification
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast(newEntry.title, 'info');
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
  } else {
    initNotifications();
  }
})();

