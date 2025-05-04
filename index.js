function showEpicenterAndWaves(epiLat, epiLon) {
  if (!map || userLat === null || userLon === null) return;

  // 1. 一旦震源地にズーム
  map.setView([epiLat, epiLon], 10);

  setTimeout(() => {
    // 2. 震源地と現在地を同時に表示するズームレベルと中心を計算
    const bounds = L.latLngBounds([
      [epiLat, epiLon],
      [userLat, userLon]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // 3. 震源地に「バツ印」マーカーを表示
    const xIcon = L.divIcon({
      className: 'x-icon',
      html: `<div style="color: red; font-size: 32px; font-weight: bold;">✖</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([epiLat, epiLon], { icon: xIcon }).addTo(map).bindPopup("震源地");

    // 4. P波とS波のアニメーション
    let radiusP = 0;
    let radiusS = 0;

    if (pWaveCircle) map.removeLayer(pWaveCircle);
    if (sWaveCircle) map.removeLayer(sWaveCircle);

    const pColor = 'rgba(0, 150, 255, 0.4)';
    const sColor = 'rgba(255, 100, 0, 0.3)';

    pWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: pColor }).addTo(map);
    sWaveCircle = L.circle([epiLat, epiLon], { radius: 0, color: sColor }).addTo(map);

    let interval = setInterval(() => {
      radiusP += 2000; // P波: 2km/s
      radiusS += 1000; // S波: 1km/s

      pWaveCircle.setRadius(radiusP);
      sWaveCircle.setRadius(radiusS);

      if (radiusS > 300000) clearInterval(interval); // 終了条件
    }, 100);

  }, 3000); // 3秒後にズームアウトして波表示
}
