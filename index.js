let userLat = null;
let userLon = null;
let map = null;
let pWaveCircle = null;
let sWaveCircle = null;
let tsunamiLine = null; // 津波表示用の線
let tsunamiEffect = false; // 津波の影響エリア

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
  const panel = document.getElementById("panel-shindo");
  panel.textContent = `実際の震度：${level}`;
  panel.style.backgroundColor = getColor(level);
  updateTsunamiWarning(level); // 津波警報の更新
  document.getElementById("panel-shindo-gov").textContent = `気象庁の震度：${level}`; // 気象庁の震度
}

function getColor(level) {
  if (level >= 7) return "purple";
  if (level >= 6) return "red";
  if (level >= 4) return "yellow";
  return "lightgreen";
}

function updateTsunamiWarning(level) {
  if (level >= 4) {
    tsunamiEffect = true;
    let color = level >= 7 ? 'purple' : level >= 5 ? 'red' : 'yellow';
    if (tsunamiLine) map.removeLayer(tsunamiLine);
    tsunamiLine = L.polyline([
      [userLat, userLon], [userLat + 0.1, userLon + 0.1]
    ], { color: color }).addTo(map); // 仮の線
  } else {
    if (tsunamiLine) map.removeLayer(tsunamiLine);
    tsunamiEffect = false;
  }
}

function updateTimer(epiLat, epiLon) {
  const dist = calculateDistanceKm(userLat, userLon, epiLat, epiLon);
  const pTime = Math.floor(dist / 7);  // P波
  const sTime = Math.floor(dist / 3.5); // S波
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

    updateTimer(epiLat, epiLon);

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
      if (rS > 300000) {
        clearInterval(interval);
        pWaveCircle.remove();
        sWaveCircle.remove();
      }
    }, 100);
  }, 3000);
}

document.getElementById("testButton").addEventListener("click", () => {
  const ryukyuLat = 26.3;
  const ryukyuLon = 127.5;
  document.getElementById("panel-magnitude").textContent = "マグニチュード: 8.1";
  document.getElementById("panel-depth").textContent = "深さ: 10km";
  showEpicenterAndWaves(ryukyuLat, ryukyuLon);
});
