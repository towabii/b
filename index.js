// 地図設定
let map = L.map('map').setView([24.5, 123.0], 6); // 初期位置を沖縄近辺に設定

// OpenStreetMapのタイルレイヤーを追加
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 仮の加速度センサー (ここでは実際のデータを使う場合はAPIと連携します)
let acceleration = { x: 0, y: 0, z: 0 };
let shakingThreshold = 10; // 仮の加速度閾値

// 加速度センサーのデータを受け取る
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        acceleration.x = event.acceleration.x;
        acceleration.y = event.acceleration.y;
        acceleration.z = event.acceleration.z;

        let accelerationMagnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        if (accelerationMagnitude > shakingThreshold) {
            updateShindo(accelerationMagnitude); // 震度更新
        }
    });
}

// 震度を更新する関数
function updateShindo(accelerationMagnitude) {
    let shindo = Math.min(Math.floor(accelerationMagnitude / 10), 7); // 震度を最大7に制限
    document.getElementById('shindo').textContent = `震度: ${shindo}`;
}

// 地震発生時に震源地を地図に表示する関数
function displayEarthquakeInfo(lat, lng) {
    let marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("震源地").openPopup();
}

// 予測到達時間 (仮の計算)
function updateWavePrediction() {
    let predictionTime = Math.floor(Math.random() * 10) + 1; // 仮の予測秒数
    document.getElementById('wave-time').textContent = `予測到達時間: ${predictionTime}秒`;
}

// 津波警報 (仮)
function updateTsunamiInfo() {
    let tsunamiWarning = "なし"; // 仮の情報
    document.getElementById('tsunami-info').textContent = `津波警報: ${tsunamiWarning}`;
}

// テストボタンがクリックされたときに地震を発生させる
document.getElementById('test-button').addEventListener('click', () => {
    // 仮の震源地座標
    let lat = 25.0;
    let lng = 123.0;

    // 地震情報を更新
    displayEarthquakeInfo(lat, lng);
    updateWavePrediction();
    updateTsunamiInfo();
});
