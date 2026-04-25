
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];
let resultLayer = null;

function toMeters(miles) {
  return miles * 1609.34;
}

/* -------------------------
   ADD CIRCLE
--------------------------*/
document.getElementById('addBtn').addEventListener('click', () => {

  const center = map.getCenter();

  const circleLayer = L.circle(center, {
    radius: toMeters(50),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3
  }).addTo(map);

  const marker = L.marker(center, { draggable: true }).addTo(map);

  const circleData = {
    lat: center.lat,
    lng: center.lng,
    radius: 50,
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

/* -------------------------
   SIDEBAR
--------------------------*/
function updateSidebar() {
  const list = document.getElementById('circleList');
  list.innerHTML = '';

  circles.forEach((c, i) => {

    const div = document.createElement('div');

    div.innerHTML = `
      <b>Circle ${i + 1}</b><br>
      Radius:
      <input class="radius" data-i="${i}" value="${c.radius}" type="number">

      <button class="mode" data-i="${i}">
        ${c.mode}
      </button>

      <button class="del" data-i="${i}">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* -------------------------
   INPUTS
--------------------------*/
document.addEventListener('input', e => {
  if (e.target.classList.contains('radius')) {
    const i = e.target.dataset.i;
    circles[i].radius = parseFloat(e.target.value);
    circles[i].layer.setRadius(toMeters(circles[i].radius));
    recompute();
  }
});

document.addEventListener('click', e => {

  if (e.target.classList.contains('mode')) {
    const i = e.target.dataset.i;
    circles[i].mode = circles[i].mode === "inverse" ? "normal" : "inverse";
    console.log("Mode changed:", circles[i].mode);
    recompute();
  }

  if (e.target.classList.contains('del')) {
    const i = e.target.dataset.i;
    map.removeLayer(circles[i].layer);
    map.removeLayer(circles[i].marker);
    circles.splice(i, 1);
    recompute();
    updateSidebar();
  }
});

/* -------------------------
   CORE MERGE + INVERSE
--------------------------*/
function recompute() {

  console.log("RECOMPUTE RUNNING");
  console.log("Circles:", circles);

  if (resultLayer) {
    map.removeLayer(resultLayer);
    resultLayer = null;
  }

  let normal = [];
  let inverse = [];

  circles.forEach(c => {

    const point = turf.point([c.lng, c.lat]);

    const buffer = turf.buffer(point, c.radius * 1.60934, {
      units: 'kilometers'
    });

    if (!buffer) {
      console.log("BUFFER FAILED");
      return;
    }

    if (c.mode === "inverse") {
      inverse.push(buffer);
    } else {
      normal.push(buffer);
    }
  });

  console.log("Normal:", normal.length, "Inverse:", inverse.length);

  if (normal.length === 0 && inverse.length === 0) return;

  let merged = null;

  // UNION NORMALS
  if (normal.length > 0) {
    merged = normal[0];
    for (let i = 1; i < normal.length; i++) {
      try {
        merged = turf.union(merged, normal[i]);
      } catch (err) {
        console.log("Union error", err);
      }
    }
  }

  // SUBTRACT INVERSE (FORCED DEBUG MODE)
  if (inverse.length > 0 && merged) {

    console.log("Applying inverse subtraction");

    let inv = inverse[0];
    for (let i = 1; i < inverse.length; i++) {
      try {
        inv = turf.union(inv, inverse[i]);
      } catch (err) {
        console.log("Inverse union error", err);
      }
    }

    try {
      const diff = turf.difference(merged, inv);

      if (diff) {
        merged = diff;
        console.log("Inverse applied SUCCESS");
      } else {
        console.log("Difference returned null");
      }

    } catch (err) {
      console.log("Difference ERROR", err);
    }
  }

  if (!merged) {
    console.log("No merged result");
    return;
  }

  resultLayer = L.geoJSON(merged, {
    style: {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.25
    }
  }).addTo(map);
}
