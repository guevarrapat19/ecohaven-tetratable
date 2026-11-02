// ============================================================================
// EcoHaven Furniture — Firebase Authentication Module
// Secure authentication with Firebase Auth SDK + Mock Notification System
// ============================================================================

// Mock Notification System (Simulated Email/SMS)
const NotificationService = {
  // Simulate sending email (shows UI notification, doesn't actually send)
  sendEmail(to, subject, body, orderId) {
    console.log('📧 [MOCK EMAIL SENT]', { to, subject, body });
    if (typeof window.simulateEmailNotification === 'function') {
      window.simulateEmailNotification({ to, subject, body, orderId });
    } else {
      this.showNotification('email', `Email sent to ${to}`, subject);
    }
    return Promise.resolve({ success: true, mockEmail: true });
  },

  // Simulate sending SMS (shows UI notification, doesn't actually send)
  sendSMS(phone, message, orderId) {
    console.log('📱 [MOCK SMS SENT]', { phone, message });
    if (typeof window.simulateSmsNotification === 'function') {
      window.simulateSmsNotification({ to: phone, message, orderId });
    } else {
      this.showNotification('sms', `SMS sent to ${phone}`, message);
    }
    return Promise.resolve({ success: true, mockSMS: true });
  },

  // Show toast notification
  showNotification(type, title, message) {
    const icon = type === 'email' ? '📧' : '📱';
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-4 z-[9999] max-w-sm bg-white rounded-xl shadow-2xl border-2 border-emerald-500 p-4 transform transition-all duration-500 translate-x-0 opacity-100';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
          ${icon}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm text-gray-900">${title}</p>
          <p class="text-xs text-gray-600 mt-1 truncate">${message}</p>
          <p class="text-[10px] text-emerald-600 font-medium mt-1">✓ Simulated notification (demo mode)</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    `;
    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  }
};

// Authentication Service
const AuthService = {
  
  // Initialize Firebase Auth
  init() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.error('❌ Firebase Auth SDK not loaded');
      return false;
    }
    console.log('✅ Firebase Auth initialized');
    this.setupAuthStateListener();
    return true;
  },

  // Listen for authentication state changes
  setupAuthStateListener() {
    firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch full profile from database
        try {
          const userRef = window.ecoHavenDb.ref(`ecohaven/users/${firebaseUser.uid}`);
          const snapshot = await userRef.once('value');
          const userData = snapshot.val();
          
          if (userData) {
            const currentUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...userData
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('ecohaven_user', JSON.stringify(currentUser));
            localStorage.setItem('ecohaven_uid', currentUser.uid);
            if (typeof window.syncHeaderUserNavigation === 'function') window.syncHeaderUserNavigation();
            this.updateUIForLoggedInUser(currentUser);
            console.log('✅ User authenticated:', currentUser.email);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // User is signed out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('ecohaven_user');
        localStorage.removeItem('ecohaven_uid');
        if (typeof window.syncHeaderUserNavigation === 'function') window.syncHeaderUserNavigation();
        this.updateUIForLoggedOutUser();
        console.log('👋 User signed out');
      }
    });
  },

  // Register new user
  async register(email, password, userData) {
    try {
      // Create Firebase Auth user
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Send mock verification email
      await NotificationService.sendEmail(
        email,
        'Welcome to EcoHaven Furniture! Verify your email',
        `Hi ${userData.name}, click the link to verify your account.`
      );

      // Send mock welcome SMS
      if (userData.phone) {
        await NotificationService.sendSMS(
          userData.phone,
          `Welcome to EcoHaven Furniture! Your account has been created.`
        );
      }

      // Store user profile in Realtime Database
      await window.ecoHavenDb.ref(`ecohaven/users/${user.uid}`).set({
        name: userData.name,
        email: email,
        phone: userData.phone || '',
        address: userData.address || '',
        role: userData.role || 'customer',
        createdAt: new Date().toISOString(),
        emailVerified: false
      });

      console.log('✅ User registered successfully:', email);
      
      return {
        success: true,
        user: user,
        message: 'Account created! Check your email for verification.'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Fetch user data from database
      const userRef = window.ecoHavenDb.ref(`ecohaven/users/${user.uid}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (!userData) {
        throw new Error('User profile not found');
      }

      console.log('✅ User logged in successfully:', email);

      // Send mock login notification SMS
      if (userData.phone) {
        await NotificationService.sendSMS(
          userData.phone,
          `EcoHaven: New login detected from your account at ${new Date().toLocaleString()}`
        );
      }

      return {
        success: true,
        user: { ...userData, uid: user.uid, emailVerified: user.emailVerified },
        message: 'Login successful!'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  },

  // Logout user
  async logout() {
    try {
      await firebase.auth().signOut();
      localStorage.removeItem('currentUser');
        localStorage.removeItem('ecohaven_user');
        localStorage.removeItem('ecohaven_uid');
        if (typeof window.syncHeaderUserNavigation === 'function') window.syncHeaderUserNavigation();
      console.log('✅ User logged out');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email (mock)
  async resetPassword(email) {
    try {
      // Check if user exists
      const usersRef = window.ecoHavenDb.ref('ecohaven/users');
      const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
      
      if (!snapshot.exists()) {
        return {
          success: false,
          message: 'No account found with this email address.'
        };
      }

      // Send mock password reset email
      await NotificationService.sendEmail(
        email,
        'EcoHaven Furniture - Password Reset Request',
        'Click the link below to reset your password. This link expires in 1 hour.'
      );

      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Failed to send reset email. Please try again.'
      };
    }
  },

  // Get current user
  getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  // Update UI for logged in user
  updateUIForLoggedInUser(user) {
    // Update header user button
    const userBtn = document.getElementById('headerUserBtn');
    if (userBtn) {
      userBtn.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          ${user.name.charAt(0).toUpperCase()}
        </div>
      `;
    }

    // Show orders button for customers
    if (user.role === 'customer') {
      const ordersBtn = document.getElementById('headerOrdersBtn');
      if (ordersBtn) ordersBtn.classList.remove('hidden');
    }

    // Show inventory button for sellers
    if (user.role === 'seller') {
      const inventoryBtn = document.getElementById('headerInventoryBtn');
      if (inventoryBtn) inventoryBtn.classList.remove('hidden');
    }

    // Hide login/signup forms, show account content
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
  },

  // Update UI for logged out user
  updateUIForLoggedOutUser() {
    // Reset header user button
    const userBtn = document.getElementById('headerUserBtn');
    if (userBtn) {
      userBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">person</span>`;
    }

    // Hide role-specific buttons
    const ordersBtn = document.getElementById('headerOrdersBtn');
    const inventoryBtn = document.getElementById('headerInventoryBtn');
    if (ordersBtn) ordersBtn.classList.add('hidden');
    if (inventoryBtn) inventoryBtn.classList.add('hidden');
  },

  // Get user-friendly error message
  getErrorMessage(errorCode) {
    const messages = {
      'auth/email-already-in-use': 'This email is already registered. Please login instead.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/weak-password': 'Password must be at least 6 characters long.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your internet connection.'
    };
    return messages[errorCode] || 'An error occurred. Please try again.';
  }
};

// Order Notification Service
const OrderNotificationService = {
  
  // Notify customer about order status change
  async notifyOrderStatusChange(order, newStatus) {
    const customerRef = window.ecoHavenDb.ref(`ecohaven/users/${order.customerId}`);
    const snapshot = await customerRef.once('value');
    const customer = snapshot.val();

    if (!customer) return;

    const statusMessages = {
      'pending_payment': 'Your order is waiting for payment confirmation.',
      'payment_confirmed': 'Payment confirmed! We are preparing your order.',
      'in_production': 'Your TetraTable is being crafted by our artisans.',
      'quality_check': 'Your order is undergoing quality inspection.',
      'ready_for_delivery': 'Your order is ready for delivery!',
      'out_for_delivery': 'Your order is on the way!',
      'delivered': 'Order delivered! Thank you for choosing EcoHaven.',
      'cancelled': 'Your order has been cancelled.'
    };

    const message = statusMessages[newStatus] || 'Your order status has been updated.';

    // Send mock email notification
    await NotificationService.sendEmail(
      customer.email,
      `EcoHaven Order Update - ${order.orderId}`,
      `${message}\n\nOrder ID: ${order.orderId}\nTotal: ₱${order.total.toLocaleString()}`
    );

    // Send mock SMS notification
    if (customer.phone) {
      await NotificationService.sendSMS(
        customer.phone,
        `EcoHaven: ${message} Track: ${order.orderId}`
      );
    }

    console.log('📬 Order notification sent to customer:', customer.email);
  },

  // Notify seller about new order
  async notifyNewOrder(order) {
    // Get all seller accounts
    const usersRef = window.ecoHavenDb.ref('ecohaven/users');
    const snapshot = await usersRef.orderByChild('role').equalTo('seller').once('value');
    
    if (!snapshot.exists()) return;

    snapshot.forEach((child) => {
      const seller = child.val();
      
      // Send mock email to seller
      NotificationService.sendEmail(
        seller.email,
        `New Order Received - ${order.orderId}`,
        `New order from ${order.customerInfo.name}\nTotal: ₱${order.total.toLocaleString()}\nItems: ${order.items.length}`
      );

      // Send mock SMS to seller
      if (seller.phone) {
        NotificationService.sendSMS(
          seller.phone,
          `New order ₱${order.total.toLocaleString()} - ${order.orderId}. Check dashboard.`
        );
      }
    });

    console.log('📬 New order notification sent to sellers');
  },

  // Notify customer about payment confirmation
  async notifyPaymentConfirmed(order) {
    const customerRef = window.ecoHavenDb.ref(`ecohaven/users/${order.customerId}`);
    const snapshot = await customerRef.once('value');
    const customer = snapshot.val();

    if (!customer) return;

    await NotificationService.sendEmail(
      customer.email,
      'Payment Confirmed - EcoHaven Furniture',
      `Your payment of ₱${order.total.toLocaleString()} has been confirmed!\n\nWe will start crafting your order immediately.`
    );

    if (customer.phone) {
      await NotificationService.sendSMS(
        customer.phone,
        `EcoHaven: Payment confirmed! Your TetraTable is now in production. Order: ${order.orderId}`
      );
    }
  }
};

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AuthService.init());
} else {
  AuthService.init();
}

// Export services globally
window.AuthService = AuthService;
window.NotificationService = NotificationService;
window.OrderNotificationService = OrderNotificationService;
