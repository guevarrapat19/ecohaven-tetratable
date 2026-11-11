// EcoHaven Furniture - Craftsman & Seller Comms Hub
// Implements Live Chat Management & Email Inbox for Seller Dashboard
// Addresses Thesis Panel Suggestions:
// #4: "Chat with Seller" (Two-way craftsman-customer management)
// #7: "Yung nag-eemail kapag order received na" (Email Inbox & Notifications)
// Matches user reference designs: media_1794227306231_784d36fb.jpg & media_1794227329507_e1842a9d.jpg

(function() {
  const SELLER_CHAT_STORAGE_KEY = 'ecohaven_seller_chat_rooms';
  const SELLER_EMAIL_STORAGE_KEY = 'ecohaven_seller_emails';
  const CUSTOMER_CHAT_STORAGE_KEY = 'ecohaven_chat_history';

  // No hardcoded mock chat rooms — Firebase RTDB is Single Source of Truth
  function getInitialChatRooms() {
    return [];
  }

  // No hardcoded mock emails — Firebase RTDB is Single Source of Truth
  function getInitialEmails() {
    return [];
  }

  function getChatRooms() {
    try {
      const stored = localStorage.getItem(SELLER_CHAT_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    // Firebase RTDB is Single Source of Truth (SSOT). Never auto-write mock rooms to cloud!
    return [];
  }

  function saveChatRooms(rooms) {
    try {
      localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(rooms));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_chats_updated', { detail: rooms }));
      if (window.ecoHavenDb) {
        if (!rooms || rooms.length === 0) {
          // All rooms cleared — wipe Firebase node so deleted rooms do not return
          window.ecoHavenDb.ref('ecohaven/chats').set(null);
        } else {
          const map = {};
          rooms.forEach(r => { if (r && r.id) map[r.id] = r; });
          window.ecoHavenDb.ref('ecohaven/chats').set(map);
        }
      }
    } catch(e) {}
  }

  function getEmails() {
    try {
      const stored = localStorage.getItem(SELLER_EMAIL_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    // Firebase RTDB is Single Source of Truth (SSOT). Never auto-write mock emails to cloud!
    return [];
  }

  function saveEmails(emails) {
    try {
      localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify(emails));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_emails_updated', { detail: emails }));
      if (window.ecoHavenDb) {
        if (!emails || emails.length === 0) {
          // All emails cleared — wipe Firebase node
          window.ecoHavenDb.ref('ecohaven/emails').set(null);
        } else {
          const map = {};
          emails.forEach(e => { if (e && e.id) map[e.id] = e; });
          // Use .set() instead of .update() so removed keys are deleted from Firebase
          window.ecoHavenDb.ref('ecohaven/emails').set(map);
        }
      }
    } catch(e) {}
  }

  // Active state inside seller modal
  let activeTab = 'chat'; // 'chat' | 'email'
  let activeRoomId = null;
  let activeEmailId = null;
  let emailSearchQuery = '';
  let emailUnreadOnly = false;

  // Sync with customer-facing chat widget if the customer chatted (Offline Fallback Only)
  function syncWithCustomerWidget() {
    // If Firebase is active, Firebase RTDB is Single Source of Truth — never resurrect deleted local history!
    if (window.ecoHavenDb) return;
    try {
      const custRaw = localStorage.getItem(CUSTOMER_CHAT_STORAGE_KEY);
      if (!custRaw) return;
      const custHistory = JSON.parse(custRaw);
      if (!Array.isArray(custHistory) || custHistory.length <= 1) return;

      const rooms = getChatRooms();
      let liveRoom = rooms.find(r => r.id === 'room_live_client');
      const currentUser = (window.ecohavenAuth && typeof window.ecohavenAuth.getCurrentUser === 'function')
        ? window.ecohavenAuth.getCurrentUser()
        : null;

      const clientName = (currentUser && currentUser.name) ? currentUser.name : 'Storefront Customer (Live)';
      const clientEmail = (currentUser && currentUser.email) ? currentUser.email : 'client@storefront.ph';

      const convertedMsgs = custHistory.filter(m => m.id !== 'msg_welcome').map(m => ({
        id: m.id || ('m_' + Math.random()),
        sender: m.sender === 'client' ? 'customer' : 'seller',
        text: m.text,
        time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: m.timestamp || Date.now()
      }));

      if (convertedMsgs.length > 0) {
        if (!liveRoom) {
          liveRoom = {
            id: 'room_live_client',
            customerName: clientName,
            customerEmail: clientEmail,
            orderId: 'STORE-LIVE-2026',
            unread: true,
            lastUpdated: Date.now(),
            messages: convertedMsgs
          };
          rooms.unshift(liveRoom);
        } else {
          liveRoom.customerName = clientName;
          liveRoom.customerEmail = clientEmail;
          liveRoom.messages = convertedMsgs;
          liveRoom.lastUpdated = Date.now();
        }
        try {
      localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(rooms));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_chats_updated', { detail: rooms }));
      if (window.ecoHavenDb) {
        window.ecoHavenDb.ref('ecohaven/chats/' + room.id).set(room);
      }
    } catch(e) {}
      }
    } catch(e) {}
  }

  // Sync with simulated comms outbox whenever emails are sent (Offline Fallback Only)
  function syncWithSimulatedComms() {
    // If Firebase is active, Firebase RTDB is Single Source of Truth — never resurrect deleted local history!
    if (window.ecoHavenDb) return;
    try {
      const stored = localStorage.getItem('ecohaven_simulated_comms');
      if (!stored) return;
      const comms = JSON.parse(stored);
      if (!Array.isArray(comms)) return;

      const emails = getEmails();
      let changed = false;

      comms.filter(c => c.type === 'email').forEach(c => {
        if (!emails.some(e => e.id === c.id)) {
          emails.unshift({
            id: c.id,
            subject: c.subject,
            fromName: 'EcoHaven System Dispatch',
            fromEmail: 'automations@ecohaven.ph',
            toEmail: c.to,
            orderId: c.orderId || 'WF-2026-ONLINE',
            dateStr: new Date(c.timestamp).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            timestamp: c.timestamp,
            unread: false,
            body: c.body || c.message || ''
          });
          changed = true;
        }
      });

      if (changed) {
        const newEmail = emails[0];
    try {
      localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify(emails));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_emails_updated', { detail: emails }));
      if (window.ecoHavenDb) {
        window.ecoHavenDb.ref('ecohaven/emails/' + newEmail.id).set(newEmail);
      }
    } catch(e) {}
      }
    } catch(e) {}
  }

  // Inject the Seller Comms Modal into DOM
  function injectSellerCommsModal() {
    if (document.getElementById('sellerCommsModalBackdrop')) return;

    const modalHTML = `
      <!-- BACKDROP -->
      <div id="sellerCommsModalBackdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] hidden transition-opacity duration-300 opacity-0" onclick="window.closeSellerCommsModal()"></div>

      <!-- MAIN MODAL / POPUP -->
      <div id="sellerCommsModal" class="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 pointer-events-none hidden">
        <div class="relative w-full max-w-5xl bg-[#FFF8F5] text-[#26190F] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#d9c2b5]/50 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[92vh] h-[640px] flex flex-col overflow-hidden" id="sellerCommsModalCard">
          
          <!-- TOP TITLE & TAB BAR (matching media_1794227329507_e1842a9d.jpg) -->
          <div class="bg-[#3d2d23] text-[#ffede4] px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <span class="material-symbols-outlined text-[19px]">forum</span>
              </div>
              <div class="flex items-center gap-2">
                <h3 class="font-headline text-sm sm:text-base font-bold text-white tracking-wide" id="sellerModalTitle">Live Chat Management</h3>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider hidden sm:inline">Craftsman Active</span>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3">
              <!-- Switcher Tabs -->
              <div class="flex items-center bg-black/25 p-1 rounded-xl border border-white/10">
                <button type="button" id="tabBtnLiveChat" onclick="window.switchSellerCommsTab('chat')" 
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-[#86450D] text-white shadow-xs' : 'text-white/70 hover:text-white'}">
                  <span class="material-symbols-outlined text-[16px]">chat</span>
                  <span>Live Chat</span>
                  <span id="unreadChatCountBadge" class="hidden px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-black font-extrabold">1</span>
                </button>

                <button type="button" id="tabBtnEmailInbox" onclick="window.switchSellerCommsTab('email')" 
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'email' ? 'bg-[#86450D] text-white shadow-xs' : 'text-white/70 hover:text-white'}">
                  <span class="material-symbols-outlined text-[16px]">mail</span>
                  <span>Email Inbox</span>
                  <span id="unreadEmailCountBadge" class="hidden px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-extrabold">1</span>
                </button>
              </div>

              <button type="button" onclick="window.closeSellerCommsModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all ml-1" aria-label="Close">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <!-- TAB CONTENT: LIVE CHAT MANAGEMENT (media_1794227329507_e1842a9d.jpg) -->
          <div id="sellerTabContentChat" class="flex-grow grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#FFF8F5]">
            
            <!-- Left Pane: Customer Chat Rooms List -->
            <div class="md:col-span-4 lg:col-span-4 border-r border-[#d9c2b5]/30 flex flex-col bg-[#FFF8F5] overflow-hidden">
              <div class="p-3.5 border-b border-[#d9c2b5]/20 flex items-center justify-between bg-[#FFF1EA]/60">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#86450D] text-[18px]">forum</span>
                  <span class="text-xs font-bold uppercase tracking-wider text-[#86450D]">Customer Inquiries</span>
                </div>
                <button type="button" onclick="window.resetSellerChatRooms()" class="text-[11px] font-semibold text-[#86450D] hover:underline" title="Restore sample chats">Reset</button>
              </div>

              <!-- Rooms Scrollable List -->
              <div id="sellerChatRoomsList" class="flex-grow overflow-y-auto divide-y divide-[#d9c2b5]/20">
                <!-- Dynamically populated -->
              </div>
            </div>

            <!-- Right Pane: Active Chat Conversation -->
            <div class="md:col-span-8 lg:col-span-8 flex flex-col bg-[#FFFFFF] overflow-hidden" id="sellerActiveChatPane">
              <!-- Dynamically populated -->
            </div>

          </div>

          <!-- TAB CONTENT: EMAIL INBOX (media_1794227306231_784d36fb.jpg) -->
          <div id="sellerTabContentEmail" class="hidden flex-grow flex-col overflow-hidden bg-[#FFF8F5]">
            
            <div class="grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-grow">
              
              <!-- Left Pane: Email List & Search -->
              <div class="md:col-span-4 lg:col-span-4 border-r border-[#d9c2b5]/30 flex flex-col bg-[#FFF8F5] overflow-hidden">
                <!-- Search & Filter Controls -->
                <div class="p-3.5 border-b border-[#d9c2b5]/30 space-y-2.5 bg-[#FFF1EA]/70">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#86450D] flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">inbox</span>
                      <span>Customer Emails</span>
                    </span>
                    <button type="button" onclick="window.composeSimulatedEmail()" class="px-2.5 py-1 rounded-lg bg-[#86450D] hover:bg-[#a45d25] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all">
                      <span class="material-symbols-outlined text-[13px]">edit</span>
                      <span>Compose</span>
                    </button>
                  </div>
                  
                  <!-- Search input -->
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-2.5 top-2 text-[#867368] text-[16px]">search</span>
                    <input type="text" id="sellerEmailSearchInput" placeholder="Search emails..." 
                      oninput="window.handleEmailSearch(this.value)"
                      class="w-full pl-8 pr-3 py-1.5 bg-white border border-[#d9c2b5] rounded-xl text-xs text-[#26190F] focus:outline-none focus:ring-1 focus:ring-[#86450D]" />
                  </div>

                  <!-- Unread toggle -->
                  <label class="flex items-center gap-2 text-[11px] text-[#53443a] cursor-pointer select-none">
                    <input type="checkbox" id="sellerEmailUnreadOnly" onchange="window.handleEmailUnreadToggle(this.checked)" class="accent-[#86450D] rounded h-3.5 w-3.5" />
                    <span>Show unread only</span>
                  </label>
                </div>

                <!-- Emails scrollable list -->
                <div id="sellerEmailsList" class="flex-grow overflow-y-auto divide-y divide-[#d9c2b5]/20">
                  <!-- Dynamically populated -->
                </div>
              </div>

              <!-- Right Pane: Email Detail View -->
              <div class="md:col-span-8 lg:col-span-8 flex flex-col bg-[#FFFFFF] overflow-hidden" id="sellerActiveEmailPane">
                <!-- Dynamically populated -->
              </div>

            </div>

          </div>

        </div>
      </div>

      <!-- FLOATING SELLER CHAT LAUNCHER BUTTON (matches bottom right brown circular button in screenshot) -->
      <button type="button" id="sellerFloatingCommsBtn" onclick="window.openSellerCommsModal('chat')"
        class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#86450D] hover:bg-[#a45d25] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group border-2 border-white"
        aria-label="Open Craftsman Live Chat Management" title="Live Chat & Customer Emails">
        <span class="material-symbols-outlined text-[26px] group-hover:rotate-12 transition-transform">chat</span>
        <span id="sellerFloatingUnreadDot" class="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Render Rooms List
  function renderChatRoomsList() {
    const container = document.getElementById('sellerChatRoomsList');
    if (!container) return;

    const rooms = getChatRooms();
    if (rooms.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-xs text-[#867368]">No chat rooms active.</div>`;
      return;
    }

    let unreadCount = 0;
    container.innerHTML = rooms.map(room => {
      const isSelected = room.id === activeRoomId;
      if (room.unread) unreadCount++;
      const lastMsg = room.messages && room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;
      const snippet = lastMsg ? (lastMsg.sender === 'seller' ? 'You: ' : '') + lastMsg.text : 'No messages';

      return `
        <div onclick="window.selectSellerChatRoom('${room.id}')" 
          class="p-3.5 cursor-pointer transition-all flex items-start justify-between gap-2.5 ${isSelected ? 'bg-[#FFEADE] border-l-4 border-[#86450D]' : 'hover:bg-[#FFF1EA]/70'}">
          <div class="flex items-start gap-2.5 min-w-0 flex-grow">
            <div class="w-8 h-8 rounded-full bg-[#ffca98] text-[#86450D] font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              ${room.customerName.charAt(0)}
            </div>
            <div class="min-w-0 flex-grow">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#26190F] truncate">${room.customerName}</span>
                ${room.unread ? `<span class="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0"></span>` : ''}
              </div>
              <p class="text-[11px] text-[#53443a] truncate leading-snug mt-0.5">${snippet}</p>
            </div>
          </div>
          <button type="button" onclick="event.stopPropagation(); window.deleteSellerChatRoom('${room.id}')" 
            class="text-[#867368] hover:text-red-600 p-1 rounded-lg hover:bg-[#FFF1EA] transition-colors" title="Delete room">
            <span class="material-symbols-outlined text-[15px]">delete</span>
          </button>
        </div>
      `;
    }).join('');

    const badge = document.getElementById('unreadChatCountBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  // Render Active Conversation (matching right pane of media_1794227329507_e1842a9d.jpg)
  function renderActiveChatPane() {
    const pane = document.getElementById('sellerActiveChatPane');
    if (!pane) return;

    const rooms = getChatRooms();
    const room = rooms.find(r => r.id === activeRoomId) || rooms[0];

    if (!room) {
      pane.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-8 text-center text-[#867368]">
          <span class="material-symbols-outlined text-4xl mb-2 text-[#d9c2b5]">chat_bubble_outline</span>
          <p class="text-xs">Select a customer conversation from the list to view and reply.</p>
        </div>
      `;
      return;
    }

    activeRoomId = room.id;
    if (room.unread) {
      room.unread = false;
      try {
        localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(rooms));
        if (window.ecoHavenDb) {
          window.ecoHavenDb.ref('ecohaven/chats/' + room.id + '/unread').set(false);
        }
      } catch(e) {}
    }

    pane.innerHTML = `
      <!-- Room Header -->
      <div class="p-3.5 border-b border-[#d9c2b5]/30 bg-[#FFF1EA]/50 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-[#ffca98] text-[#86450D] font-bold flex items-center justify-center text-sm shadow-xs">
            ${room.customerName.charAt(0)}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-xs sm:text-sm font-bold text-[#26190F]">${room.customerName}</h4>
              ${room.orderId ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ffeade] text-[#86450D] border border-[#d9c2b5]/40">#${room.orderId}</span>` : ''}
            </div>
            <p class="text-[11px] text-[#53443a]">${room.customerEmail}</p>
          </div>
        </div>
        <button type="button" onclick="window.deleteSellerChatRoom('${room.id}')" 
          class="px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold flex items-center gap-1 transition-all" title="Delete conversation room">
          <span class="material-symbols-outlined text-[14px]">delete</span>
          <span class="hidden sm:inline">Delete Room</span>
        </button>
      </div>

      <!-- Messages Thread (Scrollable) -->
      <div id="sellerMessagesContainer" class="flex-grow p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#FAF7F4]">
        ${(room.messages || []).map(msg => {
          const isSeller = msg.sender === 'seller';
          return `
            <div class="flex flex-col ${isSeller ? 'items-end' : 'items-start'}">
              <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                isSeller 
                  ? 'bg-[#86450D] text-white rounded-br-xs' 
                  : 'bg-white text-[#26190F] border border-[#d9c2b5]/40 rounded-bl-xs'
              }">
                <p>${msg.text}</p>
              </div>
              <span class="text-[10px] text-[#867368] font-mono mt-1 px-1">${msg.time || 'Just now'}</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Reply Input Form -->
      <div class="p-3 border-t border-[#d9c2b5]/30 bg-white flex-shrink-0">
        <form onsubmit="window.handleSellerChatReply(event)" class="flex items-center gap-2">
          <input type="text" id="sellerReplyInput" placeholder="Reply to ${room.customerName}..." 
            autocomplete="off" required
            class="flex-grow px-4 py-2.5 bg-[#FFF8F5] border border-[#d9c2b5] rounded-xl text-xs text-[#26190F] focus:outline-none focus:ring-2 focus:ring-[#86450D]" />
          <button type="submit" 
            class="w-10 h-10 rounded-xl bg-[#86450D] hover:bg-[#a45d25] text-white flex items-center justify-center transition-all shadow-xs flex-shrink-0 active:scale-95" 
            title="Send reply">
            <span class="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    `;

    // Scroll to bottom
    const msgContainer = document.getElementById('sellerMessagesContainer');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // Render Emails List (media_1794227306231_784d36fb.jpg)
  function renderEmailsList() {
    const container = document.getElementById('sellerEmailsList');
    if (!container) return;

    let emails = getEmails();

    if (emailSearchQuery) {
      const q = emailSearchQuery.toLowerCase();
      emails = emails.filter(e => 
        (e.subject && e.subject.toLowerCase().includes(q)) || 
        (e.fromName && e.fromName.toLowerCase().includes(q)) || 
        (e.fromEmail && e.fromEmail.toLowerCase().includes(q)) ||
        (e.body && e.body.toLowerCase().includes(q)) ||
        (e.orderId && e.orderId.toLowerCase().includes(q))
      );
    }

    if (emailUnreadOnly) {
      emails = emails.filter(e => e.unread);
    }

    let unreadCount = 0;
    getEmails().forEach(e => { if (e.unread) unreadCount++; });

    const badge = document.getElementById('unreadEmailCountBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    if (emails.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-xs text-[#867368]">No emails found.</div>`;
      return;
    }

    container.innerHTML = emails.map(email => {
      const isSelected = email.id === activeEmailId;
      return `
        <div onclick="window.selectSellerEmail('${email.id}')" 
          class="p-3.5 cursor-pointer transition-all flex flex-col gap-1.5 ${isSelected ? 'bg-[#FFEADE] border-l-4 border-[#86450D]' : 'hover:bg-[#FFF1EA]/70'}">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#26190F] truncate flex items-center gap-1.5">
              ${email.unread ? `<span class="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>` : ''}
              <span>${email.fromName}</span>
            </span>
            <span class="text-[10px] text-[#867368] font-mono flex-shrink-0">${email.dateStr ? email.dateStr.split('•')[0].trim() : 'Recent'}</span>
          </div>
          <p class="text-xs font-semibold text-[#86450D] truncate leading-tight">${email.subject}</p>
          <p class="text-[11px] text-[#53443a] line-clamp-1 leading-snug">${(email.body || '').replace(/\\n/g, ' ')}</p>
          <div class="flex items-center justify-between pt-1">
            ${email.orderId ? `<span class="font-mono text-[10px] font-bold text-[#86450D] bg-white px-2 py-0.5 rounded border border-[#d9c2b5]/30">#${email.orderId}</span>` : '<span></span>'}
            <button type="button" onclick="event.stopPropagation(); window.deleteSellerEmail('${email.id}')" 
              class="text-[#867368] hover:text-red-600 p-0.5 rounded transition-colors" title="Delete email">
              <span class="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Active Email Detail Pane (media_1794227306231_784d36fb.jpg)
  function renderActiveEmailPane() {
    const pane = document.getElementById('sellerActiveEmailPane');
    if (!pane) return;

    const emails = getEmails();
    const email = emails.find(e => e.id === activeEmailId) || emails[0];

    if (!email) {
      pane.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-8 text-center text-[#867368]">
          <span class="material-symbols-outlined text-4xl mb-2 text-[#d9c2b5]">mail_outline</span>
          <p class="text-xs">Select an email from the inbox list to read full message details.</p>
        </div>
      `;
      return;
    }

    activeEmailId = email.id;
    if (email.unread) {
      email.unread = false;
      try {
        localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify(emails));
        if (window.ecoHavenDb) {
          window.ecoHavenDb.ref('ecohaven/emails/' + email.id + '/unread').set(false);
        }
      } catch(e) {}
      renderEmailsList();
    }

    pane.innerHTML = `
      <!-- Email Header Details -->
      <div class="p-4 sm:p-5 border-b border-[#d9c2b5]/30 bg-[#FFF1EA]/40 space-y-2.5 flex-shrink-0">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm sm:text-base font-bold text-[#26190F] font-headline leading-tight">${email.subject}</h3>
          <span class="text-[11px] text-[#867368] font-mono">${email.dateStr || 'Recent'}</span>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="space-y-0.5">
            <p><span class="text-[#867368]">From:</span> <strong class="text-[#26190F]">${email.fromName}</strong> &lt;${email.fromEmail}&gt;</p>
            <p><span class="text-[#867368]">To:</span> <span class="text-[#53443a]">${email.toEmail || 'danilo@ecohaven.ph'}</span></p>
          </div>
          ${email.orderId ? `<span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#ffeade] text-[#86450D] border border-[#d9c2b5]">Order #${email.orderId}</span>` : ''}
        </div>
      </div>

      <!-- Email Body (Scrollable) -->
      <div class="flex-grow p-4 sm:p-6 overflow-y-auto text-xs sm:text-[13px] text-[#26190F] leading-relaxed whitespace-pre-line bg-white">
${email.body || ''}
      </div>

      <!-- Email Action Buttons (media_1794227306231_784d36fb.jpg) -->
      <div class="p-3.5 border-t border-[#d9c2b5]/30 bg-[#FFF8F5] flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div class="flex items-center gap-2">
          <button type="button" onclick="window.replyToEmailCustomer('${email.fromName}', '${email.fromEmail}')" 
            class="px-4 py-2 rounded-xl bg-[#86450D] hover:bg-[#a45d25] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95">
            <span class="material-symbols-outlined text-[16px]">reply</span>
            <span>Reply via Chat</span>
          </button>
          <button type="button" onclick="window.showEcoHavenToast('Email marked as handled.', 'info')" 
            class="px-3.5 py-2 rounded-xl border border-[#d9c2b5] bg-white text-[#53443a] hover:bg-[#ffeade] text-xs font-semibold transition-all">
            <span>Back to Inbox</span>
          </button>
        </div>
        <button type="button" onclick="window.deleteSellerEmail('${email.id}')" 
          class="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold flex items-center gap-1 transition-all">
          <span class="material-symbols-outlined text-[15px]">delete</span>
          <span>Delete Email</span>
        </button>
      </div>
    `;
  }

  // ==============================================================================
  // PUBLIC CONTROLLER METHODS
  // ==============================================================================

  window.openSellerCommsModal = function(tab) {
    injectSellerCommsModal();

    // Respect Firebase as Single Source of Truth: only use local sync if offline
    if (!window.ecoHavenDb) {
      syncWithCustomerWidget();
      syncWithSimulatedComms();
    }

    if (tab) activeTab = tab;

    const backdrop = document.getElementById('sellerCommsModalBackdrop');
    const modal = document.getElementById('sellerCommsModal');
    const card = document.getElementById('sellerCommsModalCard');

    if (!backdrop || !modal || !card) return;

    modal.classList.remove('hidden');
    backdrop.classList.remove('hidden');

    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });

    window.switchSellerCommsTab(activeTab);
  };

  window.closeSellerCommsModal = function() {
    const backdrop = document.getElementById('sellerCommsModalBackdrop');
    const modal = document.getElementById('sellerCommsModal');
    const card = document.getElementById('sellerCommsModalCard');

    if (!backdrop || !modal || !card) return;

    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      modal.classList.add('hidden');
      backdrop.classList.add('hidden');
    }, 280);
  };

  window.switchSellerCommsTab = function(tab) {
    activeTab = tab;
    const btnChat = document.getElementById('tabBtnLiveChat');
    const btnEmail = document.getElementById('tabBtnEmailInbox');
    const contentChat = document.getElementById('sellerTabContentChat');
    const contentEmail = document.getElementById('sellerTabContentEmail');
    const title = document.getElementById('sellerModalTitle');

    if (tab === 'chat') {
      if (title) title.innerText = "Live Chat Management";
      if (btnChat) {
        btnChat.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#86450D] text-white shadow-xs";
      }
      if (btnEmail) {
        btnEmail.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-white/70 hover:text-white";
      }
      if (contentChat) contentChat.classList.remove('hidden');
      if (contentEmail) contentEmail.classList.add('hidden');
      renderChatRoomsList();
      renderActiveChatPane();
    } else {
      if (title) title.innerText = "Customer Email Inbox";
      if (btnEmail) {
        btnEmail.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#86450D] text-white shadow-xs";
      }
      if (btnChat) {
        btnChat.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-white/70 hover:text-white";
      }
      if (contentEmail) contentEmail.classList.remove('hidden');
      if (contentChat) contentChat.classList.add('hidden');
      renderEmailsList();
      renderActiveEmailPane();
    }
  };

  window.selectSellerChatRoom = function(roomId) {
    activeRoomId = roomId;
    renderChatRoomsList();
    renderActiveChatPane();
  };

  window.deleteSellerChatRoom = function(roomId) {
    if (window.ecoHavenDb) {
      try {
        window.ecoHavenDb.ref('ecohaven/chats/' + roomId).remove();
      } catch(e) {}
    }
    let rooms = getChatRooms();
    rooms = rooms.filter(r => r.id !== roomId);
    localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent('ecohaven_seller_chats_updated', { detail: rooms }));
    if (window.ecoHavenDb && rooms.length === 0) {
      try {
        window.ecoHavenDb.ref('ecohaven/chats').set(null);
      } catch(e) {}
    }

    // Reset customer-side storage if customer room is deleted so it doesn't re-push
    if (roomId === 'room_live_client' || roomId.startsWith('room_')) {
      try {
        const welcomeMsg = {
          id: 'msg_welcome',
          sender: 'artisan',
          name: 'Mang Danilo Santos',
          role: 'Master Craftsman • Candaba Workshop',
          avatar: 'carpenter',
          text: 'Mabuhay! I am Mang Danilo, lead woodturner at our Pasig, Candaba atelier. How can I help you today with our kiln-dried mahogany pieces, custom dimensions, or your delivery schedule?',
          timestamp: Date.now()
        };
        localStorage.setItem(CUSTOMER_CHAT_STORAGE_KEY, JSON.stringify([welcomeMsg]));
        localStorage.setItem('ecohaven_chat_history_' + roomId, JSON.stringify([welcomeMsg]));
        localStorage.removeItem('ecohaven_chat_greeted_' + roomId);
      } catch(e) {}
    }

    activeRoomId = rooms.length > 0 ? rooms[0].id : null;
    renderChatRoomsList();
    renderActiveChatPane();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('Chat room deleted from Firebase.', 'info');
    }
  };

  window.resetSellerChatRooms = function() {
    const init = getInitialChatRooms();
    saveChatRooms(init);
    activeRoomId = init.length > 0 ? init[0].id : null;
    renderChatRoomsList();
    renderActiveChatPane();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('Default workshop customer rooms restored.', 'success');
    }
  };

  window.handleSellerChatReply = function(e) {
    e.preventDefault();
    const input = document.getElementById('sellerReplyInput');
    if (!input || !input.value.trim()) return;

    const replyText = input.value.trim();
    input.value = '';

    const rooms = getChatRooms();
    const room = rooms.find(r => r.id === activeRoomId);
    if (!room) return;

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'seller',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    if (!room.messages) room.messages = [];
    room.messages.push(newMsg);
    room.lastUpdated = Date.now();
    try {
      localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(rooms));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_chats_updated', { detail: rooms }));
      if (window.ecoHavenDb) {
        window.ecoHavenDb.ref('ecohaven/chats/' + room.id).set(room);
      }
    } catch(e) {}

    // Also sync to customer chat history for this room & mark as greeted
    if (room.id === 'room_live_client' || room.id.startsWith('room_')) {
      try {
        const roomKey = 'ecohaven_chat_history_' + room.id;
        const custRaw = localStorage.getItem(roomKey) || localStorage.getItem(CUSTOMER_CHAT_STORAGE_KEY);
        let custHistory = custRaw ? JSON.parse(custRaw) : [];
        custHistory.push({
          id: newMsg.id,
          sender: 'artisan',
          name: 'Mang Danilo Santos',
          role: 'Master Craftsman • Candaba Workshop',
          avatar: 'carpenter',
          text: replyText,
          timestamp: Date.now()
        });
        localStorage.setItem(roomKey, JSON.stringify(custHistory));
        localStorage.setItem('ecohaven_chat_greeted_' + room.id, 'true');
        if (room.id === 'room_live_client') {
          localStorage.setItem(CUSTOMER_CHAT_STORAGE_KEY, JSON.stringify(custHistory));
        }
      } catch(e) {}
    }

    renderActiveChatPane();
    renderChatRoomsList();

    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast(`Reply transmitted to ${room.customerName}`, 'success');
    }
  };

  window.selectSellerEmail = function(emailId) {
    activeEmailId = emailId;
    renderEmailsList();
    renderActiveEmailPane();
  };

  window.deleteSellerEmail = function(emailId) {
    if (window.ecoHavenDb) {
      try {
        window.ecoHavenDb.ref('ecohaven/emails/' + emailId).remove();
      } catch(e) {}
    }
    let emails = getEmails();
    emails = emails.filter(e => e.id !== emailId);
    localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify(emails));
    window.dispatchEvent(new CustomEvent('ecohaven_seller_emails_updated', { detail: emails }));
    if (window.ecoHavenDb && emails.length === 0) {
      try {
        window.ecoHavenDb.ref('ecohaven/emails').set(null);
      } catch(e) {}
    }

    try {
      const stored = localStorage.getItem('ecohaven_simulated_comms');
      if (stored) {
        let comms = JSON.parse(stored);
        if (Array.isArray(comms)) {
          comms = comms.filter(c => c.id !== emailId);
          localStorage.setItem('ecohaven_simulated_comms', JSON.stringify(comms));
        }
      }
    } catch(e) {}

    activeEmailId = emails.length > 0 ? emails[0].id : null;
    renderEmailsList();
    renderActiveEmailPane();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('Email permanently deleted from Firebase.', 'info');
    }
  };

  window.handleEmailSearch = function(val) {
    emailSearchQuery = val || '';
    renderEmailsList();
  };

  window.handleEmailUnreadToggle = function(checked) {
    emailUnreadOnly = checked;
    renderEmailsList();
  };

  window.replyToEmailCustomer = function(customerName, customerEmail) {
    // Switch to live chat and select or create room for this customer
    const rooms = getChatRooms();
    let room = rooms.find(r => r.customerEmail === customerEmail);
    if (!room) {
      room = {
        id: 'room_' + Date.now(),
        customerName: customerName,
        customerEmail: customerEmail,
        orderId: 'WF-2026-INQUIRY',
        unread: false,
        lastUpdated: Date.now(),
        messages: [
          {
            id: 'm_init',
            sender: 'seller',
            text: `Kumusta ${customerName}! Replying to your email regarding delivery and furniture specifications.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
          }
        ]
      };
      rooms.unshift(room);
      try {
      localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(rooms));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_chats_updated', { detail: rooms }));
      if (window.ecoHavenDb) {
        window.ecoHavenDb.ref('ecohaven/chats/' + room.id).set(room);
      }
    } catch(e) {}
    }
    activeRoomId = room.id;
    window.switchSellerCommsTab('chat');
  };

  window.composeSimulatedEmail = function() {
    const custEmail = prompt('Enter recipient customer email address:', 'customer@gmail.com');
    if (!custEmail) return;
    const subj = prompt('Enter email subject:', 'EcoHaven Candaba Workshop: Production Update');
    if (!subj) return;
    const body = prompt('Enter message body:', 'Magandang araw! Your bespoke solid mahogany furniture is currently in kiln stabilization.');
    if (!body) return;

    const emails = getEmails();
    emails.unshift({
      id: 'email_out_' + Date.now(),
      subject: subj,
      fromName: 'Danilo Santos (Candaba Workshop)',
      fromEmail: 'danilo@ecohaven.ph',
      toEmail: custEmail,
      orderId: 'WF-MANUAL',
      dateStr: new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      unread: false,
      body: body
    });
    const newEmail = emails[0];
    try {
      localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify(emails));
      window.dispatchEvent(new CustomEvent('ecohaven_seller_emails_updated', { detail: emails }));
      if (window.ecoHavenDb) {
        window.ecoHavenDb.ref('ecohaven/emails/' + newEmail.id).set(newEmail);
      }
    } catch(e) {}
    activeEmailId = emails[0].id;
    renderEmailsList();
    renderActiveEmailPane();
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('Simulated email dispatched to outbox & inbox.', 'success');
    }
  };

  // Initialize on load with Realtime Cloud Listeners
  let cloudListenersAttached = false;
  function attachCloudListeners() {
    if (cloudListenersAttached) return;
    if (!window.ecoHavenDb) {
      setTimeout(attachCloudListeners, 200);
      return;
    }
    cloudListenersAttached = true;

    // Listen to cloud chats - FIREBASE IS THE SINGLE SOURCE OF TRUTH
    try {
      window.ecoHavenDb.ref('ecohaven/chats').on('value', (snap) => {
        const val = snap.val();
        if (val && typeof val === 'object' && Object.keys(val).length > 0) {
          const cloudRooms = Object.values(val);
          localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify(cloudRooms));
          renderChatRoomsList();
          if (activeTab === 'chat') renderActiveChatPane();
        } else {
          // Firebase is empty (user deleted chats) — ALWAYS RESPECT FIREBASE, NEVER AUTO-RESEED!
          localStorage.setItem(SELLER_CHAT_STORAGE_KEY, JSON.stringify([]));
          renderChatRoomsList();
          if (activeTab === 'chat') renderActiveChatPane();
        }
      });
    } catch(e) {
      console.warn('Firebase chats listener notice:', e);
    }

    // Listen to cloud emails - FIREBASE IS THE SINGLE SOURCE OF TRUTH
    try {
      window.ecoHavenDb.ref('ecohaven/emails').on('value', (snap) => {
        const val = snap.val();
        if (val && typeof val === 'object' && Object.keys(val).length > 0) {
          const cloudEmails = Object.values(val);
          localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify(cloudEmails));
          renderEmailsList();
          if (activeTab === 'email') renderActiveEmailPane();
        } else {
          // Firebase is empty (user deleted emails) — ALWAYS RESPECT FIREBASE, NEVER AUTO-RESEED!
          localStorage.setItem(SELLER_EMAIL_STORAGE_KEY, JSON.stringify([]));
          renderEmailsList();
          if (activeTab === 'email') renderActiveEmailPane();
        }
      });
    } catch(e) {
      console.warn('Firebase emails listener notice:', e);
    }
  }

  function initHub() {
    injectSellerCommsModal();
    attachCloudListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHub);
  } else {
    initHub();
  }

})();

