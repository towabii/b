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
  let shindoText = `気象庁震度：${level}`;
  let mobileShindo = convertToShindo(level);
  shindoText += ` / 実際の震度：${mobileShindo}`;
  if (mobileShindo === 6) {
    shindoText += "強";
  } else if (mobileShindo === 5) {
    shindoText += "+";
  } else if (mobileShindo > 5) {
    shindoText += "強";
  }
  panel.textContent = shindoText;
  panel.style.backgroundColor = getColor(level);
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
  const pTime = Math.floor(dist / 7);  // P波の速度7km/s
  const sTime = Math.floor(dist / 4);  // S波の速度3~4km/s
  let t = 0;
  const interval = setInterval(() => {
    const pRemain = Math.max(pTime - t, 0);
    const sRemain = Math.max(sTime - t, 0);
    document.getElementById("panel-timer").textContent = `P波: ${pRemain}s / S波: ${sRemain}s`;
    if (pRemain === 0 && sRemain === 0) clearInterval(interval);
    t++;
  }, 1000);
}

function showEpicenterAndWaves(epiLat, epiLon) {
  if (!map || userLat === null) return;

  map.setView([epiLat, epiLon], 10);

  setTimeout(() => {
    const bounds = L.latLngBounds([[epiLat, epiLon], [userLat, userLon]]);
    map.fitBounds(bounds, { padding: [50, 50] });

    const xIcon = L.divIcon({
      className: 'x-icon',
      html: `<div style="color: red; font-size: 32px;">✖</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([epiLat, epiLon], { icon: xIcon }).addTo(map).bindPopup("震源地");

    startWaveCountdown(epiLat, epiLon);

    let rP = 0, rS = 0;
    if (pWaveCircle) map.removeLayer(pWaveCircle);
    if (sWaveCircle) map.removeLayer(sWaveCircle);

    pWaveCircle = L.circle([epiLat, epiLon], { radius: rP, color: 'blue' }).addTo(map);
    sWaveCircle = L.circle([epiLat, epiLon], { radius: rS, color: 'orange' }).addTo(map);
  }, 2000);
}

// 琉球トラフの震源地（仮） - 北緯24度、東経125度
const epiLat = 24.0; // 震源地の緯度
const epiLon = 125.0; // 震源地の経度

document.getElementById("testButton").addEventListener("click", () => {
  console.log("テスト地震発生！");
  showEpicenterAndWaves(epiLat, epiLon); // 琉球トラフを震源地として表示
});

function showEpicenterAndWaves(epiLat, epiLon) {
  if (!map || userLat === null) return;

  map.setView([epiLat, epiLon], 10);

  setTimeout(() => {
    const bounds = L.latLngBounds([[epiLat, epiLon], [userLat, userLon]]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // 震源地をX印で表示
    const xIcon = L.divIcon({
      className: 'x-icon',
      html: `<div style="color: red; font-size: 32px;">✖</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([epiLat, epiLon], { icon: xIcon }).addTo(map).bindPopup("震源地");

    startWaveCountdown(epiLat, epiLon);

    let rP = 0, rS = 0;
    if (pWaveCircle) map.removeLayer(pWaveCircle);
    if (sWaveCircle) map.removeLayer(sWaveCircle);

    // P波とS波の円を表示
    pWaveCircle = L.circle([epiLat, epiLon], { radius: rP, color: 'blue' }).addTo(map);
    sWaveCircle = L.circle([epiLat, epiLon], { radius: rS, color: 'orange' }).addTo(map);
  }, 2000);
}

