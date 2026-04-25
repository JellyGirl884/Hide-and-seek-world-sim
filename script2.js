
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];

function toMeters(miles) {
  return miles * 1609.34;
}

// ADD CIRCLE (auto at center)
document.getElementById('addBtn').addEventListener('click', () => {

  const center = map.getCenter();
  const radiusInput = document.getElementById('radiusInput');
  const radius = parseFloat(radiusInput.value) || 50;

  const circleLayer = L.circle(center, {
    radius: toMeters(radius),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3,
    weight: 1
  }).addTo(map);

  const marker = L.marker(center, { draggable: true }).addTo(map);

  const circleData = {
    lat: center.lat,
    lng: center.lng,
    radius: radius,
    mode: "normal",
    layer: circleLayer,
    marker: marker
  };

  // drag updates position
  marker.on('dragend', function () {
    const pos = marker.getLatLng();

    circleData.lat = pos.lat;
    circleData.lng = pos.lng;

    circleLayer.setLatLng(pos);

    updateSidebar();
  });

  circles.push(circleData);
  updateSidebar();
});

// SIDEBAR RENDER
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

      Mode:
      <select data-index="${index}" class="modeSelect">
        <option value="normal" ${c.mode === "normal" ? "selected" : ""}>Normal</option>
        <option value="inverse" ${c.mode === "inverse" ? "selected" : ""}>Inverse</option>
      </select>

      <br>

      <button data-index="${index}" class="deleteBtn">Delete</button>
    `;

    list.appendChild(div);
  });
}

// radius editing
document.addEventListener('input', function (e) {
  if (e.target.classList.contains('radiusEdit')) {

    const i = e.target.dataset.index;
    const newRadius = parseFloat(e.target.value);

    if (!newRadius) return;

    circles[i].radius = newRadius;
    circles[i].layer.setRadius(toMeters(newRadius));
  }
});

// mode change (normal / inverse)
document.addEventListener('change', function (e) {
  if (e.target.classList.contains('modeSelect')) {

    const i = e.target.dataset.index;
    circles[i].mode = e.target.value;

    // visual hint (optional)
    circles[i].layer.setStyle({
      dashArray: circles[i].mode === "inverse" ? "6,8" : null
    });
  }
});

// delete circle
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('deleteBtn')) {

    const i = e.target.dataset.index;

    map.removeLayer(circles[i].layer);
    map.removeLayer(circles[i].marker);

    circles.splice(i, 1);
    updateSidebar();
  }
});
