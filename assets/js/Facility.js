import Entity from './Entity.js';
import Exposition from './Exposition.js';

export default class Facility extends Entity {
  static collection = {}; // Facility専用のコレクション

  static map = null;

  static APPEAR = {
    opacity: 0.5,
    fillOpacity: 0.2
  };

  static DISAPPEAR = {
    opacity: 0.0,
    fillOpacity: 0.0
  };

  static POLYGON_STYLE;

  static {
    Facility.POLYGON_STYLE = {
      weight: 3,
      color: "#3388ff",
      fillColor: "#3388ff",
      ...Facility.DISAPPEAR
    };
  }

  static addGeoJSON(geojsons, map) {
    this.map = map; // ← static に保存

    for (const [id, geojson] of Object.entries(geojsons)) {
      const facility = this.collection[id];
      if (!facility) continue;
  
      facility.geojson = geojson;
  
      const layer = L.geoJSON(geojson, {
        style: Facility.POLYGON_STYLE,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: () => facility.appear(),
            mouseout: () => facility.disappear(),
            click: () => facility.raise(),
            popupclose: () => facility.lower()
          });
        }
      });
  
      facility.layer = layer;
      facility.center = layer.getBounds().getCenter();
      layer.addTo(map);
    }
  }

  static addExpositions() {
    for (const facility of Object.values(this.collection)) {
      const fid = facility.id;
      const expositionList = Exposition.fidMap[fid] || [];
      facility.expositions = expositionList;
    }
  }

  static raise(id) {
    const facility = this.collection[id];
    if (facility) {
      facility.raise();
    } else {
      console.warn(`Facility.raise: not found the facility of the ID "${id}"`);
    }
  }

  render() {
    const hasMultiple = this.expositions.length !== 1;
    const titleHtml = hasMultiple ?
      `<div class="head">${this.name_ja}</div>` : "";
  
    let expositionsHtml = "";
    if (this.expositions.length > 0) {
      expositionsHtml = `
        <div class="body">
          <ul>
            ${this.expositions.map(e => e.li()).join("")}
          </ul>
        </div>
      `;
    }
  
    return `
      ${titleHtml}
      ${expositionsHtml}
    `;
  }

  appear() {
    if (this.layer) {
      this.layer.setStyle(Facility.APPEAR);
    }
  }

  disappear() {
    if (this.layer) {
      this.layer.setStyle(Facility.DISAPPEAR);
    }
  }

  raise() {
    console.log(this);
    if (!this.popup) {
      this.popup = L.popup(Facility.POPUP_STYLE)
        .setLatLng(this.center)
        .setContent(this.render());
    }
  
    this.popup.openOn(Facility.map);
    Facility.map?.panTo(this.center, { duration: 0.5 });
  }

  lower() {
    // 処理は後で追加予定
  }
}

