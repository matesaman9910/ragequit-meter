import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAf6eqoN3dh5YfhQYkUB1xlrVeXOOcL0GM",
  authDomain: "ragequit-meter.firebaseapp.com",
  databaseURL: "https://ragequit-meter-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ragequit-meter",
  storageBucket: "ragequit-meter.appspot.com",
  messagingSenderId: "927846193524",
  appId: "1:927846193524:web:8596901261f475cea27421"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ DOM references
const loginBtn = document.getElementById("loginBtn");
const rageSlider = document.getElementById("rageSlider");
const levelText = document.getElementById("levelText");
const adminPanel = document.getElementById("adminPanel");

// ⏳ Level labels
const rageLabels = [
  "🧘 Chill",
  "⚠️ Warning",
  "😡 Mad",
  "🤬 Critical",
  "💀 Danger",
  "🚨 EVACUATE"
];

// ✅ Sign-in handler
loginBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      console.log("✅ Signed in as:", result.user.email);
    })
    .catch(err => {
      console.error("❌ Login error:", err.message);
    });
};

// ✅ Auth listener
onAuthStateChanged(auth, user => {
  if (user) {
    loginBtn.style.display = "none";
    adminPanel.style.display = "block";
    rageSlider.disabled = false;
  } else {
    loginBtn.style.display = "inline-block";
    adminPanel.style.display = "none";
    rageSlider.disabled = true;
  }
});

// ✅ Update Firebase when slider changes
rageSlider.addEventListener("input", () => {
  const level = parseInt(rageSlider.value);
  set(ref(db, "rageLevel"), level);
});

// ✅ Sync from Firebase
onValue(ref(db, "rageLevel"), snapshot => {
  const level = snapshot.val();
  if (level >= 1 && level <= 6) {
    rageSlider.value = level;
    levelText.textContent = `Level ${level} – ${rageLabels[level - 1]}`;
  } else {
    levelText.textContent = "⚠️ Invalid level";
  }
});

// ✅ Logout handler (after DOM ready)
window.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      signOut(auth).then(() => {
        console.log("🔒 Signed out");
        location.reload();
      });
    };
  }
});
