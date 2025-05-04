// ドラッグ可能なブロックの設定
const blocks = document.querySelectorAll('.block');
const programArea = document.getElementById('program-area');

// ブロックのドラッグ開始
blocks.forEach(block => {
    block.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
    });
});

// プログラムエリアへのドロップ
programArea.addEventListener('dragover', (e) => {
    e.preventDefault();
});

programArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('text/plain');
    const block = document.getElementById(blockId);
    const clone = block.cloneNode(true);
    programArea.appendChild(clone);
    clone.style.marginTop = "10px"; // 少しスペースを空けて配置
});

// 実行ボタンの処理
document.getElementById('run-btn').addEventListener('click', () => {
    const blocksInArea = programArea.children;
    if (blocksInArea.length > 0) {
        let output = "実行結果: ";
        Array.from(blocksInArea).forEach(block => {
            if (block.innerText.includes('移動')) {
                output += "→ ";
            } else if (block.innerText.includes('ジャンプ')) {
                output += "ジャンプ！";
            }
        });
        alert(output);
    } else {
        alert("プログラムが作成されていません！");
    }
});
