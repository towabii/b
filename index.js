// index.js

if (window.DeviceMotionEvent) {
    let lastAccel = { x: 0, y: 0, z: 0 };
    let threshold = 5; // 震度の閾値設定
    let maxShake = 0;

    window.addEventListener('devicemotion', (event) => {
        let acceleration = event.accelerationIncludingGravity;
        let x = acceleration.x;
        let y = acceleration.y;
        let z = acceleration.z;

        // 加速度の変化量を計算
        let deltaX = Math.abs(x - lastAccel.x);
        let deltaY = Math.abs(y - lastAccel.y);
        let deltaZ = Math.abs(z - lastAccel.z);

        let shake = deltaX + deltaY + deltaZ;

        // 最大の振動強さを保持
        maxShake = Math.max(maxShake, shake);
        lastAccel = { x, y, z };

        // 震度計算
        let shakeLevel = Math.min(Math.floor(maxShake / threshold), 7);
        document.getElementById('result').innerText = `震度: ${shakeLevel}`;
    }, false);
} else {
    alert('このデバイスは加速度センサーに対応していません。');
}
