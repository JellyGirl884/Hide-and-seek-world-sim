const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

map.on('click', function(e) {
  L.circle(e.latlng, {
    radius: 100000,
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3
  }).addTo(map);
});
