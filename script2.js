
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];

function toMeters(miles) {
  return miles * 1609.34;
}

map.on('click', function (e) {

  const radiusInput = document.getElementById('radiusInput');
  const radius = parseFloat(radiusInput.value);

  if (!radius || radius <= 0) return;

  const circle = L.circle(e.latlng, {
    radius: toMeters(radius),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3,
    weight: 1
  }).addTo(map);

  circles.push(circle);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  circles.forEach(c => map.removeLayer(c));
  circles = [];
});
