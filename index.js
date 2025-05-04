let map;
let currentLatitude = 26.2124;  // 沖縄の緯度
let currentLongitude = 127.6809;  // 沖縄の経度
let isTestMode = false;

document.getElementById('test-mode').addEventListener('click', toggleTestMode);

function toggleTestMode() {
    isTestMode = !isTestMode;
    if (isTestMode) {
        startTest();
    } else {
        stopTest();
    }
}

function startTest() {
    console.log("テストモード開始");

    // テスト用の震源地
    let epicenter = { lat: 26.222, lng: 127.687 };
    let tsunamiWarning = true;

    // 地図設定
    createMap(epicenter);

    // 揺れの予測時間
    document.getElementById('time-to-shake').textContent = '10秒後';

    // 津波警報
    if (tsunamiWarning) {
        document.getElementById('tsunami-info').textContent = '津波警報あり';
        document.getElementById('tsunami-info').style.color = 'red';
    } else {
        document.getElementById('tsunami-info').textContent = '津波警報なし';
        document.getElementById('tsunami-info').style.color = 'green';
    }

    // 気象庁の震度 (テストデータ)
    let meteorologicalShindo = 6;
    document.getElementById('meteo-shindo').textContent = meteorologicalShindo;

    // 加速度震度 (テストデータ)
    let accelerationShindo = 5;
    document.getElementById('accel-shindo').textContent = accelerationShindo;
}

function stopTest() {
    console.log("テストモード終了");
    resetMap();
    document.getElementById('time-to-shake').textContent = '-';
    document.getElementById('tsunami-info').textContent = '-';
    document.getElementById('meteo-shindo').textContent = '-';
    document.getElementById('accel-shindo').textContent = '-';
}

function createMap(epicenter) {
    if (map) {
        map.remove();
    }

    map = L.map('map').setView([epicenter.lat, epicenter.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([epicenter.lat, epicenter.lng]).addTo(map)
        .bindPopup('震源地')
        .openPopup();

    setTimeout(() => {
        // 震源地をバツ印に変更
        L.marker([epicenter.lat, epicenter.lng], { icon: L.divIcon({ className: 'cross-icon', html: 'X' }) }).addTo(map);
    }, 3000);

    // P波、S波のアニメーションを表示
    displayWaves(epicenter);
}

function displayWaves(epicenter) {
    // P波、S波のアニメーション (円の拡大)
    let pWaveCircle = L.circle([epicenter.lat, epicenter.lng], { color: 'red', radius: 100 }).addTo(map);
    let sWaveCircle = L.circle([epicenter.lat, epicenter.lng], { color: 'blue', radius: 200 }).addTo(map);

    setTimeout(() => {
        pWaveCircle.setRadius(500);
        sWaveCircle.setRadius(800);
    }, 1000);

    // 3秒後に円を消去
    setTimeout(() => {
        map.removeLayer(pWaveCircle);
        map.removeLayer(sWaveCircle);
    }, 5000);
}

function resetMap() {
    if (map) {
        map.remove();
    }
}
