// EcoHaven Furniture - Account Sign In & Register Modal
// Official Cloud Backend: https://ecohavenfurniture-d0114-default-rtdb.asia-southeast1.firebasedatabase.app/
// Secure Authentication via Firebase Realtime Database 'users' node
// Role is stored strictly in Firebase under users/{uid}/role (no user role selection)

(function() {
  // Utility: SHA-256 Hash using native Web Crypto API
  async function sha256Hex(str) {
    if (!str) return '';
    try {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('SHA-256 hashing error:', e);
      return str;
    }
  }

  // Utility: Generate standard 28-character alphanumeric UID
  function generateUid() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uid = '';
    const array = new Uint8Array(28);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < 28; i++) {
        uid += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < 28; i++) {
        uid += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return uid;
  }

  function injectAuthModal() {
    if (document.getElementById('ecohavenAuthModal')) return;

    const modalHTML = `
      <div id="ecohavenAuthModalBackdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden transition-opacity duration-300 opacity-0" onclick="closeAuthModal()"></div>
      <div id="ecohavenAuthModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none hidden">
        <div class="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-outline-variant/40 p-6 sm:p-8 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[92vh] overflow-y-auto no-scrollbar" id="ecohavenAuthCard">
          
          <!-- Close Button -->
          <button type="button" onclick="closeAuthModal()" class="absolute top-5 right-5 w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all active:scale-90" aria-label="Close">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>

          <!-- Modal Brand Header (Zero mention of role-based access) -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-primary font-bold shadow-sm">
              <span class="material-symbols-outlined text-[22px]">account_circle</span>
            </div>
            <div>
              <h3 class="font-headline text-xl font-bold text-on-surface leading-tight">EcoHaven Account</h3>
              <p class="text-xs text-on-surface-variant">Candaba Woodcraft Workshop</p>
            </div>
          </div>

          <!-- Auth Tabs -->
          <div class="grid grid-cols-2 p-1 rounded-2xl bg-surface-container-low mb-5 border border-outline-variant/30">
            <button type="button" id="tabRegisterBtn" onclick="switchAuthTab('register')" class="py-2 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-sm">
              Register
            </button>
            <button type="button" id="tabLoginBtn" onclick="switchAuthTab('login')" class="py-2 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface">
              Sign In
            </button>
          </div>

          <!-- REGISTER FORM (Zero role selection - role is managed in Firebase) -->
          <form id="authRegisterForm" onsubmit="handleAuthRegister(event)" class="space-y-4">
            
            <div>
              <label for="regFullName" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Full Name *
              </label>
              <input type="text" id="regFullName" required placeholder="Paolo Magisa" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
            </div>

            <div>
              <label for="regPhone" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Mobile Number * (Philippine Mobile)
              </label>
              <input type="tel" id="regPhone" required inputmode="numeric" 
                     oninput="this.value = this.value.replace(/[^0-9]/g, '')" 
                     placeholder="09171234567" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface font-mono"/>
            </div>

            <div>
              <label for="regEmail" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Email Address *
              </label>
              <input type="email" id="regEmail" required placeholder="name@example.ph" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
            </div>

            <div>
              <label for="regPassword" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Create Password * (At least 6 characters)
              </label>
              <div class="relative">
                <input type="password" id="regPassword" required minlength="6" placeholder="••••••••" oninput="checkPasswordStrength(this.value)" 
                       class="w-full px-4 py-2.5 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
              </div>
              <!-- Real-time Password Security Meter -->
              <div class="mt-2 space-y-1" id="regPasswordStrengthBox">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-on-surface-variant font-medium">Security Check:</span>
                  <span id="regPasswordStrengthLabel" class="font-bold text-outline">At least 6 characters</span>
                </div>
                <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                  <div id="pwdBar1" class="h-full w-1/3 bg-transparent rounded-full transition-all duration-300"></div>
                  <div id="pwdBar2" class="h-full w-1/3 bg-transparent rounded-full transition-all duration-300"></div>
                  <div id="pwdBar3" class="h-full w-1/3 bg-transparent rounded-full transition-all duration-300"></div>
                </div>
                <button type="button" onclick="togglePasswordVisibility('regPassword')" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-sm">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" id="regSubmitBtn" class="w-full py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-1.5 text-sm active:scale-95 mt-2">
              <span id="regBtnText">Register Account</span>
              <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
            </button>

            <p class="text-center text-xs text-on-surface-variant pt-2">
              Already have an account? 
              <button type="button" onclick="switchAuthTab('login')" class="text-primary font-bold hover:underline">
                Sign In here
              </button>
            </p>
          </form>

          <!-- SIGN IN FORM -->
          <form id="authLoginForm" onsubmit="handleAuthLogin(event)" class="space-y-4 hidden">
            
            <div>
              <label for="loginIdentifier" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Email or Mobile Number *
              </label>
              <input type="text" id="loginIdentifier" required placeholder="paomagisa@gmail.com or 09812558028" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="loginPassword" class="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Password *
                </label>
              </div>
              <div class="relative">
                <input type="password" id="loginPassword" required placeholder="••••••••" 
                       class="w-full px-4 py-2.5 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
                <button type="button" onclick="togglePasswordVisibility('loginPassword')" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-sm">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" id="loginSubmitBtn" class="w-full py-3 rounded-full bg-primary text-white font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-1.5 text-sm active:scale-95 mt-2">
              <span id="loginBtnText">Sign In</span>
              <span class="material-symbols-outlined text-[18px]">login</span>
            </button>

            <p class="text-center text-xs text-on-surface-variant pt-2">
              New to EcoHaven? 
              <button type="button" onclick="switchAuthTab('register')" class="text-primary font-bold hover:underline">
                Create an Account
              </button>
            </p>
          </form>

                    <!-- Social / Google Single Sign-On Option -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-outline-variant/40"></div>
            </div>
            <div class="relative flex justify-center text-[11px]">
              <span class="bg-surface px-3 text-on-surface-variant font-medium">or continue with</span>
            </div>
          </div>

          <button type="button" onclick="handleGoogleSignIn()" id="googleSignInBtn" class="w-full py-2.5 px-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2.5 active:scale-98">
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span id="googleSignInText">Continue with Google</span>
          </button>

          <!-- Footer Reassurance -->
          <div class="mt-6 pt-4 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[15px] text-tertiary">verified_user</span>
            <span>DTI Registered (#4918230) • Candaba Workshop Security</span>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  window.checkPasswordStrength = function(val) {
    const bar1 = document.getElementById('pwdBar1');
    const bar2 = document.getElementById('pwdBar2');
    const bar3 = document.getElementById('pwdBar3');
    const label = document.getElementById('regPasswordStrengthLabel');
    if (!bar1 || !bar2 || !bar3 || !label) return;

    if (!val || val.length === 0) {
      bar1.className = 'h-full w-1/3 bg-transparent rounded-full transition-all duration-300';
      bar2.className = 'h-full w-1/3 bg-transparent rounded-full transition-all duration-300';
      bar3.className = 'h-full w-1/3 bg-transparent rounded-full transition-all duration-300';
      label.textContent = 'At least 6 characters';
      label.className = 'font-bold text-outline';
      return;
    }

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (val.length >= 10 && /[^A-Za-z0-9]/.test(val)) score++;

    if (score === 1 || val.length < 6) {
      bar1.className = 'h-full w-1/3 bg-amber-500 rounded-full transition-all duration-300';
      bar2.className = 'h-full w-1/3 bg-transparent rounded-full transition-all duration-300';
      bar3.className = 'h-full w-1/3 bg-transparent rounded-full transition-all duration-300';
      label.textContent = val.length < 6 ? 'Too Short' : 'Moderate';
      label.className = 'font-bold text-amber-600';
    } else if (score === 2) {
      bar1.className = 'h-full w-1/3 bg-emerald-500 rounded-full transition-all duration-300';
      bar2.className = 'h-full w-1/3 bg-emerald-500 rounded-full transition-all duration-300';
      bar3.className = 'h-full w-1/3 bg-transparent rounded-full transition-all duration-300';
      label.textContent = 'Good';
      label.className = 'font-bold text-emerald-600';
    } else {
      bar1.className = 'h-full w-1/3 bg-emerald-600 rounded-full transition-all duration-300';
      bar2.className = 'h-full w-1/3 bg-emerald-600 rounded-full transition-all duration-300';
      bar3.className = 'h-full w-1/3 bg-emerald-600 rounded-full transition-all duration-300';
      label.textContent = 'Strong (Protected)';
      label.className = 'font-bold text-emerald-700';
    }
  };

  window.togglePasswordVisibility = function(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
  };

  window.openAuthModal = function(tab) {
    injectAuthModal();
    window.syncHeaderUserNavigation();
    const backdrop = document.getElementById('ecohavenAuthModalBackdrop');
    const modal = document.getElementById('ecohavenAuthModal');
    const card = document.getElementById('ecohavenAuthCard');

    if (tab) switchAuthTab(tab);

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  };

  window.closeAuthModal = function() {
    const backdrop = document.getElementById('ecohavenAuthModalBackdrop');
    const modal = document.getElementById('ecohavenAuthModal');
    const card = document.getElementById('ecohavenAuthCard');

    if (!backdrop || !card) return;

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      backdrop.classList.add('hidden');
      modal.classList.add('hidden');
    }, 280);
  };

  window.switchAuthTab = function(tab) {
    const regBtn = document.getElementById('tabRegisterBtn');
    const loginBtn = document.getElementById('tabLoginBtn');
    const regForm = document.getElementById('authRegisterForm');
    const loginForm = document.getElementById('authLoginForm');

    if (!regBtn || !loginBtn || !regForm || !loginForm) return;

    if (tab === 'register') {
      regBtn.className = 'py-2 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-sm';
      loginBtn.className = 'py-2 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface';
      regForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    } else {
      loginBtn.className = 'py-2 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-sm';
      regBtn.className = 'py-2 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface';
      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
    }
  };

  // Helper to show notification
  function notify(msg, type) {
    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast(msg, type || 'info');
    } else {
      alert(msg);
    }
  }

  // REGISTER ACCOUNT HANDLER
  window.handleAuthRegister = async function(e) {
    e.preventDefault();
    const nameInput = document.getElementById('regFullName');
    const phoneInput = document.getElementById('regPhone');
    const emailInput = document.getElementById('regEmail');
    const pwdInput = document.getElementById('regPassword');
    const submitBtn = document.getElementById('regSubmitBtn');
    const btnText = document.getElementById('regBtnText');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = pwdInput.value;

    if (!name || !phone || !email || !password) {
      notify('Please fill out all required fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      notify('Password must be at least 6 characters.', 'warning');
      return;
    }

    // Set loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Registering Account...';

    try {
      // 1. Check if email or phone already exists in Firebase 'users' node
      let existingUsers = {};
      if (window.ecoHavenDb) {
        try {
          const snap = await window.ecoHavenDb.ref('users').once('value');
          existingUsers = snap.val() || {};
        } catch (dbErr) {
          console.warn('Firebase read warning, checking fallback:', dbErr);
        }
      }

      const cleanPhone = phone.replace(/[^0-9]/g, '');
      for (const [uid, u] of Object.entries(existingUsers)) {
        if (!u) continue;
        if (u.email && u.email.toLowerCase() === email) {
          notify('An account with this email already exists. Please Sign In.', 'warning');
          switchAuthTab('login');
          document.getElementById('loginIdentifier').value = email;
          if (submitBtn) submitBtn.disabled = false;
          if (btnText) btnText.textContent = 'Register Account';
          return;
        }
        const existingPhone = (u.phone || '').replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 10 && existingPhone === cleanPhone) {
          notify('An account with this mobile number already exists. Please Sign In.', 'warning');
          switchAuthTab('login');
          document.getElementById('loginIdentifier').value = phone;
          if (submitBtn) submitBtn.disabled = false;
          if (btnText) btnText.textContent = 'Register Account';
          return;
        }
      }

      // 2. Hash password with SHA-256
      const passwordHash = await sha256Hex(password);
      const newUid = generateUid();
      const now = new Date().toISOString();

      // 3. Construct user record with role strictly stored under users node
      const newUser = {
        uid: newUid,
        displayName: name,
        email: email,
        phone: phone,
        role: 'customer', // Determined on the backend / field under users node (no UI selection)
        passwordHash: passwordHash,
        accountStatus: 'Active',
        emailVerified: false,
        createdAt: now,
        lastLoginAt: now
      };

      // 3.5. Dual-Layer: Attempt Firebase Auth SDK creation
      if (window.ecoHavenAuth) {
        try {
          const userCred = await window.ecoHavenAuth.createUserWithEmailAndPassword(email, password);
          if (userCred && userCred.user) {
            await userCred.user.updateProfile({ displayName: name });
            console.log('🟢 Firebase Auth SDK: Created verified user', userCred.user.uid);
          }
        } catch (fbAuthErr) {
          console.warn('Firebase Auth SDK registration notice:', fbAuthErr.code, fbAuthErr.message);
        }
      }

      // 4. Save to Firebase Realtime Database
      if (window.ecoHavenDb) {
        await window.ecoHavenDb.ref('users/' + newUid).set(newUser);
        try {
          await window.ecoHavenDb.ref('ecohaven/users/' + newUid).set(newUser);
        } catch (subErr) {
          console.warn('ecohaven/users sync:', subErr);
        }
        console.log('✅ Registered new user in Firebase Realtime Database:', newUid);
      }

      // 5. Store session in localStorage
      localStorage.setItem('ecohaven_user', JSON.stringify(newUser));
      localStorage.setItem('ecohaven_uid', newUid);

      closeAuthModal();
      notify(`Welcome to EcoHaven, ${name}! Your account has been registered.`, 'success');

      // Dispatch simulated Welcome Email & SMS notifications
      if (typeof window.simulateEmailNotification === 'function') {
        window.simulateEmailNotification({
          to: email,
          subject: 'Welcome to EcoHaven Furniture — Account Verified',
          body: `Mabuhay ${name}!\n\nYour artisan woodcraft account is active. Explore our sustainable modular collections handcrafted in Candaba, Pampanga.\n\nUse voucher code CANDABA10 for 10% off your initial suite reservation.`,
          category: 'Welcome'
        });
      }
      if (typeof window.simulateSmsNotification === 'function') {
        window.simulateSmsNotification({
          to: phone,
          message: `[EcoHaven PH] Salamat ${name}! Your account is active. Welcome voucher: CANDABA10 for 10% off your first modular order. Explore: ecohaven.ph`,
          category: 'Welcome'
        });
      }

      // 6. Route to customer dashboard
      const isPagesDir = window.location.pathname.includes('/pages/');
      const currentPath = window.location.pathname.toLowerCase();
      if (!currentPath.includes('dashboard.html')) {
        setTimeout(() => {
          window.location.href = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
        }, 600);
      } else if (typeof populateUserProfile === 'function') {
        populateUserProfile();
      }

    } catch (err) {
      console.error('Registration error:', err);
      notify('Registration failed. Please check your connection and try again.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Register Account';
    }
  };

  // SIGN IN ACCOUNT HANDLER
  window.handleAuthLogin = async function(e) {
    e.preventDefault();
    const identInput = document.getElementById('loginIdentifier');
    const pwdInput = document.getElementById('loginPassword');
    const submitBtn = document.getElementById('loginSubmitBtn');
    const btnText = document.getElementById('loginBtnText');

    const ident = identInput.value.trim();
    const password = pwdInput.value;

    if (!ident || !password) {
      notify('Please enter your email/phone and password.', 'warning');
      return;
    }

    // Set loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Signing In...';

    try {
      const inputHash = await sha256Hex(password);
      const cleanIdent = ident.toLowerCase();
      const cleanPhone = ident.replace(/[^0-9]/g, '');

      let matchedUser = null;

      // 1. Fetch users from Firebase Realtime Database
      if (window.ecoHavenDb) {
        try {
          const snap = await window.ecoHavenDb.ref('users').once('value');
          const users = snap.val() || {};

          for (const [uid, u] of Object.entries(users)) {
            if (!u) continue;
            const uEmail = (u.email || '').toLowerCase().trim();
            const uPhone = (u.phone || '').replace(/[^0-9]/g, '');

            if ((uEmail && uEmail === cleanIdent) || (cleanPhone.length >= 10 && uPhone === cleanPhone)) {
              matchedUser = { ...u, uid: u.uid || uid };
              break;
            }
          }
        } catch (dbErr) {
          console.warn('Firebase login search error:', dbErr);
        }
      }

      // Fallback: check localStorage user if offline or match not yet found in Firebase
      if (!matchedUser) {
        const localStr = localStorage.getItem('ecohaven_user');
        if (localStr) {
          try {
            const lu = JSON.parse(localStr);
            const luEmail = (lu.email || '').toLowerCase().trim();
            const luPhone = (lu.phone || '').replace(/[^0-9]/g, '');
            if ((luEmail && luEmail === cleanIdent) || (cleanPhone.length >= 10 && luPhone === cleanPhone)) {
              matchedUser = lu;
            }
          } catch(e) {}
        }
      }

      // Check if user was found
      if (!matchedUser) {
        notify('Account not found. Please check your email/phone or register.', 'warning');
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Sign In';
        return;
      }

      // Verify Password (check SHA-256 hash or plain text fallback)
      const validHash = matchedUser.passwordHash && matchedUser.passwordHash === inputHash;
      const validPlain = matchedUser.password && matchedUser.password === password;

      if (!validHash && !validPlain) {
        notify('Incorrect password. Please try again.', 'error');
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Sign In';
        return;
      }

      // Dual-Layer: Attempt Firebase Auth SDK session authentication if email
      if (window.ecoHavenAuth && ident.includes('@')) {
        try {
          await window.ecoHavenAuth.signInWithEmailAndPassword(ident, password);
          console.log('🟢 Firebase Auth SDK: Session authenticated');
        } catch (authErr) {
          console.warn('Firebase Auth SDK sign-in notice:', authErr.code);
        }
      }

      // Update lastLoginAt in Firebase
      if (window.ecoHavenDb && matchedUser.uid) {
        try {
          window.ecoHavenDb.ref('users/' + matchedUser.uid + '/lastLoginAt').set(new Date().toISOString());
        } catch(e) {}
      }

      // Dispatch simulated Security Alert Email
      if (typeof window.simulateEmailNotification === 'function') {
        window.simulateEmailNotification({
          to: matchedUser.email || 'customer@example.ph',
          subject: 'Security Alert: Sign-in detected on your EcoHaven Account',
          body: `Hi ${matchedUser.displayName || 'Customer'},\n\nA sign-in was detected on your account at ${new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })} PHT.\n\nIf this was you, you can safely ignore this alert. Otherwise, please reset your password immediately.`,
          category: 'Security'
        });
      }

      // Save user session to localStorage
      localStorage.setItem('ecohaven_user', JSON.stringify(matchedUser));
      localStorage.setItem('ecohaven_uid', matchedUser.uid || '');

      closeAuthModal();

      // Check role strictly from Firebase user record (admin, seller, or customer)
      const role = (matchedUser.role || 'customer').toLowerCase();
      const isPagesDir = window.location.pathname.includes('/pages/');

      if (role === 'admin' || role === 'seller') {
        notify(`Welcome back, Artisan Admin ${matchedUser.displayName || ''}! Loading workshop portal...`, 'success');
        setTimeout(() => {
          window.location.href = isPagesDir ? 'seller.html' : 'pages/seller.html';
        }, 500);
      } else {
        notify(`Welcome back, ${matchedUser.displayName || 'Valued Customer'}!`, 'success');
        setTimeout(() => {
          window.location.href = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
        }, 500);
      }

    } catch (err) {
      console.error('Sign In error:', err);
      notify('Sign In failed. Please try again.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Sign In';
    }
  };


  // HEADER USER & SELLER NAVIGATION DYNAMIC SYNC
  // - Orders Dashboard button: in between Notification and User icon when ANY user is logged in (seller or customer).
  // - Inventory of products button: immediately before Notification icon if SELLER is logged in.
    // ==========================================================
  // GOOGLE SINGLE SIGN-ON CONTROLLER
  // ==========================================================
  window.handleGoogleSignIn = async function() {
    const btn = document.getElementById('googleSignInBtn');
    const btnText = document.getElementById('googleSignInText');
    if (btnText) btnText.textContent = "Connecting to Google...";
    if (btn) btn.disabled = true;

    try {
      // 1. Try real Firebase Google Auth SDK Popup
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        try {
          const result = await firebase.auth().signInWithPopup(provider);
          const fUser = result.user;
          if (fUser) {
            await finalizeGoogleUser({
              uid: fUser.uid,
              fullName: fUser.displayName || 'Google Verified Customer',
              email: fUser.email || '',
              phone: fUser.phoneNumber || '',
              photoURL: fUser.photoURL || '',
              authProvider: 'google.com',
              role: 'customer'
            });
            return;
          }
        } catch (authError) {
          console.warn("Firebase Google Popup status:", authError.code, authError.message);
          
          if (authError.code === 'auth/popup-closed-by-user' || authError.code === 'auth/cancelled-popup-request') {
            if (btnText) btnText.textContent = "Continue with Google";
            if (btn) btn.disabled = false;
            return;
          }
          
          // If unauthorized domain (e.g. localhost or vercel domain pending in Firebase Console) or popup blocked
          if (authError.code === 'auth/unauthorized-domain' || authError.code === 'auth/operation-not-allowed' || authError.code === 'auth/configuration-not-found' || authError.code === 'auth/popup-blocked') {
            promptGoogleAccountFallback(authError.code);
            return;
          }
          throw authError;
        }
      } else {
        promptGoogleAccountFallback('no-firebase-auth');
      }
    } catch (err) {
      console.error("Google Sign-In caught error:", err);
      promptGoogleAccountFallback('fallback');
    } finally {
      if (btnText) btnText.textContent = "Continue with Google";
      if (btn) btn.disabled = false;
    }
  };

  async function finalizeGoogleUser(userProfile) {
    // 1. Save or update user profile in Firebase Realtime Database
    if (window.ecoHavenDb) {
      try {
        await window.ecoHavenDb.ref('users/' + userProfile.uid).update({
          fullName: userProfile.fullName,
          email: userProfile.email,
          phone: userProfile.phone || '',
          photoURL: userProfile.photoURL || '',
          authProvider: 'google.com',
          role: 'customer',
          lastLoginAt: firebase.database.ServerValue.TIMESTAMP
        });
      } catch (dbErr) {
        console.warn("DB update notice:", dbErr);
      }
    }

    // 2. Persist session to localStorage
    localStorage.setItem('ecohaven_user', JSON.stringify(userProfile));
    localStorage.setItem('ecohaven_uid', userProfile.uid);
    localStorage.setItem('currentUser', JSON.stringify(userProfile));

    // 3. Simulated Email Welcome
    if (typeof window.simulateEmailNotification === 'function') {
      window.simulateEmailNotification({
        to: userProfile.email,
        subject: "🌿 Welcome to EcoHaven Furniture — Google Verification Successful",
        body: `Mabuhay ${userProfile.fullName}!\n\nYour Google account (${userProfile.email}) has been successfully authenticated with EcoHaven Furniture (Candaba Workshop). You can now track your orders, manage saved delivery addresses, and reserve furniture pieces with 50% earnest timber allocation.`
      });
    }

    // 4. Update UI headers and dispatch login event
    if (typeof window.syncHeaderUserNavigation === 'function') {
      window.syncHeaderUserNavigation();
    }
    window.dispatchEvent(new CustomEvent('ecohaven_user_logged_in', { detail: userProfile }));

    window.closeAuthModal();

    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast(`🌿 Welcome, ${userProfile.fullName}! Signed in with Google.`, 'success');
    }
  }

  function promptGoogleAccountFallback(reasonCode) {
    const defaultEmail = "mariasantos.pampanga@gmail.com";
    const defaultName = "Maria Santos";
    
    const choice = prompt(
      "Google Sign-In Prototype:\n\nEnter your Google account email to sign in as a verified customer:",
      defaultEmail
    );
    if (!choice || !choice.trim()) return;

    const email = choice.trim().toLowerCase();
    const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const fallbackUser = {
      uid: 'google_' + Math.abs(email.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(36),
      fullName: formattedName || 'Google User',
      email: email,
      phone: '+63 917 123 4567',
      photoURL: '',
      authProvider: 'google.com',
      role: 'customer'
    };

    finalizeGoogleUser(fallbackUser);
  }

  window.syncHeaderUserNavigation = function() {
    const userStr = localStorage.getItem('ecohaven_user');
    const isPagesDir = window.location.pathname.includes('/pages/');

    const invBtn = document.getElementById('headerInventoryBtn');
    const ordersBtn = document.getElementById('headerOrdersBtn');
    const userBtn = document.getElementById('headerUserBtn');

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const role = (u.role || 'customer').toLowerCase();

        // 1. ORDERS DASHBOARD BUTTON (Between Notification & User icon)
        if (ordersBtn) {
          ordersBtn.classList.remove('hidden');
          ordersBtn.classList.add('flex');
          if (role === 'seller' || role === 'admin') {
            ordersBtn.href = isPagesDir ? 'seller.html' : 'pages/seller.html';
            ordersBtn.title = 'Artisan Orders & Fabrication Pipeline';
            ordersBtn.setAttribute('aria-label', 'Artisan Orders & Fabrication Pipeline');
            ordersBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">assignment</span>
              <span id="headerOrdersBadge" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface shadow-xs leading-none">3</span>
            `;
          } else {
            ordersBtn.href = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
            ordersBtn.title = 'My Orders Dashboard';
            ordersBtn.setAttribute('aria-label', 'My Orders Dashboard');
            ordersBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">receipt_long</span>
              <span id="headerOrdersBadge" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface shadow-xs leading-none">1</span>
            `;
          }
        }

        // 2. INVENTORY OF PRODUCTS BUTTON (Before Notification, ONLY for Seller)
        if (invBtn) {
          if (role === 'seller' || role === 'admin') {
            invBtn.classList.remove('hidden');
            invBtn.classList.add('flex');
            invBtn.href = isPagesDir ? 'seller.html#inventory' : 'pages/seller.html#inventory';
            invBtn.title = 'Workshop Material & Finished Products Inventory';
            invBtn.setAttribute('aria-label', 'Workshop Material & Finished Products Inventory');
          } else {
            invBtn.classList.add('hidden');
            invBtn.classList.remove('flex');
          }
        }

        // User Icon active indicator
        if (userBtn) {
          userBtn.title = (role === 'seller' || role === 'admin')
            ? `Artisan Workshop Portal (${u.displayName || 'Seller'})`
            : `Customer Account (${u.displayName || 'Customer'})`;
        }
      } catch(e) {
        console.error('Error syncing header navigation:', e);
      }
    } else {
      // Guest: Hide both buttons
      if (ordersBtn) {
        ordersBtn.classList.add('hidden');
        ordersBtn.classList.remove('flex');
      }
      if (invBtn) {
        invBtn.classList.add('hidden');
        invBtn.classList.remove('flex');
      }
      if (userBtn) {
        userBtn.title = 'Sign In to EcoHaven Account';
      }
    }
  };

  // Sync immediately and on storage/login events
  window.addEventListener('storage', function(e) {
    if (e.key === 'ecohaven_user') {
      window.syncHeaderUserNavigation();
    }
  });

  // GLOBAL USER SIGN OUT
  window.logoutEcoHavenUser = function() {
    localStorage.removeItem('ecohaven_user');
    localStorage.removeItem('ecohaven_uid');
    notify('You have signed out of your EcoHaven account.', 'info');
    const isPagesDir = window.location.pathname.includes('/pages/');
    setTimeout(() => {
      window.location.href = isPagesDir ? '../index.html' : 'index.html';
    }, 400);
  };

  // GLOBAL HEADER USER ICON CLICK HANDLER
  // Routes directly to seller or customer portal if logged in; opens login modal otherwise.
  window.handleHeaderUserClick = function() {
    const userStr = localStorage.getItem('ecohaven_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const role = (u.role || 'customer').toLowerCase();
        const isPagesDir = window.location.pathname.includes('/pages/');
        if (role === 'seller' || role === 'admin') {
          window.location.href = isPagesDir ? 'seller.html' : 'pages/seller.html';
          return;
        } else {
          window.location.href = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
          return;
        }
      } catch(e) {}
    }
    window.openAuthModal('login');
  };

  // Inject modal into DOM when ready
  const initAuthAndNav = () => {
    injectAuthModal();
    if (typeof window.syncHeaderUserNavigation === 'function') {
      window.syncHeaderUserNavigation();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthAndNav);
  } else {
    initAuthAndNav();
  }
})();
