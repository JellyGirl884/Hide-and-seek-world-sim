
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];
let resultLayer = null;

function toMeters(miles) {
  return miles * 1609.34;
}

/* -----------------------
   ADD CIRCLE
------------------------*/
document.getElementById('addBtn').addEventListener('click', () => {

  const center = map.getCenter();
  const radius = 50;

  const circleLayer = L.circle(center, {
    radius: toMeters(radius),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3
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

  marker.on('dragend', function () {
    const pos = marker.getLatLng();

    circleData.lat = pos.lat;
    circleData.lng = pos.lng;

    circleLayer.setLatLng(pos);

    recompute();
  });

  circles.push(circleData);
  updateSidebar();
  recompute();
});

/* -----------------------
   SIDEBAR
------------------------*/
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

/* -----------------------
   INPUT HANDLING
------------------------*/
document.addEventListener('input', function (e) {
  if (e.target.classList.contains('radiusEdit')) {

    const i = e.target.dataset.index;
    const newRadius = parseFloat(e.target.value);

    if (!newRadius || newRadius <= 0) return;

    circles[i].radius = newRadius;
    circles[i].layer.setRadius(toMeters(newRadius));

    recompute();
  }
});

document.addEventListener('click', function (e) {

  // toggle mode
  if (e.target.classList.contains('modeToggle')) {

    const i = e.target.dataset.index;

    circles[i].mode =
      circles[i].mode === "inverse" ? "normal" : "inverse";

    updateSidebar();
    recompute();
  }

  // delete
  if (e.target.classList.contains('deleteBtn')) {

    const i = e.target.dataset.index;

    map.removeLayer(circles[i].layer);
    map.removeLayer(circles[i].marker);

    circles.splice(i, 1);

    updateSidebar();
    recompute();
  }
});

/* -----------------------
   CORE: AUTO MERGE + INVERSE FIX
------------------------*/
function recompute() {

  if (resultLayer) {
    map.removeLayer(resultLayer);
    resultLayer = null;
  }

  let normal = [];
  let inverse = [];

  // convert circles → valid buffers
  circles.forEach(c => {

    const pt = turf.point([c.lng, c.lat]);
    const buffer = turf.buffer(pt, c.radius * 1.60934, { units: 'kilometers' });

    if (c.mode === "inverse") {
      inverse.push(buffer);
    } else {
      normal.push(buffer);
    }
  });

  if (normal.length === 0 && inverse.length === 0) return;

  // union normals safely
  let mergedNormal = normal.length ? normal[0] : null;

  for (let i = 1; i < normal.length; i++) {
    try {
      mergedNormal = turf.union(mergedNormal, normal[i]);
    } catch (e) {}
  }

  // union inverses safely
  let mergedInverse = inverse.length ? inverse[0] : null;

  for (let i = 1; i < inverse.length; i++) {
    try {
      mergedInverse = turf.union(mergedInverse, inverse[i]);
    } catch (e) {}
  }

  let finalShape = mergedNormal;

  // CRITICAL FIX: only subtract if both exist
  if (mergedInverse && mergedNormal) {
    try {
      const diff = turf.difference(mergedNormal, mergedInverse);
      if (diff) finalShape = diff;
    } catch (e) {
      // fallback: ignore inverse if geometry fails
    }
  }

  if (!finalShape) return;

  resultLayer = L.geoJSON(finalShape, {
    style: {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.25
    }
  }).addTo(map);
}
