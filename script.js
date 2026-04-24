const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// store circles only (NO merging engine)
let circles = [];
let layers = [];

function toMeters(miles) {
  return miles * 1609.34;
}

// MAIN CLICK
map.on('click', (e) => {

  const radius = parseFloat(document.getElementById('radiusInput').value);
  const mode = document.getElementById('modeSelect').value;

  if (!radius || radius <= 0) return;

  const circle = L.circle(e.latlng, {
    radius: toMeters(radius),
    color: mode === "inside" ? "blue" : "red",
    fillColor: mode === "inside" ? "blue" : "red",
    fillOpacity: 0.35,
    weight: 1
  }).addTo(map);

  circles.push(circle);
  layers.push(circle);
});

// CLEAR
document.getElementById("clearBtn").addEventListener("click", () => {
  circles.forEach(c => map.removeLayer(c));
  circles = [];
  layers = [];
});
