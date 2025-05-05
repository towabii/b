// Google Mapの初期化
let map;
let directionsService;
let directionsRenderer;

function initMap() {
    // 地図の初期設定
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.6895, lng: 139.6917},  // 初期位置: 東京
        zoom: 12
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // ルート案内ボタンのクリックイベント
    document.getElementById('get-route').addEventListener('click', function () {
        const destination = document.getElementById('destination').value;
        if (destination) {
            calculateRoute(destination);
        }
    });
}

// ルート計算
function calculateRoute(destination) {
    const request = {
        origin: '現在地',  // 現在地は自動取得するか、手動で指定
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            updateRouteInfo(result);
        } else {
            alert('ルートの計算に失敗しました。');
        }
    });
}

// ルート案内の表示
function updateRouteInfo(result) {
    const leg = result.routes[0].legs[0];
    const routeInfo = document.getElementById('route-text');
    routeInfo.innerHTML = `
        <strong>出発地:</strong> ${leg.start_address}<br>
        <strong>目的地:</strong> ${leg.end_address}<br>
        <strong>所要時間:</strong> ${leg.duration.text}<br>
        <strong>距離:</strong> ${leg.distance.text}
    `;
}

// ニュースの流れ
function startNewsTicker() {
    const newsText = document.getElementById('news-text');
    const newsItems = [
        "速報: 今日は晴れ、気温は20度。",
        "ニュース: 東京オリンピックの準備が順調。",
        "経済: 株価が大きく上昇しています。",
        "天気: 明日から雨の予報。",
        "交通: 市内で渋滞が発生中。",
    ];

    let currentNewsIndex = 0;
    
    // ニュースを一定間隔で更新
    setInterval(() => {
        newsText.innerText = newsItems[currentNewsIndex];
        currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    }, 5000); // 5秒ごとにニュースを切り替え
}

// ページがロードされたらニュースを流し始める
window.onload = function () {
    startNewsTicker();
};
