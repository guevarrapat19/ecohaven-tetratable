// ============================================================================
// EcoHaven Furniture — Authentication UI Handler
// Handles login/signup forms and user interactions
// ============================================================================

// Login Form Handler
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
    Logging in...
  `;

  try {
    const result = await AuthService.login(email, password);
    
    if (result.success) {
      // Show success message
      showAlert('success', 'Welcome back!', 'Redirecting to your dashboard...');
      
      // Redirect based on role
      setTimeout(() => {
        if (result.user.role === 'seller') {
          window.location.href = 'pages/seller.html';
        } else {
          window.location.href = 'pages/dashboard.html';
        }
      }, 1500);
    } else {
      showAlert('error', 'Login Failed', result.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  } catch (error) {
    showAlert('error', 'Error', 'An unexpected error occurred. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Signup Form Handler
async function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const address = document.getElementById('signupAddress').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Validation
  if (password !== confirmPassword) {
    showAlert('error', 'Password Mismatch', 'Passwords do not match. Please try again.');
    return;
  }

  if (password.length < 6) {
    showAlert('error', 'Weak Password', 'Password must be at least 6 characters long.');
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
    Creating account...
  `;

  try {
    const result = await AuthService.register(email, password, {
      name,
      phone,
      address,
      role: 'customer'
    });
    
    if (result.success) {
      // Show success message with mock notifications
      showAlert('success', 'Account Created!', result.message);
      
      // Clear form
      event.target.reset();
      
      // Auto-login after 2 seconds
      setTimeout(() => {
        window.location.href = 'pages/dashboard.html';
      }, 2000);
    } else {
      showAlert('error', 'Registration Failed', result.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  } catch (error) {
    showAlert('error', 'Error', 'An unexpected error occurred. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Logout Handler
async function handleLogout() {
  const confirmed = confirm('Are you sure you want to logout?');
  if (!confirmed) return;

  const result = await AuthService.logout();
  
  if (result.success) {
    showAlert('success', 'Logged Out', 'You have been successfully logged out.');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  }
}

// Password Reset Handler
async function handlePasswordReset() {
  const email = prompt('Enter your email address to reset password:');
  
  if (!email) return;

  const result = await AuthService.resetPassword(email);
  
  if (result.success) {
    showAlert('success', 'Reset Email Sent', result.message);
  } else {
    showAlert('error', 'Reset Failed', result.message);
  }
}

// Header User Button Click Handler
function handleHeaderUserClick() {
  const user = AuthService.getCurrentUser();
  
  if (user) {
    // User is logged in - show account menu
    showAccountMenu(user);
  } else {
    // User is not logged in - show login modal
    showLoginModal();
  }
}

// Show Account Menu (Dropdown)
function showAccountMenu(user) {
  const existingMenu = document.getElementById('accountMenuDropdown');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.id = 'accountMenuDropdown';
  menu.className = 'fixed top-24 right-4 z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden';
  
  menu.innerHTML = `
    <div class="p-4 bg-gradient-to-br from-primary to-primary-container text-white">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm truncate">${user.name}</p>
          <p class="text-xs text-white/80 truncate">${user.email}</p>
          <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-medium uppercase">
            ${user.role}
          </span>
        </div>
      </div>
    </div>
    
    <div class="p-2">
      ${user.role === 'customer' ? `
        <a href="pages/dashboard.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
          <span class="material-symbols-outlined text-[20px] text-gray-600">receipt_long</span>
          <span class="text-sm font-medium text-gray-700">My Orders</span>
        </a>
      ` : ''}
      
      ${user.role === 'seller' ? `
        <a href="pages/seller.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
          <span class="material-symbols-outlined text-[20px] text-gray-600">dashboard</span>
          <span class="text-sm font-medium text-gray-700">Seller Dashboard</span>
        </a>
      ` : ''}
      
      <button onclick="handlePasswordReset()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
        <span class="material-symbols-outlined text-[20px] text-gray-600">lock_reset</span>
        <span class="text-sm font-medium text-gray-700">Reset Password</span>
      </button>
      
      <div class="my-2 border-t border-gray-200"></div>
      
      <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors">
        <span class="material-symbols-outlined text-[20px] text-red-600">logout</span>
        <span class="text-sm font-medium text-red-600">Logout</span>
      </button>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target.id !== 'headerUserBtn') {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

// Show Login Modal
function showLoginModal() {
  const existingModal = document.getElementById('authModal');
  if (existingModal) {
    existingModal.remove();
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';
  
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-headline text-2xl font-bold text-on-surface">Welcome to EcoHaven</h2>
          <button onclick="document.getElementById('authModal').remove()" class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <!-- Tab Buttons -->
        <div class="flex gap-2 mb-6">
          <button onclick="switchAuthTab('login')" id="loginTab" class="flex-1 py-2 rounded-lg font-semibold text-sm bg-primary text-white">
            Login
          </button>
          <button onclick="switchAuthTab('signup')" id="signupTab" class="flex-1 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-gray-600">
            Sign Up
          </button>
        </div>
        
        <!-- Login Form -->
        <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" id="loginEmail" required 
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Email Address">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="loginPassword" required
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Password">
          </div>
          
          <button type="button" onclick="handlePasswordReset()" class="text-sm text-primary hover:underline font-medium">
            Forgot password?
          </button>
          
          <button type="submit" class="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-container transition-all">
            Login
          </button>

          <p class="text-center text-xs text-gray-500">
            By signing in, you agree to our <a href="/pages/legal.html#terms" target="_blank" class="text-primary font-semibold underline">Terms &amp; Conditions</a> and <a href="/pages/legal.html#privacy" target="_blank" class="text-primary font-semibold underline">Privacy Policy</a>.
          </p>
        </form>
        
        <!-- Signup Form -->
        <form id="signupForm" onsubmit="handleSignup(event)" class="space-y-4 hidden">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" id="signupName" required
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Full Name">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" id="signupEmail" required
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Email Address">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" id="signupPhone" required inputmode="numeric" maxlength="11"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
              placeholder="Mobile Number">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <textarea id="signupAddress" required rows="2"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Delivery Address"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="signupPassword" required minlength="6"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Password (at least 6 characters)">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" id="signupConfirmPassword" required minlength="6"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Confirm Password">
          </div>

          <label for="signupAgreeTerms" class="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" id="signupAgreeTerms" required class="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary">
            <span>I agree to the <a href="/pages/legal.html#terms" target="_blank" class="text-primary font-semibold underline">Terms &amp; Conditions</a>, <a href="/pages/legal.html#privacy" target="_blank" class="text-primary font-semibold underline">Privacy Policy (RA 10173)</a>, and <a href="/pages/legal.html#returns" target="_blank" class="text-primary font-semibold underline">Return Policy</a>.</span>
          </label>
          
          <button type="submit" class="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-container transition-all">
            Create Account
          </button>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  
  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTab.className = 'flex-1 py-2 rounded-lg font-semibold text-sm bg-primary text-white';
    signupTab.className = 'flex-1 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-gray-600';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    loginTab.className = 'flex-1 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-gray-600';
    signupTab.className = 'flex-1 py-2 rounded-lg font-semibold text-sm bg-primary text-white';
  }
}

// Show Alert Toast
function showAlert(type, title, message) {
  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500'
  };
  
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
  
  const toast = document.createElement('div');
  toast.className = 'fixed top-24 right-4 z-[9999] max-w-sm bg-white rounded-xl shadow-2xl border-l-4 ' + bgColors[type] + ' p-4 transform transition-all duration-500';
  
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined text-2xl ${type === 'success' ? 'text-emerald-500' : type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-amber-500' : 'text-blue-500'}">
        ${icons[type]}
      </span>
      <div class="flex-1">
        <p class="font-bold text-sm text-gray-900">${title}</p>
        <p class="text-xs text-gray-600 mt-1">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

// Export globally
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.handlePasswordReset = handlePasswordReset;
window.handleHeaderUserClick = handleHeaderUserClick;
window.switchAuthTab = switchAuthTab;
window.showAlert = showAlert;
