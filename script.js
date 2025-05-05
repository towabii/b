// 初期状態
let health = 100;
let happiness = 100;
let name = "たまごっち";

// UI更新関数
function updateUI() {
    document.getElementById('health').innerText = health;
    document.getElementById('happiness').innerText = happiness;
    document.getElementById('name').innerText = name;
    saveData();
}

// 餌をあげる
document.getElementById('feed-btn').addEventListener('click', () => {
    health = Math.min(health + 10, 100);
    happiness = Math.min(happiness + 5, 100);
    updateUI();
});

// 遊ぶ
document.getElementById('play-btn').addEventListener('click', () => {
    happiness = Math.min(happiness + 10, 100);
    health = Math.max(health - 5, 0);
    updateUI();
});

// 休ませる
document.getElementById('rest-btn').addEventListener('click', () => {
    health = Math.min(health + 15, 100);
    happiness = Math.max(happiness - 5, 0);
    updateUI();
});

// 名前変更
document.getElementById('rename-btn').addEventListener('click', () => {
    let newName = prompt("名前を入力してください:");
    if (newName) {
        name = newName;
        updateUI();
    }
});

// ユーザーデータの保存
function saveData() {
    localStorage.setItem('health', health);
    localStorage.setItem('happiness', happiness);
    localStorage.setItem('name', name);
}

// データの読み込み
function loadData() {
    if (localStorage.getItem('health') !== null) {
        health = parseInt(localStorage.getItem('health'));
        happiness = parseInt(localStorage.getItem('happiness'));
        name = localStorage.getItem('name') || name;
    }
    updateUI();
}

// ページロード時にデータをロード
loadData();
