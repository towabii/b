// 地図の初期化
var map = L.map('map').setView([35.6895, 139.6917], 12); // 東京の座標に設定
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 目的地を検索する関数
function getRoute() {
    const destination = document.getElementById('destination').value;
    if (!destination) {
        alert("目的地を入力してください");
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        var startLat = position.coords.latitude;
        var startLon = position.coords.longitude;

        // OpenCage Geocoding APIを使って住所を座標に変換（目的地）
        fetch('https://api.opencagedata.com/geocode/v1/json?q=' + destination + '&key=YOUR_API_KEY')
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    var endLat = data.results[0].geometry.lat;
                    var endLon = data.results[0].geometry.lng;

                    // ルートを描画
                    var routeControl = L.Routing.control({
                        waypoints: [
                            L.latLng(startLat, startLon),
                            L.latLng(endLat, endLon)
                        ],
                        routeWhileDragging: true
                    }).addTo(map);

                    // 次の指示を更新
                    routeControl.on('routesfound', function(e) {
                        var nextInstruction = e.routes[0].instructions[0].text;
                        document.getElementById('next-instruction').innerText = "次の指示: " + nextInstruction;
                    });
                } else {
                    alert("目的地が見つかりませんでした");
                }
            });
    });
}

// 音声案内を開始する関数
function startVoiceGuide() {
    const synth = window.speechSynthesis;
    const text = document.getElementById('next-instruction').innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

// ニュースの取得
async function fetchNews() {
    const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://news.yahoo.co.jp/rss/topics/top-picks.xml'));
    const data = await response.json();
    const xml = new DOMParser().parseFromString(data.contents, 'text/xml');
    const items = xml.querySelectorAll('item');
    let newsHtml = "";
    items.forEach(item => {
        const title = item.querySelector('title').textContent;
        newsHtml += `<p>${title}</p>`;
    });
    document.getElementById('news-bar').innerHTML = newsHtml;
}

fetchNews(); // ページロード時にニュースを取得

// 渋滞情報（Google Maps Traffic Layer）
const trafficLayer = L.trafficLayer().addTo(map);

// 信号機の数を表示（OpenStreetMapのデータから）
function displayTrafficSignals() {
    fetch('https://overpass-api.de/api/interpreter?data=[out:json];(node["highway"="traffic_signals"](35.6895,139.6917,35.7000,139.7100));out;')
        .then(response => response.json())
        .then(data => {
            const signals = data.elements;
            signals.forEach(signal => {
                L.marker([signal.lat, signal.lon]).addTo(map).bindPopup("信号機");
            });
        });
}
displayTrafficSignals(); // 信号機を地図に表示
