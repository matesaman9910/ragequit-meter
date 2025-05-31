import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
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

// DOM refs
const svg = document.getElementById("gauge");
const label = document.getElementById("levelLabel");
const soundBanner = document.getElementById("soundWarning");
const enableBtn = document.getElementById("enableSoundBtn");

const rageLabels = [
  "🧘 Chill", "⚠️ Warning", "😡 Mad",
  "🤬 Critical", "💀 Danger", "🚨 EVACUATE"
];
const colors = ["green", "limegreen", "yellow", "orange", "orangered", "red"];

// Sound
const alertSound = new Audio("https://file.garden/aACuwggY3QmuIi9B/DEFCON%20alarm%20sound%20effect..mp3");
alertSound.volume = 0.3;
let soundEnabled = false;

enableBtn.onclick = () => {
  alertSound.play().catch(() => {});
  soundEnabled = true;
  soundBanner.style.display = "none";
};

// Math
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M${cx},${cy} L${start.x},${start.y} A${r},${r} 0 ${largeArc},1 ${end.x},${end.y} Z`;
}

function drawMeter(level) {
  svg.innerHTML = "";

  // Background arcs
  for (let i = 0; i < 6; i++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const startAngle = -90 + i * 30;
    const endAngle = -90 + (i + 1) * 30;
    path.setAttribute("d", describeArc(150, 150, 75, startAngle, endAngle));
    path.setAttribute("fill", colors[i]);
    svg.appendChild(path);
  }

  // Needle
  const angle = -95 + (level - 0.5) * 30;
  const pos = polarToCartesian(150, 150, 75, angle);
  const needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
  needle.setAttribute("x1", "150");
  needle.setAttribute("y1", "150");
  needle.setAttribute("x2", pos.x);
  needle.setAttribute("y2", pos.y);
  needle.setAttribute("stroke", "#cc0000");
  needle.setAttribute("stroke-width", "4");
  needle.setAttribute("id", "needle");
  svg.appendChild(needle);
}

// Live Firebase sync
onValue(ref(db, "rageLevel"), snapshot => {
  const level = snapshot.val();
  if (level >= 1 && level <= 6) {
    drawMeter(level);
    label.textContent = `Level ${level} – ${rageLabels[level - 1]}`;
    if (soundEnabled) {
      alertSound.play().catch(() => {});
    }
  }
});
