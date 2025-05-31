import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAf6eqoN3dh5YfhQYkUB1xlrVeXOOcL0GM",
  authDomain: "ragequit-meter.firebaseapp.com",
  databaseURL: "https://ragequit-meter-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ragequit-meter",
  storageBucket: "ragequit-meter.firebasestorage.app",
  messagingSenderId: "927846193524",
  appId: "1:927846193524:web:8596901261f475cea27421"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const rageSlider = document.getElementById("rageSlider");
const levelText = document.getElementById("levelText");

// Rage level labels
const rageLabels = [
  "🧘 Chill",
  "⚠️ Warning",
  "😡 Mad",
  "🤬 Critical",
  "💀 Danger",
  "🚨 EVACUATE"
];

// 🔐 Sign in
loginBtn.onclick = () => {
  signInWithPopup(auth, provider).catch(err => {
    alert("Login failed: " + err.message);
  });
};

// ✅ Auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    loginBtn.style.display = "none";
    rageSlider.disabled = false;
    document.getElementById("adminPanel").style.display = "flex";
  } else {
    loginBtn.style.display = "block";
    rageSlider.disabled = true;
    document.getElementById("adminPanel").style.display = "none";
  }
});

// 🔁 Update Firebase on slider input
rageSlider.oninput = () => {
  const level = parseInt(rageSlider.value);
  set(ref(db, "rageLevel"), level);
};

// 🔁 Sync Firebase to UI
onValue(ref(db, "rageLevel"), snapshot => {
  const level = snapshot.val();
  if (level >= 1 && level <= 6) {
    rageSlider.value = level;
    levelText.textContent = `Level ${level} – ${rageLabels[level - 1]}`;
  }
});
