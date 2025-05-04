let userLat = null;
let userLon = null;
let map = null;
let pWaveCircle = null;
let sWaveCircle = null;
let tsunamiLine = null;

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
  const realShindoPanel = document.getElementById("real-shindo");
  realShindoPanel.textContent = `実際の震度：${level}`;
  realShindoPanel.style.backgroundColor = getColor(level);
}

function updateOfficialShindo(level) {
  const officialShindoPanel = document.getElementById("official-shindo");
  officialShindoPanel.textContent = `気象庁震度：${level}`;
}

function getColor(level) {
  if (level >= 7) return "purple";
  if (level >= 6) return "red";
  if (level >= 4) return "yellow";
  return "lightgreen";
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function startWaveCountdown(epiLat, epiLon) {
  const dist = calculateDistanceKm(userLat, userLon, epiLat, epiLon);
  const pTime = Math.floor(dist / 7);  // P波: 7 km/s
  const sTime = Math.floor(dist / 3.5); // S波: 3.5 km/s
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

    if (pWaveCircle) map.removeLayer(pWaveCircle);
    if (sWaveCircle) map.removeLayer(sWaveCircle);
    
    pWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: "blue", fillOpacity: 0.3 }).addTo(map);
    sWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: "orange", fillOpacity: 0.2 }).addTo(map);

    let rP = 0, rS = 0;
    let interval = setInterval(() => {
      rP += 700; rS += 350;
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

function drawTsunamiLine(lat1, lon1, lat2, lon2) {
  const tsunamiColor = "blue";
  const lineCoordinates = [[lat1, lon1], [lat2, lon2]];
  if (tsunamiLine) map.removeLayer(tsunamiLine);
  tsunamiLine = L.polyline(lineCoordinates, { color: tsunamiColor, weight: 5 }).addTo(map);
}

function detectQuake(shindo) {
  const magnitude = Math.random() * 3 + 5; // Random magnitude 5-8
  const depth = Math.random() * 700 + 0; // Random depth 0-700km
  const epiLat = userLat + (Math.random() - 0.5) * 1; // Random epicenter position
  const epiLon = userLon + (Math.random() - 0.5) * 1;
  document.getElementById("magnitude").textContent = `マグニチュード: ${magnitude.toFixed(2)}`;
  document.getElementById("depth").textContent = `深さ: ${depth.toFixed(0)} km`;

  showEpicenterAndWaves(epiLat, epiLon);
}
