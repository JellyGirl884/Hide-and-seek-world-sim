
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let circles = [];
let resultLayer = null;

function toMeters(miles) {
  return miles * 1609.34;
}

/* ------------------------
   SIDEBAR TOGGLE
------------------------*/
const sidebar = document.getElementById("sidebar");

document.getElementById("toggleSidebar").addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

/* ------------------------
   ADD CIRCLE
------------------------*/
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

/* ------------------------
   SIDEBAR RENDER
------------------------*/
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
      <input type="number" value="${c.radius}" data-i="${i}" class="radiusInput">

      <br>

      Mode:
      <button class="modeBtn" data-i="${i}">
        ${c.mode}
      </button>

      <button class="deleteBtn" data-i="${i}">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* ------------------------
   INPUTS
------------------------*/
document.addEventListener('input', e => {
  if (e.target.classList.contains('radiusInput')) {

    const i = e.target.dataset.i;
    circles[i].radius = parseFloat(e.target.value);

    circles[i].layer.setRadius(toMeters(circles[i].radius));

    recompute();
  }
});

/* ------------------------
   CLICK EVENTS
------------------------*/
document.addEventListener('click', e => {

  // toggle mode
  if (e.target.classList.contains('modeBtn')) {

    const i = e.target.dataset.i;

    circles[i].mode =
      circles[i].mode === "inverse
