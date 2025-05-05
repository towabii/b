const apiKey = 'YOUR_API_KEY'; // OpenWeatherMapのAPIキーを入力

// 地震情報を取得する関数
function fetchEarthquakeData() {
    fetch('https://www.jma.go.jp/bosai/quake/data/list.json')
        .then(response => response.json())
        .then(data => {
            const earthquake = data.data[0]; // 最新の地震情報を取得
            const earthquakeInfo = `
                最新の地震情報:
                震度: ${earthquake.intensity}, 場所: ${earthquake.area}, 時刻: ${earthquake.time}
            `;
            document.getElementById('earthquake-info').innerText = earthquakeInfo;
        })
        .catch(error => {
            console.error('地震情報取得エラー:', error);
            document.getElementById('earthquake-info').innerText = '地震情報の取得に失敗しました。';
        });
}

// 津波情報を取得する関数
function fetchTsunamiData() {
    fetch('https://www.jma.go.jp/jma/index.html') // 実際のAPI URLに変更
        .then(response => response.json())
        .then(data => {
            const tsunamiInfo = `
                津波情報: ${data.tsunamiWarning}
            `;
            document.getElementById('tsunami-info').innerText = tsunamiInfo;
        })
        .catch(error => {
            console.error('津波情報取得エラー:', error);
            document.getElementById('tsunami-info').innerText = '津波情報の取得に失敗しました。';
        });
}

// 天気情報を取得する関数
function fetchWeatherData() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${apiKey}&units=metric&lang=ja`)
        .then(response => response.json())
        .then(data => {
            const weatherInfo = `
                現在の天気: ${data.weather[0].description}, 気温: ${data.main.temp}°C
            `;
            document.getElementById('weather-info').innerText = weatherInfo;
        })
        .catch(error => {
            console.error('天気情報取得エラー:', error);
            document.getElementById('weather-info').innerText = '天気情報の取得に失敗しました。';
        });
}

// 雨雲レーダー情報を取得する関数
function fetchRainRadarData() {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=35.6895&lon=139.6917&exclude=hourly,daily&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const rainRadarInfo = `
                雨雲レーダー: ${data.current.weather[0].description}
            `;
            document.getElementById('rain-radar-info').innerText = rainRadarInfo;
        })
        .catch(error => {
            console.error('雨雲レーダー情報取得エラー:', error);
            document.getElementById('rain-radar-info').innerText = '雨雲レーダー情報の取得に失敗しました。';
        });
}

// イベントリスナーを追加
document.getElementById('earthquake-btn').addEventListener('click', fetchEarthquakeData);
document.getElementById('tsunami-btn').addEventListener('click', fetchTsunamiData);
document.getElementById('weather-btn').addEventListener('click', fetchWeatherData);
document.getElementById('rain-radar-btn').addEventListener('click', fetchRainRadarData);

// 最初に地震情報を取得
fetchEarthquakeData();
