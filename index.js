// 地震情報の更新
function updateEarthquakeInfo(data) {
    // ここで取得した地震データを使って、表示を更新
    document.getElementById('shindo').textContent = `震度: ${data.shindo}`;
    document.getElementById('magnitude').textContent = `マグニチュード: ${data.magnitude}`;
    document.getElementById('location').textContent = `場所: ${data.location}`;
    document.getElementById('time').textContent = `発生時刻: ${new Date(data.time).toLocaleString()}`;
}

// 地震情報を取得
function getEarthquakeData() {
    fetch('https://api.p2pquake.net/v1/earthquake/last')
        .then(response => response.json())
        .then(data => {
            updateEarthquakeInfo(data);
        })
        .catch(error => console.error('地震情報の取得に失敗:', error));
}

// テスト地震発生シミュレーション
document.getElementById('test-button').addEventListener('click', () => {
    let testData = {
        shindo: 5,
        magnitude: 7.2,
        location: "沖縄県近海",
        time: Date.now()
    };
    updateEarthquakeInfo(testData);
});

// ページが読み込まれたら地震情報を取得
window.onload = function() {
    getEarthquakeData();
};
