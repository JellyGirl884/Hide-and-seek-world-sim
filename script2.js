alert("NEW VERSION LOADED");
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// store circles with mode
let circles = [];

function toMeters(miles) {
  return miles * 1609.34;
}

map.on('click', function (e) {

  const radiusInput = document.getElementById('radiusInput');
  const modeSelect = document.getElementById('modeSelect');

  const radius = radiusInput ? parseFloat(radiusInput.value) : 100;
  const mode = modeSelect ? modeSelect.value : "outside";

  const circle = L.circle(e.latlng, {
    radius: toMeters(radius),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3,
    weight: 1
  }).addTo(map);

  // store BOTH circle + mode
  circles.push({
    layer: circle,
    mode: mode
  });
});

// clear all
const clearBtn = document.getElementById('clearBtn');

if (clearBtn) {
  clearBtn.addEventListener('click', function () {
    circles.forEach(c => map.removeLayer(c.layer));
    circles = [];
  });
}
