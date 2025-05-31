import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAf6eqoN3dh5YfhQYkUB1xlrVeXOOcL0GM",
  authDomain: "ragequit-meter.firebaseapp.com",
  databaseURL: "https://ragequit-meter-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ragequit-meter",
  storageBucket: "ragequit-meter.appspot.com",
  messagingSenderId: "927846193524",
  appId: "1:927846193524:web:8596901261f475cea27421"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Elements
const loginBtn = document.getElementById("loginBtn");
const meter = document.getElementById("gauge");
const slider = document.getElementById("rageSlider");
const levelText = document.getElementById("levelText");
const currentStatus = document.getElementById("currentStatus");

const rageLabels = [
  "🧘 Chill",
  "⚠️ Warning",
  "😡 Mad",
  "🤬 Critical",
  "💀 Danger",
  "🚨 EVACUATE"
];

// Sound
const alertSound = new Audio("https://file.garden/aACuwggY3QmuIi9B/DEFCON%20alarm%20sound%20effect..mp3");
alertSound.volume = 0.3; // Reduced volume

// Auth
loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(result => console.log("Logged in:", result.user.displayName))
    .catch(error => console.error("Auth error:", error));
});

// Show UI on auth
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("adminPanel").style.display = "block";
  }
});

// Slider -> DB
slider.addEventListener("input", () => {
  const level = parseInt(slider.value);
  set(ref(db, "/level"), level);
  alertSound.play().catch(() => {}); // Attempt to play, may fail silently until user interacts
});

// DB -> UI update
onValue(ref(db, "/level"), snapshot => {
  const level = snapshot.val();
  if (!level) return;

  const angle = -95 + (level - 0.5) * 30;
  const r = 75;
  const cx = 150, cy = 150;
  const x = cx + r * Math.cos((angle - 90) * Math.PI / 180);
  const y = cy + r * Math.sin((angle - 90) * Math.PI / 180);

  const needle = document.getElementById("needle");
  if (needle) {
    needle.setAttribute("x2", x);
    needle.setAttribute("y2", y);
  }

  levelText.textContent = `Level ${level} – ${rageLabels[level - 1]}`;
  currentStatus.textContent = `Current: Level ${level} – ${rageLabels[level - 1]}`;
});
