const map = L.map('map').setView([20, 0], 2);

// Base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// store circles
let circles = [];

// convert miles → meters
function toMeters(miles) {
  return miles * 1609.34;
}

// click → add circle
map.on('click', function (e) {

  const radius = parseFloat(document.getElementById('radiusInput').value);
  const mode = document.getElementById('modeSelect').value;

  if (!radius || radius <= 0) return;

  const circle = L.circle(e.latlng, {
    radius: toMeters(radius),
    color: mode === "inside" ? "blue" : "red",
    fillColor: mode === "inside" ? "blue" : "red",
    fillOpacity: 0.3,
    weight: 1
  }).addTo(map);

  circles.push(circle);
});

// clear button
document.getElementById('clearBtn').addEventListener('click', () => {
  circles.forEach(c => map.removeLayer(c));
  circles = [];
});
