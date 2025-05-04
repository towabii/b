let userLat = null;
let userLon = null;
let map = null;
let pWaveCircle = null;
let sWaveCircle = null;
let tsunamiAlert = false;

navigator.geolocation.getCurrentPosition(pos => {
  userLat = pos.coords.latitude;
  userLon = pos.coords.longitude;
  map = L.map("map").setView([userLat, userLon], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
  L.marker([userLat, userLon]).addTo(map).bindPopup("現在地");
});

let shakeHistory = [];
window.addEventListener("devicemotion", e => {
  const acc = e.accelerationIncludingGravity;
  if (!acc) return;
  const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
  shakeHistory.push({ time: Date.now(), magnitude });
  shakeHistory = shakeHistory.filter(d => Date.now() - d.time < 3000);

  const avg = shakeHistory.reduce((a, b) => a + b.magnitude, 0) / shakeHistory.length;
  let shindo = convertToShindo(avg);

  if (avg > 12) detectQuake(shindo);
  updateShindo(shindo);
});

function updateShindo(level) {
  const panel = document.getElementById("panel-shindo");
  const panelMeteorological = document.getElementById("panel-shindo-meteorological");
  
  let shindoText = `震度（加速度）：${level}`;
  let meteorologicalShindoText = `震度（気象庁）：${convertToMeteorologicalShindo(level)}`;

  if (level === 6) {
    shindoText += "強";
  } else if (level === 5) {
    shindoText += "+";
  } else if (level > 5) {
    shindoText += "強";
  }
  
  panel.textContent = shindoText;
  panel.style.backgroundColor = getColor(level);
  panelMeteorological.textContent = meteorologicalShindoText;
}

function convertToShindo(gal) {
  // gal -> 震度変換
  if (gal < 1) return 0;
  if (gal < 3) return 1;
  if (gal < 5) return 2;
  if (gal < 8) return 3;
  if (gal < 12) return 4;
  if (gal < 18) return 5;
  if (gal < 30) return 6;
  return 7;
}

function convertToMeteorologicalShindo(gal) {
  // 気象庁の震度に変換
  if (gal < 1) return 0;
  if (gal < 4) return 1;
  if (gal < 6) return 2;
  if (gal < 8) return 3;
  if (gal < 10) return 4;
  if (gal < 12) return 5;
  if (gal < 15) return 6;
  return 7;
}

function getColor(level) {
  if (level >= 7) return "purple";
  if (level >= 6) return "red";
  if (level >= 4) return "yellow";
  return "lightgreen";
}

function detectQuake(level) {
  console.log("地震検出:", level);
  if (level >= 4) {
    tsunamiAlert = true;
    document.getElementById("panel-tsunami").textContent = "津波警報: 発生";
    // 津波エリアを色塗り
    drawTsunamiArea(level);
  }
}

function drawTsunamiArea(shindo) {
  // 津波エリアを色塗り
  const tsunamiArea = L.polygon([
    [userLat - 0.5, userLon - 0.5], // 仮の範囲
    [userLat - 0.5, userLon + 0.5],
    [userLat + 0.5, userLon + 0.5],
    [userLat + 0.5, userLon - 0.5]
  ], { color: getTsunamiColor(shindo) }).addTo(map);
}

function getTsunamiColor(shindo) {
  if (shindo >= 6) return "purple";
  if (shindo >= 5) return "red";
  if (shindo >= 4) return "yellow";
  return "green";
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function startWaveCountdown(epiLat, epiLon) {
  const dist = calculateDistanceKm(userLat, userLon, epiLat, epiLon);
  const pTime = Math.floor(dist / 7); // P波の速度は7km/s
  const sTime = Math.floor(dist / 3.5); // S波の速度は3.5km/s
  let t = 0;
  const interval = setInterval(() => {
    const pRemain = Math.max(pTime - t, 0);
    const sRemain = Math.max(sTime - t, 0);
    document.getElementById("panel-timer").textContent = `P波: ${pRemain}s / S波: ${sRemain}s`;
    t++;
    if (pRemain === 0 && sRemain === 0) clearInterval(interval);
  }, 1000);
}

document.getElementById("testButton").addEventListener("click", () => {
  console.log("テスト地震発生！");
  startWaveCountdown(24.4433, 123.6989); // 琉球トラフの位置に設定
});
