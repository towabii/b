document.addEventListener("DOMContentLoaded", function() {
    // 地震情報を取得する関数（仮）
    function fetchEarthquakeData() {
        // APIやデータソースに接続してデータを取得するコードを追加
        document.getElementById("earthquake-info").innerText = "最新の地震情報: 震度4、○○地方、XX時XX分";
    }

    // 天気情報を取得する関数（仮）
    function fetchWeatherData() {
        // APIやデータソースに接続してデータを取得するコードを追加
        document.getElementById("weather-info").innerText = "現在の天気: 晴れ、気温 25°C";
    }

    // 火災情報を取得する関数（仮）
    function fetchFireData() {
        // APIやデータソースに接続してデータを取得するコードを追加
        document.getElementById("fire-info").innerText = "火災情報: 近隣で火災警報なし";
    }

    // 津波情報を取得する関数（仮）
    function fetchTsunamiData() {
        // APIやデータソースに接続してデータを取得するコードを追加
        document.getElementById("tsunami-info").innerText = "津波情報: 津波警報なし";
    }

    // 各情報を取得
    fetchEarthquakeData();
    fetchWeatherData();
    fetchFireData();
    fetchTsunamiData();
});
