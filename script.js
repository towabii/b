// 初期設定
let map = L.map('map').setView([35.681236, 139.767125], 13); // 東京駅中心

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ルートコントロール（Leaflet Routing Machine）
let control = L.Routing.control({
  waypoints: [],
  routeWhileDragging: false,
  show: false,
  createMarker: () => null, // マーカー非表示
  language: 'ja',
  formatter: new L.Routing.Formatter({
    language: 'ja',
    formatInstruction: (instr) => japaneseInstruction(instr)
  })
}).addTo(map);

// 指示文を日本語に変換（簡易対応）
function japaneseInstruction(instr) {
  if (!instr || !instr.text) return '';
  return instr.text
    .replace('Turn right', '右に曲がってください')
    .replace('Turn left', '左に曲がってください')
    .replace('Continue', 'そのまま進んでください')
    .replace('Head', '出発')
    .replace('onto', '')
    .replace('Destination', '目的地')
    .replace('at the roundabout', 'ロータリーで')
    .replace('slight right', 'やや右')
    .replace('slight left', 'やや左');
}

// 音声案内（Web Speech API）
function speak(text) {
  if ('speechSynthesis' in window) {
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    speechSynthesis.speak(uttr);
  }
}

// 入力→ルート表示
async function routeTo() {
  const destInput = document.getElementById('destination').value;
  if (!destInput) return alert('目的地を入力してください');

  const encoded = encodeURIComponent(destInput);
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`;

  try {
    const res = await fetch(geocodeUrl);
    const data = await res.json();
    if (!data || !data.length) throw new Error('目的地が見つかりませんでした');

    const destLatLng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

    // 現在地取得
    navigator.geolocation.getCurrentPosition((pos) => {
      const startLatLng = [pos.coords.latitude, pos.coords.longitude];

      // 地図調整
      map.setView(startLatLng, 13);

      // ルート設定
      control.setWaypoints([
        L.latLng(startLatLng),
        L.latLng(destLatLng)
      ]);

    }, () => {
      alert('位置情報が取得できませんでした');
    });

  } catch (err) {
    alert('ルート検索中にエラーが発生しました');
    console.error(err);
  }
}

// 案内テキストと音声案内の更新
control.on('routesfound', function (e) {
  const summary = e.routes[0].summary;
  const instructions = e.routes[0].instructions;
  const container = document.getElementById('instructions');
  container.innerHTML = '';

  instructions.forEach((step, i) => {
    const text = japaneseInstruction(step);
    const p = document.createElement('p');
    p.textContent = `▶ ${text}`;
    container.appendChild(p);

    if (i === 0) speak(text); // 最初の指示だけ音声案内
  });

  // 目的地近くになったら交差点名を取得して追加
  const end = e.routes[0].waypoints[1];
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${end.latLng.lat}&lon=${end.latLng.lng}`)
    .then(res => res.json())
    .then(data => {
      const road = data.address.road || data.display_name;
      const p = document.createElement('p');
      p.textContent = `📍 到着地点付近: ${road}`;
      container.appendChild(p);
    });
});

// ニュースバー（Yahoo RSS）
function loadRSS() {
  const proxy = 'https://api.allorigins.win/get?url=';
  const rssURL = encodeURIComponent('https://news.yahoo.co.jp/rss/topics/top-picks.xml');

  fetch(`${proxy}${rssURL}`)
    .then(res => res.json())
    .then(data => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, 'text/xml');
      const items = xml.querySelectorAll('item');
      let headlines = [];
      items.forEach(item => {
        headlines.push(item.querySelector('title').textContent);
      });
      document.getElementById('news-scroll').textContent = '📢 ' + headlines.join(' ｜ ');
    })
    .catch(err => {
      document.getElementById('news-scroll').textContent = 'ニュース読み込み失敗';
      console.error('RSSエラー:', err);
    });
}

loadRSS();
