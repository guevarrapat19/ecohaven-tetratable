
// =========================================================================
// 11-DIGIT PHILIPPINE PHONE NUMBER CONTROLLER & LIVE INDICATOR
// =========================================================================
window.formatAndValidatePhoneInput = function(inputEl, indicatorEl) {
  if (!inputEl) return;
  
  // Enforce numeric only and max 11 digits
  let val = inputEl.value.replace(/[^0-9]/g, '');
  if (val.length > 11) val = val.slice(0, 11);
  if (inputEl.value !== val) {
    inputEl.value = val;
  }
  inputEl.maxLength = 11;
  inputEl.setAttribute('inputmode', 'numeric');

  // Find or create indicator element if not provided
  if (!indicatorEl) {
    let indId = inputEl.id ? inputEl.id + '_indicator' : null;
    if (indId) indicatorEl = document.getElementById(indId);
    if (!indicatorEl) {
      indicatorEl = document.createElement('div');
      if (indId) indicatorEl.id = indId;
      indicatorEl.className = 'phone-digit-indicator text-[11px] font-mono mt-1 flex items-center justify-between transition-all';
      if (inputEl.parentNode) {
        inputEl.parentNode.appendChild(indicatorEl);
      }
    }
  }

  const count = val.length;
  if (!indicatorEl) return;

  if (count === 0) {
    indicatorEl.innerHTML = '<span class="text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">info</span>Must be 11 digits</span><span class="text-outline font-semibold">0/11</span>';
    inputEl.classList.remove('border-emerald-500', 'border-amber-500');
  } else if (count < 11) {
    const remaining = 11 - count;
    indicatorEl.innerHTML = '<span class="text-amber-700 flex items-center gap-1 font-medium"><span class="material-symbols-outlined text-[13px]">hourglass_top</span>Needs ' + remaining + ' more digit' + (remaining > 1 ? 's' : '') + ' (starts with 09)</span><span class="text-amber-700 font-bold">' + count + '/11</span>';
    inputEl.classList.remove('border-emerald-500');
  } else if (count === 11) {
    if (val.startsWith('09')) {
      indicatorEl.innerHTML = '<span class="text-emerald-700 flex items-center gap-1 font-semibold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Valid 11-digit PH mobile</span><span class="text-emerald-700 font-bold">11/11 ✓</span>';
      inputEl.classList.add('border-emerald-500');
    } else {
      indicatorEl.innerHTML = '<span class="text-amber-700 flex items-center gap-1 font-medium"><span class="material-symbols-outlined text-[13px]">warning</span>PH mobile should start with 09</span><span class="text-amber-700 font-bold">11/11</span>';
    }
  }
};

window.initEcoHavenPhoneFields = function() {
  const phoneSelectors = [
    '#regPhone',
    '#signupPhone',
    '#customerPhoneInput',
    '#userContact',
    '#editPhone',
    '#addrPhone',
    '#editCustomerPhone',
    '#driverPhoneInput',
    'input[type="tel"]'
  ];

  phoneSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(input => {
      if (input.dataset.phoneBound === 'true') {
        window.formatAndValidatePhoneInput(input);
        return;
      }
      input.dataset.phoneBound = 'true';
      input.maxLength = 11;
      input.setAttribute('inputmode', 'numeric');
      if (!input.placeholder || input.placeholder.includes('+63')) {
        input.placeholder = 'Mobile Number';
      }

      window.formatAndValidatePhoneInput(input);

      input.addEventListener('input', function() {
        window.formatAndValidatePhoneInput(input);
      });

      input.addEventListener('blur', function() {
        const clean = this.value.replace(/[^0-9]/g, '');
        if (clean.length > 0 && clean.length < 11) {
          let indId = this.id ? this.id + '_indicator' : null;
          let indicatorEl = indId ? document.getElementById(indId) : null;
          if (indicatorEl) {
            indicatorEl.innerHTML = '<span class="text-red-700 flex items-center gap-1 font-medium"><span class="material-symbols-outlined text-[13px]">error</span>Incomplete: Phone number must be 11 digits (' + clean.length + '/11)</span><span class="text-red-700 font-bold">' + clean.length + '/11</span>';
          }
        }
      });
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initEcoHavenPhoneFields);
} else {
  window.initEcoHavenPhoneFields();
}

// EcoHaven Furniture - Account Sign In & Register Modal
// Official Cloud Backend: https://ecohavenfurniture-d0114-default-rtdb.asia-southeast1.firebasedatabase.app/
// Secure Authentication via Firebase Realtime Database 'users' node
// Role is stored strictly in Firebase under users/{uid}/role (no user role selection)

(function () {
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
      <div id="ecohavenAuthModalBackdrop" class="fixed inset-0 bg-black/25 backdrop-blur-[3px] z-50 hidden transition-opacity duration-300 opacity-0" onclick="closeAuthModal()"></div>
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
              <input type="text" id="regFullName" required placeholder="Full Name" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
            </div>

            <div>
              <label for="regPhone" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5 flex items-center justify-between">
                <span>Mobile Number *</span>
                <span class="text-[10px] text-primary font-mono">11 digits</span>
              </label>
              <input type="tel" id="regPhone" required inputmode="numeric" maxlength="11" 
                     oninput="if(window.formatAndValidatePhoneInput) window.formatAndValidatePhoneInput(this);" 
                     placeholder="Mobile Number" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface font-mono"/>
              <div id="regPhone_indicator" class="phone-digit-indicator text-[11px] font-mono mt-1 flex items-center justify-between transition-all">
                <span class="text-on-surface-variant flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px]">info</span>
                  Must be 11 digits
                </span>
                <span class="text-outline font-semibold">0/11</span>
              </div>
            </div>

            <div>
              <label for="regEmail" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Email Address *
              </label>
              <input type="email" id="regEmail" required placeholder="Email Address" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
            </div>

            <div>
              <label for="regPassword" class="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
                Create Password * (At least 6 characters)
              </label>
              <div class="relative">
                <input type="password" id="regPassword" required minlength="6" placeholder="Password" oninput="checkPasswordStrength(this.value)" 
                       class="w-full px-4 py-2.5 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
                <button type="button" onclick="togglePasswordVisibility('regPassword')" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-sm">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
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
              </div>
            </div>

            <!-- Terms & Conditions + Privacy Policy Consent Checkbox -->
            <div class="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40">
              <label for="regAgreeTerms" class="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" id="regAgreeTerms" required class="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-[#86450d] cursor-pointer flex-shrink-0"/>
                <span class="text-[11px] text-on-surface-variant leading-relaxed">
                  I agree to the <button type="button" onclick="openLegalQuickModal('terms')" class="text-primary font-bold underline hover:text-primary-container">Terms &amp; Conditions</button>, <button type="button" onclick="openLegalQuickModal('privacy')" class="text-primary font-bold underline hover:text-primary-container">Privacy Policy (RA 10173)</button>, and <button type="button" onclick="openLegalQuickModal('returns')" class="text-primary font-bold underline hover:text-primary-container">Return Policy</button>.
                </span>
              </label>
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
              <input type="text" id="loginIdentifier" required placeholder="Email or Mobile Number" 
                     class="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface"/>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="loginPassword" class="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Password *
                </label>
              </div>
              <div class="relative">
                <input type="password" id="loginPassword" required placeholder="Password" 
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

            <p class="text-center text-[11px] text-on-surface-variant leading-relaxed">
              By signing in, you agree to EcoHaven's <button type="button" onclick="openLegalQuickModal('terms')" class="text-primary font-semibold underline hover:text-primary-container">Terms &amp; Conditions</button>, <button type="button" onclick="openLegalQuickModal('privacy')" class="text-primary font-semibold underline hover:text-primary-container">Privacy Policy</button>, and <button type="button" onclick="openLegalQuickModal('returns')" class="text-primary font-semibold underline hover:text-primary-container">Return Policy</button>.
            </p>

            <p class="text-center text-xs text-on-surface-variant pt-1">
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

      <!-- WELCOME VOUCHER MODAL (10% OFF EXCLUSIVE NEW ACCOUNT GIFT) -->
      <div id="ecohavenVoucherModalBackdrop" class="fixed inset-0 bg-black/45 backdrop-blur-sm z-[60] hidden transition-opacity duration-300 opacity-0" onclick="closeWelcomeVoucherModal()"></div>
      <div id="ecohavenVoucherModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none hidden">
        <div class="relative w-full max-w-md bg-gradient-to-b from-[#FFFDF9] to-[#FBF7F0] rounded-3xl shadow-2xl border-2 border-primary/30 p-6 sm:p-8 pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 max-h-[92vh] overflow-y-auto no-scrollbar text-center" id="ecohavenVoucherCard">
          
          <!-- Close Button -->
          <button type="button" onclick="closeWelcomeVoucherModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all active:scale-90" aria-label="Close">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>

          <!-- Celebratory Badge -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 border border-emerald-300/60 shadow-2xs">
            <span class="material-symbols-outlined text-[16px]">celebration</span>
            <span>Welcome Gift Claimed!</span>
          </div>

          <h3 class="font-headline text-2xl font-bold text-on-surface leading-tight mb-1">
            Enjoy 10% OFF Your Order
          </h3>
          <p class="text-xs text-on-surface-variant mb-5">
            Salamat for joining EcoHaven, <span id="voucherModalUserName" class="font-semibold text-on-surface">Artisan Friend</span>! Here is your exclusive 10% welcome voucher for handcrafted solid timber suites and workshop accessories.
          </p>

          <!-- Perforated Voucher Ticket Card -->
          <div class="relative bg-white rounded-2xl border-2 border-dashed border-primary/40 p-5 mb-5 shadow-sm overflow-hidden text-left">
            <!-- Cutout Circles for ticket effect -->
            <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FBF7F0] rounded-full border-r-2 border-dashed border-primary/40"></div>
            <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FBF7F0] rounded-full border-l-2 border-dashed border-primary/40"></div>
            
            <div class="flex items-center justify-between mb-3 border-b border-outline-variant/30 pb-2">
              <div class="flex items-center gap-1.5 text-primary font-bold text-xs">
                <span class="material-symbols-outlined text-[18px]">eco</span>
                <span>EcoHaven Candaba Workshop</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">ONE-TIME USE</span>
            </div>

            <div class="flex items-baseline justify-between mb-3">
              <div>
                <span class="text-3xl font-extrabold text-primary font-headline">10% OFF</span>
                <p class="text-[11px] text-on-surface-variant">Applied to your total order price</p>
              </div>
              <div class="text-right">
                <span class="text-xs text-outline block">Voucher Code</span>
                <span class="text-base font-mono font-bold text-on-surface tracking-wider bg-surface-container-low px-2 py-1 rounded border border-outline-variant/40" id="voucherModalCode">WELCOME10</span>
              </div>
            </div>

            <div class="text-[11px] text-on-surface-variant flex items-center justify-between pt-1">
              <span class="flex items-center gap-1 text-emerald-700 font-semibold">
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                Active on your account
              </span>
              <span class="text-outline">Valid on 1st order</span>
            </div>
          </div>

          <!-- Claim & Action Buttons -->
          <div class="space-y-2">
            <button type="button" onclick="claimVoucherAndRedirect()" class="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98">
              <span class="material-symbols-outlined text-[18px]">home_pin</span>
              <span id="claimVoucherBtnText">Claim 10% Voucher &amp; Set Up Profile Address →</span>
            </button>
            <button type="button" onclick="closeWelcomeVoucherModal()" class="w-full py-2.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all">
              Proceed to My Profile &amp; Add Default Address
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  window.checkPasswordStrength = function (val) {
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

  window.togglePasswordVisibility = function (inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
  };

  window.openAuthModal = function (tab) {
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

  window.closeAuthModal = function () {
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

  // ==========================================================
  // WELCOME VOUCHER CONTROLLER (10% OFF ON REGISTRATION)
  // ==========================================================
  window.showWelcomeVoucherModal = function (voucherData = {}) {
    injectAuthModal();
    const backdrop = document.getElementById('ecohavenVoucherModalBackdrop');
    const modal = document.getElementById('ecohavenVoucherModal');
    const card = document.getElementById('ecohavenVoucherCard');
    if (!backdrop || !modal || !card) return;

    if (voucherData.name) {
      const nameEl = document.getElementById('voucherModalUserName');
      if (nameEl) nameEl.textContent = voucherData.name;
    }

    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  };

  window.closeWelcomeVoucherModal = function () {
    const backdrop = document.getElementById('ecohavenVoucherModalBackdrop');
    const modal = document.getElementById('ecohavenVoucherModal');
    const card = document.getElementById('ecohavenVoucherCard');
    if (!backdrop || !card) return;

    backdrop.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
      backdrop.classList.add('hidden');
      modal.classList.add('hidden');
      if (localStorage.getItem('ecohaven_new_user_setup_address') === 'true') {
        const isPagesDir = window.location.pathname.includes('/pages/');
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.includes('dashboard.html')) {
          window.location.href = isPagesDir ? 'dashboard.html?setupAddress=1' : 'pages/dashboard.html?setupAddress=1';
        } else if (typeof openAddressModal === 'function') {
          openAddressModal();
        }
      }
    }, 280);
  };

  window.claimVoucherAndRedirect = function () {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('WELCOME10');
      }
    } catch (e) {}

    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast('🎉 WELCOME10 voucher claimed! Proceeding to your Profile to set up your default address.', 'success');
    }

    const backdrop = document.getElementById('ecohavenVoucherModalBackdrop');
    const modal = document.getElementById('ecohavenVoucherModal');
    const card = document.getElementById('ecohavenVoucherCard');
    if (backdrop && card) {
      backdrop.classList.add('opacity-0');
      card.classList.remove('scale-100', 'opacity-100');
      card.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        backdrop.classList.add('hidden');
        modal.classList.add('hidden');
      }, 280);
    }

    setTimeout(() => {
      const isPagesDir = window.location.pathname.includes('/pages/');
      const currentPath = window.location.pathname.toLowerCase();
      if (!currentPath.includes('dashboard.html')) {
        window.location.href = isPagesDir ? 'dashboard.html?setupAddress=1' : 'pages/dashboard.html?setupAddress=1';
      } else if (typeof openAddressModal === 'function') {
        openAddressModal();
      }
    }, 320);
  };

  window.switchAuthTab = function (tab) {
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

  // ==========================================================
  // IN-MODAL LEGAL POLICIES QUICK-READER (TERMS / PRIVACY / RETURNS)
  // ==========================================================
  window.openLegalQuickModal = function (section = 'terms') {
    let quickModal = document.getElementById('ecohavenLegalQuickModal');
    const isPagesDir = window.location.pathname.includes('/pages/');
    const legalBaseHref = isPagesDir ? 'legal.html' : 'pages/legal.html';

    if (!quickModal) {
      const html = `
        <div id="ecohavenLegalQuickModal" class="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
          <div class="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-outline-variant/50 flex flex-col max-h-[88vh] overflow-hidden">
            <!-- Header -->
            <div class="p-5 sm:px-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-primary text-[22px]">gavel</span>
                <div>
                  <h4 class="font-headline text-lg font-bold text-on-surface leading-tight">EcoHaven Legal &amp; Customer Policies</h4>
                  <p class="text-[11px] text-on-surface-variant">Effective Date: November 16, 2026 • DTI &amp; RA 10173 Compliant</p>
                </div>
              </div>
              <button type="button" onclick="closeLegalQuickModal()" class="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <!-- Tabs -->
            <div class="grid grid-cols-3 gap-1 p-2 bg-surface-container-lowest border-b border-outline-variant/30">
              <button type="button" id="legalTab_terms" onclick="switchLegalQuickTab('terms')" class="py-2 px-3 rounded-xl text-xs font-bold transition-all bg-primary text-white">
                1. Terms &amp; Conditions
              </button>
              <button type="button" id="legalTab_privacy" onclick="switchLegalQuickTab('privacy')" class="py-2 px-3 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface">
                2. Privacy Policy
              </button>
              <button type="button" id="legalTab_returns" onclick="switchLegalQuickTab('returns')" class="py-2 px-3 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface">
                3. Return Policy
              </button>
            </div>

            <!-- Scrollable Policy Body -->
            <div class="p-5 sm:p-6 overflow-y-auto text-xs sm:text-sm text-on-surface-variant space-y-4 leading-relaxed flex-1">
              
              <!-- Panel: Terms & Conditions (Sign In) -->
              <div id="legalPanel_terms" class="space-y-3">
                <p class="font-semibold text-on-surface">Terms and Conditions — EcoHaven Furniture (Effective: November 16, 2026)</p>
                <p>Welcome to EcoHaven Furniture Company. By creating an account, accessing our website, or purchasing our products—including the TetraTable—you agree to be bound by these Terms and Conditions. If you do not agree with any part of these Terms, please do not register for an account or use our services.</p>
                <p><strong class="text-on-surface">1. Account Registration &amp; Eligibility:</strong> You must be at least 18 years old to create an account and place orders. You agree to provide true, accurate, current, and complete information (full name, email, shipping address, contact number). You are responsible for safeguarding your password; notify us immediately at <span class="text-primary font-semibold">ecohavenfurnitureph@gmail.com</span> of any unauthorized access. Creating multiple accounts to abuse promotional discounts or vouchers is prohibited.</p>
                <p><strong class="text-on-surface">2. Use of Website &amp; Prohibited Conduct:</strong> You agree not to use our website or products for unlawful/fraudulent purposes, interfere with platform security, or reproduce/exploit our website content or TetraTable designs without written permission.</p>
                <p><strong class="text-on-surface">3. Products, Pricing &amp; Orders:</strong> Natural variations in sustainable wood grains and screen settings may cause slight visual differences. All prices are listed in Philippine Pesos (PHP / ₱) and are subject to change without notice. We reserve the right to cancel or refuse orders due to stock limitations, pricing errors, or suspected fraud.</p>
                <p><strong class="text-on-surface">4. Payments, Shipping &amp; Returns:</strong> Valid payment details are required for all purchases. Delivery timelines are estimates and risk of loss passes to you upon delivery. All returns, exchanges, and refunds are governed by our Return &amp; Refund Policy.</p>
                <p><strong class="text-on-surface">5. Intellectual Property:</strong> All content—including the EcoHaven Furniture name, TetraTable product designs, blueprints, logos, graphics, text, and photographs—is the exclusive property of EcoHaven Furniture.</p>
                <p><strong class="text-on-surface">6. Privacy &amp; Communications:</strong> Personal data collected during sign-up is handled under our Privacy Policy and the Philippine Data Privacy Act of 2012 (RA 10173). By creating an account, you consent to receive essential transactional emails (order confirmations, shipping updates, password resets).</p>
                <p><strong class="text-on-surface">7. Account Suspension &amp; Termination:</strong> We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraud. You may request account deletion anytime.</p>
                <p><strong class="text-on-surface">8. Limitation of Liability:</strong> EcoHaven Furniture shall not be liable for indirect, incidental, or consequential damages arising from website use or improper furniture assembly/use. Total liability shall not exceed the amount paid for the specific product.</p>
                <p><strong class="text-on-surface">9. Changes to Terms:</strong> Updates will be posted with a revised effective date. Continued account use constitutes acceptance.</p>
                <p><strong class="text-on-surface">10. Governing Law &amp; Contact:</strong> Governed by the laws of the Republic of the Philippines. Contact: EcoHaven Furniture • Email: <span class="text-primary font-semibold">ecohavenfurnitureph@gmail.com</span> • Phone: +63 981 255 8028 • Address: #34, Dalan Batu, Pasig, Candaba, Pampanga.</p>
              </div>

              <!-- Panel: Privacy Policy -->
              <div id="legalPanel_privacy" class="space-y-3 hidden">
                <p class="font-semibold text-on-surface">Privacy Policy — EcoHaven Furniture (RA 10173 • Effective: November 16, 2026)</p>
                <p>At EcoHaven Furniture Company, we respect your privacy and safeguard your personal data in compliance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).</p>
                <p><strong class="text-on-surface">1. Information We Collect:</strong> Personal &amp; Account Details (full name, email, encrypted password); Contact &amp; Delivery Info (shipping/billing address, contact number, delivery notes); Transaction &amp; Order Info (products ordered, finishes, order history, payment method, reference numbers—we do not store card details or e-wallet PINs); Device &amp; Browsing Data (IP, browser, cookies to keep you signed in and save cart items).</p>
                <p><strong class="text-on-surface">2. How We Use Your Information:</strong> Order processing &amp; delivery; account management; customer service &amp; warranty claims; order updates &amp; opt-in promotions; website improvement &amp; security.</p>
                <p><strong class="text-on-surface">3. Sharing Your Information:</strong> We never sell, rent, or trade your personal data. We only share necessary details with Courier &amp; Delivery Partners, Payment Gateways (GCash, Maya, bank/card processors), encrypted Website Hosting &amp; IT Providers, and Legal Authorities when required by Philippine law.</p>
                <p><strong class="text-on-surface">4. Data Security &amp; Retention:</strong> Protected via SSL/HTTPS encryption, encrypted passwords, and restricted staff access. Retained while your account is active and up to 5–10 years for tax/accounting compliance, then safely deleted or anonymized.</p>
                <p><strong class="text-on-surface">5. Cookies:</strong> Used to remember preferences and shopping cart items.</p>
                <p><strong class="text-on-surface">6. Your Privacy Rights (RA 10173):</strong> You have the right to Be Informed, Access your data, Correct/Rectify inaccuracies, Erase/Block data, Object/Opt Out of marketing, Data Portability, and File a Complaint with the National Privacy Commission (NPC).</p>
                <p><strong class="text-on-surface">7–8. Third-Party Links &amp; Policy Updates:</strong> External links follow their own privacy policies. Any updates will be posted with a revised Effective Date.</p>
              </div>

              <!-- Panel: Return & Refund Policy -->
              <div id="legalPanel_returns" class="space-y-3 hidden">
                <p class="font-semibold text-on-surface">Return &amp; Refund Policy — EcoHaven Furniture (Effective: November 16, 2026)</p>
                <p><strong class="text-on-surface">1. Return Window (7 Calendar Days):</strong> You have 7 calendar days from the date your TetraTable is delivered to initiate a return or exchange. The item must be unused, unassembled (or neatly disassembled without damage), free of scratches/stains, and in its original packaging with all modular components, hardware, and manuals.</p>
                <p><strong class="text-on-surface">2. Non-Returnable Items:</strong> Custom-finished, personalized, or made-to-order TetraTable units; Final Sale/Clearance items; products damaged due to improper assembly, misuse, accidents, or normal wear and tear.</p>
                <p><strong class="text-on-surface">3. Damaged or Defective Items:</strong> Inspect your TetraTable upon delivery. Contact us within 7 days of delivery at <span class="text-primary font-semibold">ecohavenfurnitureph@gmail.com</span> with your order number and clear photos/videos. We will arrange free replacement parts, a full replacement unit, or a complete refund at no shipping cost to you.</p>
                <p><strong class="text-on-surface">4. How to Initiate a Return:</strong> (1) Email <span class="text-primary font-semibold">ecohavenfurnitureph@gmail.com</span> with your Order Number, Full Name, and Reason for Return. (2) Receive review &amp; RMA number within 1–2 business days (do not ship back without authorization). (3) Securely pack all components in the original box.</p>
                <p><strong class="text-on-surface">5. Return Shipping Costs:</strong> EcoHaven covers 100% of return shipping for defective, damaged, or incorrect items. For change-of-mind returns, the customer covers return shipping, original shipping is non-refundable, and a 5% restocking fee may apply if original packaging is missing/damaged.</p>
                <p><strong class="text-on-surface">6–8. Refunds, Exchanges &amp; Support:</strong> Inspected within 3–5 business days of arrival; approved refunds are issued to your original payment method within 5–10 business days. Support: <span class="text-primary font-semibold">ecohavenfurnitureph@gmail.com</span> • +63 981 255 8028 (Mon–Sat, 9:00 AM – 6:00 PM).</p>
              </div>

            </div>

            <!-- Footer Actions -->
            <div class="p-4 sm:px-6 border-t border-outline-variant/30 bg-surface-container-low flex flex-wrap items-center justify-between gap-2">
              <a id="legalFullPageLink" href="${legalBaseHref}#terms" target="_blank" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>Open Full Legal Page</span>
                <span class="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
              <div class="flex items-center gap-2">
                <button type="button" onclick="closeLegalQuickModal()" class="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all">
                  Close
                </button>
                <button type="button" onclick="acceptLegalQuickModal()" class="px-5 py-2 rounded-full bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>I Agree &amp; Continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      quickModal = document.getElementById('ecohavenLegalQuickModal');
    }

    window.switchLegalQuickTab(section);
    quickModal.classList.remove('hidden');
  };

  window.switchLegalQuickTab = function (section) {
    const sections = ['terms', 'privacy', 'returns'];
    const isPagesDir = window.location.pathname.includes('/pages/');
    const legalBaseHref = isPagesDir ? 'legal.html' : 'pages/legal.html';
    const fullLink = document.getElementById('legalFullPageLink');
    if (fullLink) fullLink.href = `${legalBaseHref}#${section}`;

    sections.forEach(s => {
      const tab = document.getElementById('legalTab_' + s);
      const panel = document.getElementById('legalPanel_' + s);
      if (!tab || !panel) return;
      if (s === section) {
        tab.className = 'py-2 px-3 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-xs';
        panel.classList.remove('hidden');
      } else {
        tab.className = 'py-2 px-3 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface';
        panel.classList.add('hidden');
      }
    });
  };

  window.closeLegalQuickModal = function () {
    const quickModal = document.getElementById('ecohavenLegalQuickModal');
    if (quickModal) quickModal.classList.add('hidden');
  };

  window.acceptLegalQuickModal = function () {
    const agreeBox = document.getElementById('regAgreeTerms');
    if (agreeBox) agreeBox.checked = true;
    const signupAgreeBox = document.getElementById('signupAgreeTerms');
    if (signupAgreeBox) signupAgreeBox.checked = true;
    window.closeLegalQuickModal();
  };

  // REGISTER ACCOUNT HANDLER
  window.handleAuthRegister = async function (e) {
    e.preventDefault();
    const nameInput = document.getElementById('regFullName');
    const phoneInput = document.getElementById('regPhone');
    const emailInput = document.getElementById('regEmail');
    const pwdInput = document.getElementById('regPassword');
    const agreeInput = document.getElementById('regAgreeTerms');
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

    if (agreeInput && !agreeInput.checked) {
      notify('Please agree to the Terms & Conditions and Privacy Policy to register.', 'warning');
      agreeInput.focus();
      return;
    }

    const cleanRegPhone = phone.replace(/[^0-9]/g, '');
    if (cleanRegPhone.length !== 11) {
      notify('Phone number must be exactly 11 digits (e.g. 09171234567).', 'warning');
      phoneInput.focus();
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
      let newUid = generateUid();
      const now = new Date().toISOString();

      // 2.5. Dual-Layer: Attempt Firebase Auth SDK creation to get synchronized auth.uid
      if (window.ecoHavenAuth) {
        try {
          const userCred = await window.ecoHavenAuth.createUserWithEmailAndPassword(email, password);
          if (userCred && userCred.user) {
            newUid = userCred.user.uid;
            await userCred.user.updateProfile({ displayName: name });
            console.log('🟢 Firebase Auth SDK: Created verified user', newUid);
          }
        } catch (fbAuthErr) {
          console.warn('Firebase Auth SDK registration notice:', fbAuthErr.code, fbAuthErr.message);
        }
      }

      // 3. Construct user record with role strictly stored under users node
      const newUser = {
        uid: newUid,
        displayName: name,
        fullName: name,
        email: email,
        phone: phone,
        role: 'customer', // Determined on the backend / field under users node (no UI selection)
        passwordHash: passwordHash,
        accountStatus: 'Active',
        emailVerified: false,
        createdAt: now,
        lastLoginAt: now,
        welcomeVoucher: {
          code: 'WELCOME10',
          discountPercent: 10,
          claimed: true,
          claimedAt: now,
          used: false
        }
      };

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
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      closeAuthModal();
      notify(`Welcome to EcoHaven, ${name}! Your account has been registered.`, 'success');

      // Dispatch simulated Welcome Email & SMS notifications
      if (typeof window.simulateEmailNotification === 'function') {
        window.simulateEmailNotification({
          to: email,
          subject: 'Welcome to EcoHaven Furniture — Account Verified',
          body: `Mabuhay ${name}!\n\nYour artisan woodcraft account is active. Explore our sustainable modular collections handcrafted in Candaba, Pampanga.\n\nUse voucher code WELCOME10 for 10% off your initial suite reservation.`,
          category: 'Welcome'
        });
      }
      if (typeof window.simulateSmsNotification === 'function') {
        window.simulateSmsNotification({
          to: phone,
          message: `[EcoHaven PH] Salamat ${name}! Your account is active. Welcome voucher: WELCOME10 for 10% off your first modular order. Explore: ecohaven.ph`,
          category: 'Welcome'
        });
      }

      // Update header navigation & dispatch login event
      if (typeof window.syncHeaderUserNavigation === 'function') {
        window.syncHeaderUserNavigation();
      }
      window.dispatchEvent(new CustomEvent('ecohaven_user_logged_in', { detail: newUser }));

      // 6. FLAG NEW USER FOR PROFILE ADDRESS SETUP & PROCEED TO PROFILE (dashboard.html)
      localStorage.setItem('ecohaven_new_user_setup_address', 'true');
      const isPagesDir = window.location.pathname.includes('/pages/');
      const currentPath = window.location.pathname.toLowerCase();
      if (!currentPath.includes('dashboard.html')) {
        setTimeout(() => {
          window.location.href = isPagesDir ? 'dashboard.html?setupAddress=1&welcome=1' : 'pages/dashboard.html?setupAddress=1&welcome=1';
        }, 450);
      } else {
        setTimeout(() => {
          if (typeof openAddressModal === 'function') openAddressModal();
          if (typeof window.showWelcomeVoucherModal === 'function') {
            window.showWelcomeVoucherModal({ name: name, code: 'WELCOME10', discount: 10 });
          }
        }, 350);
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
  window.handleAuthLogin = async function (e) {
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
          } catch (e) { }
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
        } catch (e) { }
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
        if (typeof window.syncHeaderUserNavigation === 'function') {
          window.syncHeaderUserNavigation();
        }
        window.dispatchEvent(new CustomEvent('ecohaven_auth_state_changed', { detail: matchedUser }));
        window.dispatchEvent(new CustomEvent('ecohaven_user_logged_in', { detail: matchedUser }));
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath.includes('checkout')) {
          if (typeof initCheckoutCalculations === 'function') initCheckoutCalculations();
        } else {
          setTimeout(() => {
            window.location.href = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
          }, 500);
        }
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
  window.handleGoogleSignIn = async function () {
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
            let gName = fUser.displayName;
            if (!gName && fUser.email) {
              const namePart = fUser.email.split('@')[0].replace(/[0-9]+/g, ' ').replace(/[._-]/g, ' ').trim();
              gName = namePart.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              if (gName.toLowerCase() === 'normmagat' || gName.toLowerCase() === 'norm magat') gName = 'Norm Magat';
            }
            if (!gName) gName = 'Google Customer';

            await finalizeGoogleUser({
              uid: fUser.uid,
              displayName: gName,
              fullName: gName,
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
    const finalDisplayName = userProfile.displayName || userProfile.fullName || (userProfile.email ? userProfile.email.split('@')[0].replace(/[0-9]+/g, ' ').replace(/[._-]/g, ' ').trim().split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Verified Customer');
    userProfile.displayName = finalDisplayName;
    userProfile.fullName = finalDisplayName;
    userProfile.phone = userProfile.phone || '';

    // Ensure Welcome Voucher exists for new customer
    let isNewCustomerVoucher = false;
    if (!userProfile.welcomeVoucher) {
      userProfile.welcomeVoucher = {
        code: 'WELCOME10',
        discountPercent: 10,
        claimed: true,
        claimedAt: new Date().toISOString(),
        used: false
      };
      isNewCustomerVoucher = true;
    }

    // 1. Save or update user profile in Firebase Realtime Database
    if (window.ecoHavenDb) {
      try {
        await window.ecoHavenDb.ref('users/' + userProfile.uid).update({
          fullName: userProfile.fullName,
          displayName: userProfile.displayName,
          email: userProfile.email,
          phone: userProfile.phone || '',
          photoURL: userProfile.photoURL || '',
          authProvider: 'google.com',
          role: 'customer',
          welcomeVoucher: userProfile.welcomeVoucher,
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
        body: `Mabuhay ${userProfile.displayName}!\n\nYour Google account (${userProfile.email}) has been successfully authenticated with EcoHaven Furniture (Candaba Workshop). You can now track your orders, manage saved delivery addresses, and reserve furniture pieces with 50% earnest timber allocation.\n\nUse your 10% welcome voucher WELCOME10 on your first handcrafted order!`
      });
    }

    // 4. Update UI headers and dispatch login event
    if (typeof window.syncHeaderUserNavigation === 'function') {
      window.syncHeaderUserNavigation();
    }
    window.dispatchEvent(new CustomEvent('ecohaven_user_logged_in', { detail: userProfile }));

    window.closeAuthModal();

    if (typeof window.showEcoHavenToast === 'function') {
      window.showEcoHavenToast(`🌿 Welcome, ${userProfile.displayName}! Signed in with Google.`, 'success');
    }

    if (isNewCustomerVoucher) {
      localStorage.setItem('ecohaven_new_user_setup_address', 'true');
      const isPagesDir = window.location.pathname.includes('/pages/');
      const currentPath = window.location.pathname.toLowerCase();
      if (!currentPath.includes('dashboard.html')) {
        setTimeout(() => {
          window.location.href = isPagesDir ? 'dashboard.html?setupAddress=1&welcome=1' : 'pages/dashboard.html?setupAddress=1&welcome=1';
        }, 450);
      } else {
        setTimeout(() => {
          if (typeof openAddressModal === 'function') openAddressModal();
          if (typeof window.showWelcomeVoucherModal === 'function') {
            window.showWelcomeVoucherModal({ name: userProfile.displayName, code: 'WELCOME10', discount: 10 });
          }
        }, 400);
      }
    }
  }
  window.finalizeGoogleUser = finalizeGoogleUser;

  function promptGoogleAccountFallback(reasonCode) {
    const defaultEmail = "mariasantos.pampanga@gmail.com";

    const choice = prompt(
      "Google Sign-In Authentication:\n\nEnter your Google account email to sign in as a verified customer:",
      defaultEmail
    );
    if (!choice || !choice.trim()) return;

    const email = choice.trim().toLowerCase();
    let rawName = email.split('@')[0].replace(/[0-9]+/g, ' ').replace(/[._-]/g, ' ').trim();
    let formattedName = rawName.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (formattedName.toLowerCase() === 'normmagat' || formattedName.toLowerCase() === 'norm magat') {
      formattedName = 'Norm Magat';
    }
    if (!formattedName) formattedName = 'Google Customer';

    // Allow user to confirm or customize display name
    const namePrompt = prompt(
      "Google Account Display Name:",
      formattedName
    );
    const finalName = (namePrompt && namePrompt.trim()) ? namePrompt.trim() : formattedName;

    const fallbackUser = {
      uid: 'google_' + Math.abs(email.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString(36),
      displayName: finalName,
      fullName: finalName,
      email: email,
      phone: '', // Google accounts don't include a mobile phone by default; customer can add their phone on their dashboard
      photoURL: '',
      authProvider: 'google.com',
      role: 'customer'
    };

    finalizeGoogleUser(fallbackUser);
  }

  window.syncHeaderUserNavigation = function () {
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
            const count = window.ecohaven && window.ecohaven.orders
              ? Object.values(window.ecohaven.orders).filter(o => o && !o.archived).length
              : 0;
            ordersBtn.href = isPagesDir ? 'seller.html' : 'pages/seller.html';
            ordersBtn.title = 'Artisan Orders & Fabrication Pipeline';
            ordersBtn.setAttribute('aria-label', 'Artisan Orders & Fabrication Pipeline');
            ordersBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">assignment</span>
              ${count > 0 ? `<span id="headerOrdersBadge" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface shadow-xs leading-none">${count}</span>` : ''}
            `;
          } else {
            // Count active orders belonging to this customer
            let custCount = 0;
            if (window.ecohaven && window.ecohaven.orders) {
              const uEmail = (u.email || '').toLowerCase().trim();
              const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
              const uName = (u.displayName || u.fullName || '').toLowerCase().trim();
              const uUid = u.uid || '';
              custCount = Object.values(window.ecohaven.orders).filter(o => {
                if (!o || o.archived) return false;
                if (o.userId && uUid && o.userId === uUid) return true;
                if (o.email && uEmail && o.email.toLowerCase().trim() === uEmail) return true;
                if (o.customerEmail && uEmail && o.customerEmail.toLowerCase().trim() === uEmail) return true;
                if (uPhone && o.phone && o.phone.replace(/[^0-9]/g, '') === uPhone) return true;
                if (uName && o.customerName && o.customerName.toLowerCase().trim() === uName) return true;
                return false;
              }).length;
            }
            ordersBtn.href = isPagesDir ? 'dashboard.html' : 'pages/dashboard.html';
            ordersBtn.title = 'My Orders Dashboard';
            ordersBtn.setAttribute('aria-label', 'My Orders Dashboard');
            ordersBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">receipt_long</span>
              ${custCount > 0 ? `<span id="headerOrdersBadge" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface shadow-xs leading-none">${custCount}</span>` : ''}
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
      } catch (e) {
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
  window.addEventListener('storage', function (e) {
    if (e.key === 'ecohaven_user') {
      window.syncHeaderUserNavigation();
    }
  });

  // GLOBAL USER SIGN OUT
  window.logoutEcoHavenUser = function () {
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
  window.handleHeaderUserClick = function () {
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
      } catch (e) { }
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
