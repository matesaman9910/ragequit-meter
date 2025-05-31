import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Firebase Config
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
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// ✅ DOM references (after DOM ready!)
const loginBtn = document.getElementById("loginBtn");
const rageSlider = document.getElementById("rageSlider");
const levelText = document.getElementById("levelText");
const adminPanel = document.getElementById("adminPanel");

const rageLabels = [
  "🧘 Chill",
  "⚠️ Warning",
  "😡 Mad",
  "🤬 Critical",
  "💀 Danger",
  "🚨 EVACUATE"
];

// ✅ Button logic
loginBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      console.log("Signed in as", result.user.email);
    })
    .catch(error => {
      console.error("Login failed:", error.message);
      alert("Sign in failed: " + error.message);
    });
};

// ✅ Auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("✅ Authenticated as:", user.email);
    loginBtn.style.display = "none";
    rageSlider.disabled = false;
    adminPanel.style.display = "flex";
  } else {
    console.warn("❌ Not signed in");
    loginBtn.style.display = "block";
    rageSlider.disabled = true;
    adminPanel.style.display = "none";
  }
});

// ✅ Slider updates Firebase
rageSlider.oninput = () => {
  const level = parseInt(rageSlider.value);
  set(ref(db, "rageLevel"), level);
};

// ✅ Firebase updates slider + label
onValue(ref(db, "rageLevel"), snapshot => {
  const level = snapshot.val();
  if (level >= 1 && level <= 6) {
    rageSlider.value = level;
    levelText.textContent = `Level ${level} – ${rageLabels[level - 1]}`;
  }
});
