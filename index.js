let userLat = null;
let userLon = null;
let map = null;
let pWaveCircle = null;
let sWaveCircle = null;

// === 現在地の取得と地図表示 ===
navigator.geolocation.getCurrentPosition((pos) => {
  userLat = pos.coords.latitude;
  userLon = pos.coords.longitude;

  map = L.map('map').setView([userLat, userLon], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([userLat, userLon]).addTo(map).bindPopup("現在地");
}, () => {
  alert('位置情報を取得できませんでした。');
});

// === スマホの加速度と震度判定（3秒継続で判定） ===
if (window.DeviceMotionEvent) {
  let last = { x: 0, y: 0, z: 0 };
  let startTime = null;
  let shaking = false;

  window.addEventListener('devicemotion', (e) => {
    const a = e.accelerationIncludingGravity;
    const shake = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
    const now = Date.now();

    let currentShindo = Math.min(7, Math.floor(shake / 3));
    document.getElementById('local-shindo').textContent = `震度: ${currentShindo}`;
    updateColor(currentShindo);

    if (shake > 5) {
      if (!shaking) {
        startTime = now;
        shaking = true;
      } else if (now - startTime > 3000) {
        document.getElementById('local-shindo').textContent = `震度: ${currentShindo}（地震検出）`;
      }
    } else {
      shaking = false;
      startTime = null;
    }

    last = { x: a.x, y: a.y, z: a.z };
  });
}

// === 色の変更関数 ===
function updateColor(shindo) {
  let color = 'white';
  if (shindo >= 1 && shindo <= 3) color = 'lightgreen';
  else if (shindo >= 4 && shindo <= 5) color = 'yellow';
  else if (shindo >= 6 && shindo <= 6) color = 'red';
  else if (shindo === 7) color = 'purple';

  document.getElementById('panel-shindo').style.backgroundColor = color;
  document.getElementById('panel-map').style.backgroundColor = color;
}

// === 震源地の表示と波動アニメーション ===
function showEpicenterAndWaves(lat, lon) {
  if (!map) return;

  L.marker([lat, lon], { icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/69/69524.png", iconSize: [32, 32] }) }).addTo(map).bindPopup("震源地");

  let radiusP = 0;
  let radiusS = 0;

  if (pWaveCircle) map.removeLayer(pWaveCircle);
  if (sWaveCircle) map.removeLayer(sWaveCircle);

  const pColor = 'rgba(0, 150, 255, 0.4)';
  const sColor = 'rgba(255, 100, 0, 0.3)';

  pWaveCircle = L.circle([lat, lon], { radius: 0, color: pColor }).addTo(map);
  sWaveCircle = L.circle([lat, lon], { radius: 0, color: sColor }).addTo(map);

  let interval = setInterval(() => {
    radiusP += 2000; // 2kmずつ拡大
    radiusS += 1000; // S波は遅い

    pWaveCircle.setRadius(radiusP);
    sWaveCircle.setRadius(radiusS);

    if (radiusS > 300000) clearInterval(interval); // 30万メートルで停止
  }, 100);
}

// ✅ サンプル震源地呼び出し（必要に応じて実際のデータに変更）
setTimeout(() => {
  showEpicenterAndWaves(35.6895, 139.6917); // 例: 東京付近
}, 5000); // 5秒後に震源地を表示（テスト用）
