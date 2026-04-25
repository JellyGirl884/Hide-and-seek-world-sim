
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
  const modeSelect = document.getElementById('modeSelect');

  const radius = radiusInput ? parseFloat(radiusInput.value) : 100;
  const mode = modeSelect ? modeSelect.value : "outside";

  const color = mode === "inside" ? "blue" : "red";

  const circle = L.circle(e.latlng, {
    radius: toMeters(radius),
    color: color,
    fillColor: color,
    fillOpacity: 0.3,
    weight: 1
  }).addTo(map);

  circles.push(circle);
});

// clear all circles
const clearBtn = document.getElementById('clearBtn');

if (clearBtn) {
  clearBtn.addEventListener('click', function () {
    circles.forEach(c => map.removeLayer(c));
    circles = [];
  });
}
