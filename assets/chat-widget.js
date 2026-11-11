// EcoHaven Furniture - Live Workshop Concierge ("Chat with Seller")
// Connects clients directly to Master Craftsman Danilo Santos at the Candaba, Pampanga Atelier
// Addresses Thesis Panel Suggestion #4: "Chat with Seller"

(function() {
  const CHAT_STORAGE_KEY_PREFIX = 'ecohaven_chat_history_';
  const CHAT_GREETED_KEY_PREFIX = 'ecohaven_chat_greeted_';
  let activeOrderContext = null;

  function getActiveUserObj() {
    try {
      if (window.ecohavenAuth && typeof window.ecohavenAuth.getCurrentUser === 'function') {
        const u = window.ecohavenAuth.getCurrentUser();
        if (u) return u;
      }
      const raw = localStorage.getItem('ecohaven_user') || localStorage.getItem('currentUser');
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  }

  function getCustomerRoomId() {
    try {
      const u = getActiveUserObj();
      if (u && u.email) {
        return 'room_' + u.email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
      }
    } catch(e) {}
    return 'room_live_client';
  }

  function getStorageKey() {
    return CHAT_STORAGE_KEY_PREFIX + getCustomerRoomId();
  }

  function getGreetedKey(roomId) {
    return CHAT_GREETED_KEY_PREFIX + (roomId || getCustomerRoomId());
  }

  function getWelcomeMessage() {
    return {
      id: 'msg_welcome',
      sender: 'artisan',
      name: 'Mang Danilo Santos',
      role: 'Master Craftsman • Candaba Workshop',
      avatar: 'carpenter',
      text: 'Mabuhay! I am Mang Danilo, lead woodturner at our Pasig, Candaba atelier. How can I help you today with our kiln-dried mahogany pieces, custom dimensions, or your delivery schedule?',
      timestamp: Date.now() - 5 * 60 * 1000
    };
  }

  function getChatHistory() {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return [getWelcomeMessage()];
  }

  function saveChatHistory(history) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(history));
      syncChatToFirebase(history);
    } catch(e) {}
  }

  function getCustomerInfo() {
    try {
      const u = getActiveUserObj();
      if (u && (u.name || u.displayName || u.fullName)) {
        return { name: u.name || u.displayName || u.fullName, email: u.email || 'customer@gmail.com' };
      }
    } catch(e) {}
    return { name: 'Storefront Customer (Live)', email: 'client@storefront.ph' };
  }

  function syncChatToFirebase(history) {
    if (!window.ecoHavenDb) return;
    try {
      const filtered = history.filter(m => m.id !== 'msg_welcome');
      if (filtered.length === 0) return; // Do not push empty room to Firebase!

      const roomId = getCustomerRoomId();
      const info = getCustomerInfo();
      const messages = filtered.map(m => ({
        id: m.id || ('m_' + Math.random()),
        sender: m.sender === 'user' ? 'customer' : 'seller',
        text: m.text,
        time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: m.timestamp || Date.now()
      }));

      const roomData = {
        id: roomId,
        customerName: info.name,
        customerEmail: info.email,
        orderId: activeOrderContext && activeOrderContext.orderId ? activeOrderContext.orderId : 'STORE-LIVE-2026',
        unread: true,
        lastUpdated: Date.now(),
        messages: messages
      };

      window.ecoHavenDb.ref('ecohaven/chats/' + roomId).set(roomData);
    } catch(e) {}
  }

  let currentListenedRoomId = null;

  function initCustomerChatFirebaseListener() {
    if (!window.ecoHavenDb) return;
    try {
      const roomId = getCustomerRoomId();
      if (currentListenedRoomId === roomId) return;
      if (currentListenedRoomId) {
        try { window.ecoHavenDb.ref('ecohaven/chats/' + currentListenedRoomId).off(); } catch(e) {}
      }
      currentListenedRoomId = roomId;

      window.ecoHavenDb.ref('ecohaven/chats/' + roomId).on('value', (snap) => {
        const cloudRoom = snap.val();
        if (cloudRoom && Array.isArray(cloudRoom.messages) && cloudRoom.messages.length > 0) {
          const localHistory = getChatHistory();
          const welcomeMsg = localHistory.find(m => m.id === 'msg_welcome') || getWelcomeMessage();
          const merged = [welcomeMsg];
          let hasSellerReply = false;
          cloudRoom.messages.forEach(cm => {
            if (cm.sender === 'seller') hasSellerReply = true;
            merged.push({
              id: cm.id,
              sender: cm.sender === 'customer' ? 'user' : 'artisan',
              name: cm.sender === 'seller' ? 'Mang Danilo Santos' : 'You',
              role: cm.sender === 'seller' ? 'Master Craftsman' : 'Client',
              avatar: cm.sender === 'seller' ? 'carpenter' : 'person',
              text: cm.text,
              timestamp: cm.timestamp || Date.now()
            });
          });
          if (hasSellerReply) {
            try { localStorage.setItem(getGreetedKey(roomId), 'true'); } catch(e) {}
          }
          localStorage.setItem(CHAT_STORAGE_KEY_PREFIX + roomId, JSON.stringify(merged));
          renderMessages();
        } else if (cloudRoom === null) {
          // Only reset if local history doesn't have an unsynced message currently being sent
          const localHistory = getChatHistory();
          if (localHistory.length <= 1) {
            try { localStorage.removeItem(getGreetedKey(roomId)); } catch(e) {}
            localStorage.setItem(CHAT_STORAGE_KEY_PREFIX + roomId, JSON.stringify([getWelcomeMessage()]));
            renderMessages();
          }
        }
      });
    } catch(e) {}
  }

  window.addEventListener('ecohaven_auth_state_changed', () => {
    initCustomerChatFirebaseListener();
    renderMessages();
  });

  window.addEventListener('ecohaven_user_logged_in', () => {
    initCustomerChatFirebaseListener();
    renderMessages();
  });

  function injectChatWidget() {
    if (document.getElementById('ecohavenChatWidgetContainer')) return;

    const html = `
      <!-- FLOATING ACTION LAUNCHER BUTTON -->
      <div id="ecohavenChatWidgetContainer" class="fixed bottom-5 left-5 z-40 flex flex-col items-start select-none">
        <button type="button" id="ecohavenChatLauncher" onclick="window.openEcoHavenChat()" 
          class="group flex items-center gap-2.5 px-4 py-3 bg-primary hover:bg-primary-container text-on-primary rounded-full shadow-2xl border border-primary-fixed/30 hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Chat with Workshop Master">
          <div class="relative flex items-center justify-center">
            <span class="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">support_agent</span>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-primary animate-pulse"></span>
          </div>
          <div class="flex flex-col text-left leading-tight pr-1">
            <span class="text-xs font-bold font-headline tracking-wide flex items-center gap-1.5">
              <span>Chat with Seller</span>
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 uppercase">Live</span>
            </span>
            <span class="text-[10px] text-primary-fixed-dim/90 hidden sm:inline">Candaba Workshop Concierge</span>
          </div>
        </button>
      </div>

      <!-- CHAT MODAL / DRAWER -->
      <div id="ecohavenChatBackdrop" class="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-50 hidden transition-opacity duration-300 opacity-0" onclick="window.closeEcoHavenChat()"></div>
      <div id="ecohavenChatModal" class="fixed bottom-0 sm:bottom-5 left-0 sm:left-5 z-50 w-full sm:w-[420px] max-h-[92vh] sm:max-h-[620px] h-[580px] bg-surface rounded-t-3xl sm:rounded-3xl border border-outline-variant/40 shadow-2xl flex flex-col overflow-hidden hidden transition-all duration-300 transform translate-y-6 opacity-0">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-11 h-11 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold shadow-xs">
                <span class="material-symbols-outlined text-[24px]">carpenter</span>
              </div>
              <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-surface animate-pulse" title="Online in Atelier"></span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-headline text-base font-bold text-on-surface leading-snug">Mang Danilo Santos</h3>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">MASTER CRAFTSMAN</span>
              </div>
              <p class="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Active in Candaba Atelier • Replies in &lt; 2 mins</span>
              </p>
            </div>
          </div>
          <button type="button" onclick="window.closeEcoHavenChat()" class="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all" aria-label="Close Chat">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Optional Order / Product Context Pill Banner -->
        <div id="chatContextBanner" class="hidden px-4 py-2 bg-primary/10 border-b border-primary/20 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2 truncate">
            <span class="material-symbols-outlined text-primary text-[17px]">inventory_2</span>
            <span id="chatContextText" class="font-semibold text-primary truncate">Inquiring regarding Order #EH-2026-46346</span>
          </div>
          <button type="button" onclick="window.clearChatContext()" class="text-[11px] text-outline hover:text-on-surface ml-2">Clear</button>
        </div>

        <!-- Quick Inquiry Suggestions -->
        <div class="px-3 py-2 bg-surface-container-lowest border-b border-outline-variant/20 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs">
          <button type="button" onclick="window.sendQuickPrompt('track')" class="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1">
            <span>🚚</span><span>Track Order Delivery</span>
          </button>
          <button type="button" onclick="window.sendQuickPrompt('cod')" class="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1">
            <span>💵</span><span>COD Inspection Rules</span>
          </button>
          <button type="button" onclick="window.sendQuickPrompt('wood')" class="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1">
            <span>🪵</span><span>Mahogany &amp; Finish</span>
          </button>
          <button type="button" onclick="window.sendQuickPrompt('warranty')" class="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1">
            <span>🛡️</span><span>5-Year Warranty</span>
          </button>
        </div>

        <!-- Messages Body -->
        <div id="chatMessagesContainer" class="flex-grow p-4 overflow-y-auto space-y-3.5 bg-surface text-xs leading-relaxed">
          <!-- Dynamically populated -->
        </div>

        <!-- Typing Indicator -->
        <div id="chatTypingIndicator" class="hidden px-4 py-1.5 bg-surface text-[11px] text-on-surface-variant flex items-center gap-2">
          <span class="inline-flex gap-1 items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
          </span>
          <span>Mang Danilo is typing from Candaba workshop...</span>
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="window.handleChatSubmit(event)" class="p-3 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center gap-2">
          <input type="text" id="chatInputMessage" placeholder="Ask Mang Danilo about timber, delivery, or custom specs..." 
            class="flex-grow px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"/>
          <button type="submit" class="w-10 h-10 rounded-xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-all shadow-xs flex-shrink-0" aria-label="Send Message">
            <span class="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>

        <!-- Footer Seal -->
        <div class="px-4 py-1 bg-surface-container-low text-[10px] text-on-surface-variant flex items-center justify-between font-mono">
          <span>🪵 Candaba Atelier DTI Reg. #4918230</span>
          <span class="text-emerald-700 font-bold">11.4% MC Kiln Verified</span>
        </div>

      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    initCustomerChatFirebaseListener();
  }

  function renderMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    const history = getChatHistory();

    container.innerHTML = history.map(msg => {
      const isArtisan = msg.sender === 'artisan';
      const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isArtisan) {
        return `
          <div class="flex items-start gap-2.5 max-w-[90%]">
            <div class="w-7 h-7 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
              <span class="material-symbols-outlined text-[16px]">${msg.avatar || 'carpenter'}</span>
            </div>
            <div class="space-y-1">
              <div class="p-3 rounded-2xl rounded-tl-none bg-surface-container-low border border-outline-variant/30 text-on-surface shadow-xs leading-relaxed">
                <span class="text-[10px] font-bold text-primary block mb-0.5">${msg.name}</span>
                <p class="whitespace-pre-line">${msg.text}</p>
              </div>
              <span class="text-[9px] text-outline ml-1">${timeStr}</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex items-start justify-end gap-2.5 max-w-[90%] ml-auto">
            <div class="space-y-1 text-right">
              <div class="p-3 rounded-2xl rounded-tr-none bg-primary text-on-primary shadow-xs leading-relaxed text-left">
                <p class="whitespace-pre-line">${msg.text}</p>
              </div>
              <span class="text-[9px] text-outline mr-1">${timeStr}</span>
            </div>
            <div class="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
              <span class="material-symbols-outlined text-[16px]">person</span>
            </div>
          </div>
        `;
      }
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  window.openEcoHavenChat = function(context) {
    injectChatWidget();
    if (context) {
      activeOrderContext = context;
      const banner = document.getElementById('chatContextBanner');
      const bannerText = document.getElementById('chatContextText');
      if (banner && bannerText) {
        if (context.orderId) {
          bannerText.innerText = `Inquiring regarding Order #${context.orderId} (${context.courierName || 'Candaba Workshop Fleet'})`;
          banner.classList.remove('hidden');
        } else if (context.productName) {
          bannerText.innerText = `Inquiring about ${context.productName}`;
          banner.classList.remove('hidden');
        }
      }
    }
    renderMessages();

    const backdrop = document.getElementById('ecohavenChatBackdrop');
    const modal = document.getElementById('ecohavenChatModal');
    if (!backdrop || !modal) return;

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      modal.classList.remove('translate-y-6', 'opacity-0');
      modal.classList.add('translate-y-0', 'opacity-100');
    });

    const input = document.getElementById('chatInputMessage');
    if (input) setTimeout(() => input.focus(), 300);
  };

  window.closeEcoHavenChat = function() {
    const backdrop = document.getElementById('ecohavenChatBackdrop');
    const modal = document.getElementById('ecohavenChatModal');
    if (!backdrop || !modal) return;

    backdrop.classList.add('opacity-0');
    modal.classList.remove('translate-y-0', 'opacity-100');
    modal.classList.add('translate-y-6', 'opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      modal.classList.add('hidden');
    }, 280);
  };

  window.clearChatContext = function() {
    activeOrderContext = null;
    const banner = document.getElementById('chatContextBanner');
    if (banner) banner.classList.add('hidden');
  };

  window.handleChatSubmit = function(e, isQuickPrompt) {
    if (e) e.preventDefault();
    const input = document.getElementById('chatInputMessage');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const roomId = getCustomerRoomId();
    const history = getChatHistory();

    // Check if this person/room has already received the 1-time initial greeting or any seller reply
    const nonWelcomeMsgs = history.filter(m => m.id !== 'msg_welcome');
    const hasExistingSellerReply = nonWelcomeMsgs.some(m => m.sender === 'artisan' || m.sender === 'seller');
    const alreadyGreeted = hasExistingSellerReply || (localStorage.getItem(getGreetedKey(roomId)) === 'true');

    history.push({
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: Date.now()
    });
    saveChatHistory(history);
    renderMessages();

    // Only send the automated greeting ONCE per person/room (or if they explicitly clicked a Quick Inquiry button).
    // Subsequent typed messages go directly to the live conversation with the Seller without bot interruptions!
    if (alreadyGreeted && !isQuickPrompt) {
      return;
    }

    try {
      localStorage.setItem(getGreetedKey(roomId), 'true');
    } catch(err) {}

    // Trigger typing indicator and 1-time initial greeting (or quick inquiry response)
    const typing = document.getElementById('chatTypingIndicator');
    if (typing) typing.classList.remove('hidden');

    const lower = text.toLowerCase();
    setTimeout(() => {
      if (typing) typing.classList.add('hidden');
      let replyText = '';

      if (lower.includes('order') || lower.includes('track') || lower.includes('delivery') || lower.includes('arrive') || lower.includes('when')) {
        if (activeOrderContext && activeOrderContext.orderId) {
          replyText = `Mabuhay! Regarding your Order #${activeOrderContext.orderId}: our logistics team dispatched it via ${activeOrderContext.courierName || 'Workshop Fleet'} (Waybill: ${activeOrderContext.courierTracking || 'EH-FLEET-CBD4821'}). Handcrafted timber transit across Central Luzon and NCR typically arrives safely within 24 to 48 hours with doorstep unboxing.`;
        } else {
          replyText = `Our Candaba logistics fleet dispatches units daily. You can enter your Order ID or registered mobile on our Production Tracker page (/pages/track.html) to see live kiln telemetry, cutting, and driver GPS coordinates!`;
        }
      } else if (lower.includes('cod') || lower.includes('cash on delivery') || lower.includes('pay') || lower.includes('payment')) {
        replyText = `Opo! EcoHaven honors Cash on Delivery (COD). When our courier arrives at your doorstep, you are invited to inspect all wood surfaces, 320-grit hand finish, and mortise joinery before settling your remaining balance in cash. Zero pressure!`;
      } else if (lower.includes('finish') || lower.includes('wood') || lower.includes('mahogany') || lower.includes('wax') || lower.includes('teak')) {
        replyText = `We only mill sustainably harvested Philippine Mahogany, stabilized down to 11.4% moisture content inside our Candaba solar kilns. We seal every surface with Solignum anti-termite treatment and buff it with botanical carnauba beeswax for a silky, non-toxic touch.`;
      } else if (lower.includes('warranty') || lower.includes('guarantee') || lower.includes('damage') || lower.includes('termite')) {
        replyText = `Every EcoHaven furniture suite comes with an official serialized 5-Year Structural Frame Warranty. This guarantees against structural joint loosening, wood warping, and termite damage. It automatically activates upon confirming receipt on your dashboard or tracker!`;
      } else {
        replyText = `Salamat for messaging the Candaba atelier! Mang Danilo and our 14 master carvers are on duty. We take utmost pride in crafting space-saving heirloom pieces that last generations. Is there anything specific about joinery or dimensions you would like to customize?`;
      }

      const updatedHistory = getChatHistory();
      updatedHistory.push({
        id: 'msg_reply_' + Date.now(),
        sender: 'artisan',
        name: 'Mang Danilo Santos',
        role: 'Master Craftsman',
        avatar: 'carpenter',
        text: replyText,
        timestamp: Date.now()
      });
      saveChatHistory(updatedHistory);
      renderMessages();
    }, 1100);
  };

  window.sendQuickPrompt = function(type) {
    let msg = '';
    if (type === 'track') {
      msg = activeOrderContext && activeOrderContext.orderId ? 
        `Can you update me on the delivery schedule for Order #${activeOrderContext.orderId}?` : 
        'Hi Mang Danilo, how does order tracking and courier dispatch work?';
    } else if (type === 'cod') {
      msg = 'How does Cash on Delivery (COD) inspection work upon courier arrival?';
    } else if (type === 'wood') {
      msg = 'Can you tell me about the kiln-dried mahogany and 320-grit wax finish?';
    } else if (type === 'warranty') {
      msg = 'What is covered under the EcoHaven 5-Year Structural Frame Warranty?';
    }

    const input = document.getElementById('chatInputMessage');
    if (input) {
      input.value = msg;
      window.handleChatSubmit(null, true);
    }
  };

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatWidget);
  } else {
    injectChatWidget();
  }
})();

