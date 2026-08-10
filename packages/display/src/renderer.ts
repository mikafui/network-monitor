const electronApi = window.electronAPI;
const platform = document.getElementById('platform');
const collectorStatus = document.getElementById('collector-status');

if (platform) {
  platform.textContent = `Platform: ${electronApi.platform}`;
}

electronApi.onTrafficUpdate(data => {
  console.log('Collector-Daten angekommen:', data);

  if (collectorStatus) {
    collectorStatus.textContent = JSON.stringify(data, null, 2);
  }
});
