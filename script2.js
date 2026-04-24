
const map = L.map('map').setView([20, 0], 2);

// base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// store circles so we can clear them later
let circles = [];

// helper
function toMeters(miles) {
  return miles * 1609.34;
}

// CLICK ON MAP → ADD CIRCLE
map.on('click', function (e) {

  const input = document.getElementById('radiusInput');

  // fallback if input missing
  const radiusMiles = input ? parseFloat(input.value) : 100;

  const circle = L.circle(e.latlng, {
    radius: toMeters(radiusMiles),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3,
    weight: 1
  }).addTo(map);

  circles.push(circle);
});

// CLEAR BUTTON
const clearBtn = document.getElementById('clearBtn');

if (clearBtn) {
  clearBtn.addEventListener('click', function () {
    circles.forEach(c => map.removeLayer(c));
    circles = [];
  });
}
