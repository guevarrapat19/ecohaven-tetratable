// EcoHaven Furniture — Firebase Realtime Database & Auth SDK Configuration
// Official Cloud Backend for EcoHaven Furniture (Candaba, Pampanga, Philippines)

// Your Live Firebase Web App Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFFqEn2_7HaqmSZyw3d3cunhlu071ybU4",
  authDomain: "ecohavenfurniture-d0114.firebaseapp.com",
  databaseURL: "https://ecohavenfurniture-d0114-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecohavenfurniture-d0114",
  storageBucket: "ecohavenfurniture-d0114.firebasestorage.app",
  messagingSenderId: "701744776250",
  appId: "1:701744776250:web:980ad4061de547e8702103",
  measurementId: "G-1B7V23ZKPK"
};

// Singleton Initialization with CDN & Graceful LocalStorage Fallback
let ecoHavenDb = null;
let ecoHavenAuth = null;

try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        ecoHavenDb = firebase.database();
        console.log("🟢 EcoHaven: Connected to LIVE Firebase Cloud Realtime Database!");
        console.log("📡 Endpoint:", firebaseConfig.databaseURL);

        if (typeof firebase.auth === 'function') {
            try {
                ecoHavenAuth = firebase.auth();
                console.log("🟢 EcoHaven: Connected to LIVE Firebase Auth SDK!");
            } catch (authErr) {
                console.warn("🟡 EcoHaven: Firebase Auth init notice:", authErr.message);
            }
        }
    } else {
        console.warn("🟡 EcoHaven: Firebase SDK not detected. Operating in LocalStorage Fallback Mode.");
    }
} catch (error) {
    console.warn("🟡 EcoHaven: Firebase initialization error, using LocalStorage fallback:", error.message);
}

window.ecoHavenDb = ecoHavenDb;
window.ecoHavenAuth = ecoHavenAuth;
window.firebaseConfig = firebaseConfig;
