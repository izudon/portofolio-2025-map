import Facility from './Facility.js';
import Exposition from './Exposition.js';
import NDay from './NDay.js';

async function main() {
  const map = L.map('map', {
    center: [34.649952, 135.383606],
    maxZoom: 18,
    zoom: 17.5,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    zoomControl: false // for let its position change.
  });
  //L.control.zoom({ position: 'topright' }).addTo(map); // position change

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //L.tileLayer('ihttps://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const [facilityTsv, expositionTsv, geojsons] = await Promise.all([
    fetch('./data/facilities.tsv').then(res => res.text()),
    fetch('./data/expositions.tsv').then(res => res.text()),
    fetch('./data/geojsons.json').then(res => res.json())
  ]);

  Facility.fromTsv(facilityTsv);
  Exposition.fromTsv(expositionTsv);
  Exposition.makeMenuIndex();
  Facility.addExpositions();
  Facility.addGeoJSON(geojsons, map);

  NDay.setDayCount();
  NDay.setNDayCountry();

  const params = new URLSearchParams(location.search);
  const id = params.get("facility");
  if (id !== null && Facility.collection[id]) {
    Facility.collection[id].raise();
  }
}

main().catch(console.error);
