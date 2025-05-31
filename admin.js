import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAf6eqoN3dh5YfhQYkUB1xlrVeXOOcL0GM",
  authDomain: "ragequit-meter.firebaseapp.com",
  databaseURL: "https://ragequit-meter-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ragequit-meter",
  storageBucket: "ragequit-meter.firebasestorage.app",
  messagingSenderId: "927846193524",
  appId: "1:927846193524:web:8596901261f475cea27421"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ UI references
const signInBtn = document.getElementById("signIn");
const signOutBtn = document.getElementById("signOut");
const userLabel = document.getElementById("user");
const slider = document.getElementById("rageSlider");
const rageValue = document.getElementById("rageValue");
const rageLabel = document.getElementById("rageLabel");

// ✅ Rage level labels
const rageLabels = [
  "🧘 Chill",
  "⚠️ Warning",
  "😡 Mad",
  "🤬 Critical",
  "💀 Danger",
  "🚨 EVACUATE"
];

// ✅ Sign in with Google
signInBtn.onclick = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).catch(err => {
    alert("Sign in failed: " + err.message);
  });
};

// ✅ Sign out
signOutBtn.onclick = () => signOut(auth);

// ✅ Auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    userLabel.textContent = `Signed in as ${user.displayName}`;
    signInBtn.style.display = "none";
    signOutBtn.style.display = "inline";
    slider.disabled = false;
  } else {
    userLabel.textContent = "Not signed in";
    signInBtn.style.display = "inline";
    signOutBtn.style.display = "none";
    slider.disabled = true;
  }
});

// ✅ Slider input event
slider.oninput = () => {
  const level = parseInt(slider.value);
  rageValue.textContent = level;
  rageLabel.textContent = rageLabels[level - 1];
  set(ref(db, "rageLevel"), level);
};
