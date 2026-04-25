const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];
let placingMode = false;

function toMeters(miles) {
  return miles * 1609.34;
}

// ADD BUTTON
document.getElementById('addBtn').addEventListener('click', () => {
  placingMode = true;
  alert("Click on the map to place your circle");
});

// MAP CLICK
map.on('click', function (e) {

  if (!placingMode) return;
  placingMode = false;

  const radius = parseFloat(document.getElementById('radiusInput').value) || 100;

  // circle
  const circleLayer = L.circle(e.latlng, {
    radius: toMeters(radius),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3
  }).addTo(map);

  // draggable center marker
  const marker = L.marker(e.latlng, {
    draggable: true
  }).addTo(map);

  const circleData = {
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    radius: radius,
    layer: circleLayer,
    marker: marker
  };

  // DRAGGING updates circle position
  marker.on('drag', function (event) {
    const pos = event.target.getLatLng();

    circleData.lat = pos.lat;
    circleData.lng = pos.lng;

    circleLayer.setLatLng(pos);

    updateSidebar();
  });

  circles.push(circleData);
  updateSidebar();
});

// SIDEBAR UPDATE
function updateSidebar() {
  const list = document.getElementById('circleList');
  list.innerHTML = '';

  circles.forEach((c, index) => {
    const div = document.createElement('div');
    div.className = 'circle-item';

    div.innerHTML = `
      <strong>Circle ${index + 1}</strong><br>
      Lat: ${c.lat.toFixed(3)}<br>
      Lng: ${c.lng.toFixed(3)}<br>
      Radius:
      <input type="number" value="${c.radius}" data-index="${index}" class="radiusEdit">
      <br>
      <button data-index="${index}" class="deleteBtn">Delete</button>
    `;

    list.appendChild(div);
  });

  // RADIUS EDIT
  document.querySelectorAll('.radiusEdit').forEach(input => {
    input.addEventListener('change', function () {
      const i = this.dataset.index;
      const newRadius = parseFloat(this.value);

      circles[i].radius = newRadius;
      circles[i].layer.setRadius(toMeters(newRadius));
    });
  });

  // DELETE
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', function () {
      const i = this.dataset.index;

      map.removeLayer(circles[i].layer);
      map.removeLayer(circles[i].marker);

      circles.splice(i, 1);
      updateSidebar();
    });
  });
}
