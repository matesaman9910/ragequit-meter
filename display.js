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

// Rage level data
const rageLabels = [
  "🧘 Chill", "⚠️ Warning", "😡 Mad",
  "🤬 Critical", "💀 Danger", "🚨 EVACUATE"
];
const colors = ["green", "limegreen", "yellow", "orange", "orangered", "red"];

// Sound setup
const baseAlert = new Audio("https://file.garden/aACuwggY3QmuIi9B/DEFCON%20alarm%20sound%20effect..mp3");
baseAlert.volume = 0.3;

const evacSounds = [
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Klaxon%20alarm%20sound%20used%20in%20many%20films%20from%20the%2060's%20-%2070's%20Vol%205%20(Cinesound).mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Warning%20Signal%20Alarm%20with%20Rapid%20Rhythmic%20Buzzing%20Tones.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Boat%20Alarm%20Alert.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Electronic%20Alarm%20sounds%20used%20in%20films%20from%20the%2070's%20-%2080's%20Vol%201%20(Cinesound).mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Intruder%20Alarm%20Sound%20Effect.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Klaxon%20Alarm%20Sound.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Papers%20Please%20Alarm%20Sound%20Effect.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Cool%20alarm%20sound%20and%20screen.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Black%20Mesa%20%F0%9F%9A%A8Rocket%20Engine%20Alarm%20Sound%20Effect%F0%9F%9A%A8.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Black%20Mesa%20%F0%9F%9A%A8Lambda%20Main%20Reactor%20Core%20Alarm%20Sound%20Effect%F0%9F%9A%A8.mp3",
  "https://file.garden/aACuwggY3QmuIi9B/Alarms/Black%20Mesa%20%F0%9F%9A%A8Emergency%20Tesla%20Discharge%20Alarm%20Sound%20Effect%F0%9F%9A%A8.mp3"
];

let evacAudioElements = evacSounds.map(url => {
  const audio = new Audio(url);
  audio.volume = 0.3;
  return audio;
});

let soundEnabled = false;
if (sessionStorage.getItem("soundEnabled")) {
  soundEnabled = true;
  soundBanner.style.display = "none";
}

enableBtn.onclick = () => {
  soundEnabled = true;
  soundBanner.style.display = "none";
  sessionStorage.setItem("soundEnabled", "true");
};

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

  for (let i = 0; i < 6; i++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const startAngle = -90 + i * 30;
    const endAngle = -90 + (i + 1) * 30;
    path.setAttribute("d", describeArc(150, 150, 75, startAngle, endAngle));
    path.setAttribute("fill", colors[i]);
    svg.appendChild(path);
  }

  const angle = -95 + (level - 0.5) * 30;
  const pos = polarToCartesian(150, 150, 75, angle);
  const needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
  needle.setAttribute("x1", "150");
  needle.setAttribute("y1", "150");
  needle.setAttribute("x2", pos.x);
  needle.setAttribute("y2", pos.y);
  needle.setAttribute("stroke", "#cc0000");
  needle.setAttribute("stroke-width", "4");
  svg.appendChild(needle);
}

let lastLevel = null;
let flashInterval = null;

function stopEvacMode() {
  document.body.classList.remove("evacuate");
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = null;
  }
  evacAudioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

onValue(ref(db, "rageLevel"), snapshot => {
  const level = snapshot.val();
  if (level >= 1 && level <= 6) {
    drawMeter(level);
    label.textContent = `Level ${level} – ${rageLabels[level - 1]}`;

    if (soundEnabled && level !== lastLevel) {
      if (level === 6) {
        // Activate evac mode
        document.body.classList.add("evacuate");
        evacAudioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
          audio.play().catch(() => {});
        });
        if (!flashInterval) {
          flashInterval = setInterval(() => {
            document.body.classList.toggle("evacuate-flash");
          }, 500);
        }
      } else {
        stopEvacMode();
        baseAlert.pause();
        baseAlert.currentTime = 0;
        baseAlert.play().catch(() => {});
      }
    }

    if (lastLevel === 6 && level !== 6) {
      stopEvacMode();
    }

    lastLevel = level;
  } else {
    label.textContent = "⚠️ Invalid level";
  }
});
