import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyAf6eqoN3dh5YfhQYkUB1xlrVeXOOcL0GM",
  authDomain: "ragequit-meter.firebaseapp.com",
  databaseURL: "https://ragequit-meter-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ragequit-meter",
  storageBucket: "ragequit-meter.firebasestorage.app",
  messagingSenderId: "927846193524",
  appId: "1:927846193524:web:8596901261f475cea27421"
});

const db = getDatabase(app);
const svg = document.getElementById("gauge");
const label = document.getElementById("levelLabel");
const sound = document.getElementById("rageSound");

const colors = ["green", "limegreen", "yellow", "orange", "orangered", "red"];
const rageLabels = ["🧘 Chill", "⚠️ Warning", "😡 Mad", "🤬 Critical", "💀 Danger", "🚨 EVACUATE"];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M${cx},${cy} L${start.x},${start.y} A${r},${r} 0 ${largeArc},1 ${end.x},${end.y} Z`;
}

function drawMeter(level) {
  svg.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", describeArc(150, 150, 100, -90 + i * 30, -90 + (i + 1) * 30));
    path.setAttribute("fill", colors[i]);
    svg.appendChild(path);
  }

  const needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
  needle.setAttribute("x1", "150");
  needle.setAttribute("y1", "150");
  const pos = polarToCartesian(150, 150, 100, -95 + (level - 0.5) * 30);
  needle.setAttribute("x2", pos.x);
  needle.setAttribute("y2", pos.y);
  needle.setAttribute("stroke", "darkred");
  needle.setAttribute("stroke-width", "4");
  svg.appendChild(needle);
}

let lastLevel = null;
onValue(ref(db, "rageLevel"), snapshot => {
  const level = snapshot.val();
  if (level !== lastLevel) {
    sound.currentTime = 0;
    sound.play();
    lastLevel = level;
  }
  drawMeter(level);
  label.textContent = `Level ${level} – ${rageLabels[level - 1]}`;
});
