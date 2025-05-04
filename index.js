let userLat = null;
let userLon = null;
let map = null;
let pWaveCircle = null;
let sWaveCircle = null;
let tsunamiAreas = []; // 津波被害地域
let shakeHistory = []; // 加速度履歴

navigator.geolocation.getCurrentPosition(pos => {
  userLat = pos.coords.latitude;
  userLon = pos.coords.longitude;
  map = L.map("map").setView([userLat, userLon], 8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
  L.marker([userLat, userLon]).addTo(map).bindPopup("現在地");
});

// 加速度履歴の管理
window.addEventListener("devicemotion", e => {
  const acc = e.accelerationIncludingGravity;
  if (!acc) return;
  const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

  shakeHistory.push({ time: Date.now(), magnitude });
  shakeHistory = shakeHistory.filter(d => Date.now() - d.time < 3000);

  // 3秒以上同じような揺れ
  const avg = shakeHistory.reduce((a, b) => a + b.magnitude, 0) / shakeHistory.length;
  let shindo = calculateShindo(avg);

  if (avg > 12) detectQuake(shindo);
  updateShindo(shindo);
});

// 震度に変換
function calculateShindo(accMagnitude) {
  let shindo = 0;
  // 震度1～7のガル換算（参考値）
  if (accMagnitude >= 0.7 && accMagnitude < 1.5) shindo = 1;
  else if (accMagnitude >= 1.5 && accMagnitude < 2.5) shindo = 2;
  else if (accMagnitude >= 2.5 && accMagnitude < 3.5) shindo = 3;
  else if (accMagnitude >= 3.5 && accMagnitude < 4.5) shindo = 4;
  else if (accMagnitude >= 4.5 && accMagnitude < 5.5) shindo = 5;
  else if (accMagnitude >= 5.5 && accMagnitude < 6.5) shindo = 6;
  else if (accMagnitude >= 6.5) shindo = 7;

  return shindo;
}

function updateShindo(shindo) {
  const panel = document.getElementById("panel-shindo");
  const panelShindo = `実際の震度：${shindo}（スマホ加速度）`;
  panel.textContent = panelShindo;
  panel.style.backgroundColor = getColor(shindo);
}

function getColor(shindo) {
  if (shindo >= 7) return "purple";
  if (shindo >= 6) return "red";
  if (shindo >= 4) return "yellow";
  return "lightgreen";
}

function detectQuake(shindo) {
  console.log("地震検出:", shindo);
  // 気象庁の震度情報も利用
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

// P波とS波の到達をカウントダウン
function startWaveCountdown(epiLat, epiLon) {
  const dist = calculateDistanceKm(userLat, userLon, epiLat, epiLon);
  const pTime = Math.floor(dist / 6);
  const sTime = Math.floor(dist / 3.5);
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

    pWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: "blue", fillOpacity: 0.3 }).addTo(map);
    sWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: "orange", fillOpacity: 0.2 }).addTo(map);

    let interval = setInterval(() => {
      rP += 600; rS += 350;
      pWaveCircle.setRadius(rP);
      sWaveCircle.setRadius(rS);
      if (rS > 300000) clearInterval(interval);
    }, 100);
  }, 3000);
}

// 津波エリアの表示
function showTsunamiAlert(epiLat, epiLon, shindo) {
  // 震源地から津波の到達地域を計算
  const tsunamiRadius = (shindo >= 6) ? 100 : (shindo >= 4) ? 50 : 0;
  if (tsunamiRadius === 0) return;

  const tsunamiArea = L.circle([epiLat, epiLon], { radius: tsunamiRadius * 1000, color: getTsunamiColor(shindo), fillOpacity: 0.3 });
  tsunamiArea.addTo(map).bindPopup("津波警報エリア");

  tsunamiAreas.push(tsunamiArea);
}

function getTsunamiColor(shindo) {
  if (shindo >= 6) return "purple";
  if (shindo >= 4) return "red";
  return "yellow";
}

document.getElementById("testButton").addEventListener("click", () => {
  const ryukyuLat = 26.3;
  const ryukyuLon = 127.5;
  updateShindo(7);
  showEpicenterAndWaves(ryukyuLat, ryukyuLon);
  showTsunamiAlert(ryukyuLat, ryukyuLon, 7);
});
