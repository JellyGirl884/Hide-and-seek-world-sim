
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];

function toMeters(miles) {
  return miles * 1609.34;
}

/* ----------------------
   SIDEBAR TOGGLE
----------------------*/
document.getElementById('toggleSidebar').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('hidden');
});

/* ----------------------
   ADD CIRCLE
----------------------*/
document.getElementById('addBtn').addEventListener('click', () => {

  const center = map.getCenter();

  const circle = L.circle(center, {
    radius: toMeters(50),
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.3
  }).addTo(map);

  const marker = L.marker(center, { draggable: true }).addTo(map);

  const data = {
    lat: center.lat,
    lng: center.lng,
    radius: 50,
    mode: "normal",
    layer: circle,
    marker: marker
  };

  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    data.lat = pos.lat;
    data.lng = pos.lng;
    circle.setLatLng(pos);
    updateSidebar();
  });

  circles.push(data);
  updateSidebar();
});

/* ----------------------
   SIDEBAR RENDER
----------------------*/
function updateSidebar() {
  const list = document.getElementById('circleList');
  list.innerHTML = '';

  circles.forEach((c, i) => {

    const div = document.createElement('div');
    div.className = 'circle-item';

    div.innerHTML = `
      <b>Circle ${i + 1}</b><br>

      Lat: ${c.lat.toFixed(3)}<br>
      Lng: ${c.lng.toFixed(3)}<br>

      Radius:
      <input type="number" value="${c.radius}" data-i="${i}" class="radius">

      <br>

      Mode:
      <button class="mode" data-i="${i}">
        ${c.mode}
      </button>

      <button class="delete" data-i="${i}">
        Delete
      </button>
    `;

    list.appendChild(div);
  });
}

/* ----------------------
   EVENTS
----------------------*/
document.addEventListener('input', e => {
  if (e.target.classList.contains('radius')) {

    const i = e.target.dataset.i;
    circles[i].radius = parseFloat(e.target.value);

    circles[i].layer.setRadius(toMeters(circles[i].radius));
  }
});

document.addEventListener('click', e => {

  // toggle mode (inverse exists but visual only for now)
  if (e.target.classList.contains('mode')) {
    const i = e.target.dataset.i;
    circles[i].mode =
      circles[i].mode === "inverse" ? "normal" : "inverse";

    e.target.innerText = circles[i].mode;
  }

  // delete
  if (e.target.classList.contains('delete')) {
    const i = e.target.dataset.i;

    map.removeLayer(circles[i].layer);
    map.removeLayer(circles[i].marker);

    circles.splice(i, 1);
    updateSidebar();
  }
});
