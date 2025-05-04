// ========== 実際の震度（スマホ加速度） ==========
if (window.DeviceMotionEvent) {
  let last = { x: 0, y: 0, z: 0 };
  let maxShake = 0;

  window.addEventListener('devicemotion', (e) => {
    const a = e.accelerationIncludingGravity;
    const shake = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
    maxShake = Math.max(maxShake, shake);

    let shindo = Math.min(7, Math.floor(maxShake / 3));
    document.getElementById('local-shindo').textContent = `震度: ${shindo}`;
    last = { x: a.x, y: a.y, z: a.z };
  });
}

// ========== 地図表示（Leaflet） ==========
const map = L.map('map').setView([35.0, 137.0], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// ========== 地震情報取得 ==========
async function fetchEarthquake() {
  try {
    const res = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json');
    const data = await res.json();

    if (data.length > 0) {
      const latest = data[0];
      const code = latest.json;
      const detailRes = await fetch(`https://www.jma.go.jp/bosai/quake/data/${code}`);
      const detail = await detailRes.json();

      const info = detail.Body.Earthquake;
      const hypocenter = info.Hypocenter.Area;
      const magnitude = info.Magnitude;
      const time = info.OriginTime;

      const coords = [hypocenter.Latitude, hypocenter.Longitude];
      L.marker(coords).addTo(map).bindPopup(`震源: ${hypocenter.Name}<br>震度: ${magnitude}`).openPopup();

      document.getElementById('jma-shindo').textContent = `気象庁震度: M${magnitude}`;

      // P波/S波到達予測（例: 300km, S波=6km/s）
      const distance = 300000; // 仮定
      const spd = 6000; // S波速度（m/s）
      const seconds = Math.floor(distance / spd);
      document.getElementById('wave-timer').textContent = `${seconds} 秒後に揺れ`;
    }
  } catch (err) {
    console.error('地震データ取得失敗', err);
  }
}

// ========== 津波情報 ==========
async function fetchTsunami() {
  try {
    const res = await fetch('https://www.jma.go.jp/bosai/tsunami/data/tsunami.json');
    const data = await res.json();

    const status = data.Head.Title || '現在、津波情報はありません。';
    document.getElementById('tsunami-info').textContent = status;
  } catch {
    document.getElementById('tsunami-info').textContent = '津波情報取得失敗';
  }
}

// 起動時と定期更新
fetchEarthquake();
fetchTsunami();
setInterval(() => {
  fetchEarthquake();
  fetchTsunami();
}, 60000); // 1分ごとに更新
