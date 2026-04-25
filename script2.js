const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];
let mergeLayer = null;

function toMeters(miles) {
  return miles * 1609.34;
}

/* ---------------------------
   ADD CIRCLE
----------------------------*/
document.getElementById('addBtn').addEventListener('click', () => {

  const center = map.getCenter();
  const radius = 50;

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
    mode: "normal", // normal or inverse
    layer: circleLayer,
    marker: marker
  };

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

/* ---------------------------
   SIDEBAR
----------------------------*/
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
      <button data-index="${index}" class="modeToggle">
        ${c.mode === "inverse" ? "Inverse" : "Normal"}
      </button>

      <button data-index="${index}" class="deleteBtn">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* ---------------------------
   RADIUS EDIT
----------------------------*/
document.addEventListener('input', function (e) {
  if (e.target.classList.contains('radiusEdit')) {

    const i = e.target.dataset.index;
    const newRadius = parseFloat(e.target.value);

    if (!newRadius || newRadius <= 0) return;

    circles[i].radius = newRadius;
    circles[i].layer.setRadius(toMeters(newRadius));
  }
});

/* ---------------------------
   MODE + DELETE
----------------------------*/
document.addEventListener('click', function (e) {

  // TOGGLE MODE
  if (e.target.classList.contains('modeToggle')) {

    const i = e.target.dataset.index;

    circles[i].mode =
      circles[i].mode === "inverse" ? "normal" : "inverse";

    updateSidebar();
  }

  // DELETE
  if (e.target.classList.contains('deleteBtn')) {

    const i = e.target.dataset.index;

    map.removeLayer(circles[i].layer);
    map.removeLayer(circles[i].marker);

    circles.splice(i, 1);

    updateSidebar();
  }
});

/* ---------------------------
   MERGE SYSTEM (WITH INVERSE)
----------------------------*/
document.getElementById('mergeBtn').addEventListener('click', () => {

  if (mergeLayer) {
    map.removeLayer(mergeLayer);
  }

  let normal = [];
  let inverse = [];

  // convert circles → turf buffers
  circles.forEach(c => {

    const point = turf.point([c.lng, c.lat]);
    const buffer = turf.buffer(point, c.radius * 1.60934, { units: 'kilometers' });

    if (c.mode === "inverse") {
      inverse.push(buffer);
    } else {
      normal.push(buffer);
    }
  });

  if (normal.length === 0 && inverse.length === 0) return;

  let normalUnion = null;
  let inverseUnion = null;

  // union normals
  if (normal.length > 0) {
    normalUnion = normal[0];
    for (let i = 1; i < normal.length; i++) {
      normalUnion = turf.union(normalUnion, normal[i]);
    }
  }

  // union inverses
  if (inverse.length > 0) {
    inverseUnion = inverse[0];
    for (let i = 1; i < inverse.length; i++) {
      inverseUnion = turf.union(inverseUnion, inverse[i]);
    }
  }

  let result = normalUnion;

  // subtract inverse areas
  if (inverseUnion && normalUnion) {
    result = turf.difference(normalUnion, inverseUnion);
  }

  if (!result) return;

  mergeLayer = L.geoJSON(result, {
    style: {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.25
    }
  }).addTo(map);
});
