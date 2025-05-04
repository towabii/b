let userLat = null;
let userLon = null;
let map = null;
let pWaveCircle = null;
let sWaveCircle = null;
let tsunamiLine = null; // 津波線用
let tsunamiEffect = false; // 津波が来るかどうか

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
  let shindo = Math.floor(avg);

  if (avg > 12) detectQuake(shindo);
  updateShindo(shindo);
});

function updateShindo(level) {
  const leftPanel = document.getElementById("left-shindo");
  const rightPanel = document.getElementById("right-shindo");
  leftPanel.textContent = `実際の震度：${level}`;
  leftPanel.style.backgroundColor = getColor(level);

  // 気象庁の震度（仮の値を使ってテスト）
  const meteorologicalShindo = Math.min(7, Math.floor(level / 2)); // 仮で計算
  rightPanel.textContent = `気象庁の震度：${meteorologicalShindo}`;
  rightPanel.style.backgroundColor = getColor(meteorologicalShindo);
}

function getColor(level) {
  if (level >= 7) return "purple";
  if (level >= 6) return "red";
  if (level >= 4) return "yellow";
  return "lightgreen";
}

function detectQuake(shindo) {
  updateShindo(shindo);
  updateTsunamiWarning(shindo);
}

function updateTsunamiWarning(level) {
  if (level >= 4) {
    tsunamiEffect = true;
    let color = level >= 7 ? 'purple' : level >= 5 ? 'red' : 'yellow';
    if (tsunamiLine) map.removeLayer(tsunamiLine);

    // 仮で沿岸線を作る（簡単な直線として）
    tsunamiLine = L.polyline([
      [userLat, userLon],
      [userLat + 0.1, userLon + 0.2]
    ], {
      color: color,
      weight: 5
    }).addTo(map);
  } else {
    if (tsunamiLine) map.removeLayer(tsunamiLine);
    tsunamiEffect = false;
  }
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

    let rP = 0, rS = 0;
    if (pWaveCircle) map.removeLayer(pWaveCircle);
    if (sWaveCircle) map.removeLayer(sWaveCircle);

    pWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: "blue", fillOpacity: 0.3 }).addTo(map);
    sWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: "orange", fillOpacity: 0.2 }).addTo(map);

    let interval = setInterval(() => {
      rP += 700;  // P波の速度
      rS += 350;  // S波の速度
      pWaveCircle.setRadius(rP);
      sWaveCircle.setRadius(rS);
      if (rS > 300000) clearInterval(interval);
    }, 100);
  }, 3000);
}

document.getElementById("testButton").addEventListener("click", () => {
  const ryukyuLat = 26.3;
  const ryukyuLon = 127.5;
  updateShindo(7); // テストで震度7を表示
  showEpicenterAndWaves(ryukyuLat, ryukyuLon);
});
