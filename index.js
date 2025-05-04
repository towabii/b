// 初期設定
let map = L.map('map').setView([24.5, 123.0], 6); // 初期表示位置: 沖縄近辺

// OpenStreetMapのタイルレイヤーを追加
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 加速度センサーを使った震度表示 (スマホの加速度)
if (window.DeviceMotionEvent) {
    let acceleration = { x: 0, y: 0, z: 0 };
    let shakingThreshold = 10; // 加速度の閾値

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

// 震度の計算 (仮の処理)
function updateShindo(accelerationMagnitude) {
    let shindo = Math.min(Math.floor(accelerationMagnitude / 10), 7); // 震度を最大7に制限
    document.getElementById('actual-shindo').textContent = shindo;
}

// 地震情報の表示 (例: 地震発生時に震源地を表示)
function displayEarthquakeInfo(lat, lng) {
    let marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("震源地").openPopup();
}

// 予測秒数の表示 (仮の処理)
function updatePredictionTime() {
    let predictionTime = Math.floor(Math.random() * 10) + 1; // 仮の秒数
    document.getElementById('wave-prediction').textContent = predictionTime;
}

// 津波情報の表示 (仮の処理)
function updateTsunamiInfo() {
    let tsunamiWarning = "なし"; // 仮の情報
    document.getElementById('tsunami-info').textContent = tsunamiWarning;
}

// テスト用地震情報を表示 (地震発生をシミュレート)
function simulateEarthquake() {
    displayEarthquakeInfo(25.0, 123.0); // 琉球トラフ付近の仮の震源地
    updatePredictionTime();
    updateTsunamiInfo();
}

// テストボタン
let testButton = document.createElement("button");
testButton.textContent = "テスト地震発生";
testButton.onclick = simulateEarthquake;
document.body.appendChild(testButton);
