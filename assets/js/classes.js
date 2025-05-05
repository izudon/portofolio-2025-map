export class Entity {
  constructor(id) {
    this.id = id;
    this.constructor.collection[id] = this;
  }

  setProperty(key, value) {
    this[key] = value;
  }

  static fromTsv(tsvText) {
    const lines = tsvText.trim().split("\n");
    const headers = lines.shift().split("\t");

    for (const line of lines) {
      if (!line.trim()) continue;
      const values = line.split("\t");
      const obj = {};

      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });

      const instance = new this(obj.id);

      for (const [key, value] of Object.entries(obj)) {
        if (key !== "id") {
          instance.setProperty(key, value);
        }
      }
    }

    return this.collection;
  }
}

export class Facility extends Entity {
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

  render() {
    const hasMultiple = this.expositions.length !== 1;
    const titleHtml = hasMultiple ? `<div>${this.name_ja}</div>` : "";
  
    let expositionsHtml = "";
    if (this.expositions.length > 0) {
      expositionsHtml = `
        <div>
          ${this.expositions.map(e => e.render()).join("")}
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

export class Exposition extends Entity {
  static collection = {}; // 全 Exposition
  static ndayMap = {};    // nday → Exposition
  static fidMap = {};     // fid → Exposition 配列

  static fromTsv(tsvText) {
    super.fromTsv(tsvText); // 親の fromTsv 実行
    this.makeNdayMap();     // ndayMap 作成
    this.makeFidMap();      // fidMap 作成
    return this.collection;
  }

  static makeMenuIndex() {
    const ul = document.getElementById("country-list");
  
    if (!ul) {
      console.error("Error: #country-list not found.");
      return;
    }
  
    const html = Object.values(this.collection)
      .filter(e => e.id.startsWith("a-"))
      .map(e => `<li>${e.sign} ${e.name_ja}</li>`)
      .join("");
  
    ul.innerHTML = html;
  }

  static makeNdayMap() {
    this.ndayMap = {};

    for (const exposition of Object.values(this.collection)) {
      const ndayStr = exposition.nday;
      if (!ndayStr) continue;

      const nday = parseInt(ndayStr, 10);
      if (isNaN(nday)) continue;

      this.ndayMap[nday] = exposition;
    }
  }

  static makeFidMap() {
    this.fidMap = {};

    for (const exposition of Object.values(this.collection)) {
      const fid = exposition.fid;
      if (!fid) continue;

      if (!this.fidMap[fid]) {
        this.fidMap[fid] = [];
      }
      this.fidMap[fid].push(exposition);
    }
  }

  static getByNday(nday) {
    return this.ndayMap[nday] || null;
  }

  static getByFid(fid) {
    return this.fidMap[fid] || [];
  }

  render() {
    return `
      <div>
        <span>${this.sign}</span>
	<span>${this.name_ja}</span>
      </div>
    `;
  }
}

export class NDay {
  static daycount = (() => {
    const today = new Date();
    const y = today.getFullYear();
    const start = new Date(y, 3, 12);
    const end = new Date(y, 9, 13);
    const msPerDay = 86400000;
    const totalDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);

    return today < start ? 0
         : today > end   ? totalDays
         : Math.floor((today.getTime() - start.getTime()) / msPerDay);
  })();

  static setDayCount() {
    const el = document.getElementById('daycount');
    el ? el.textContent = String(NDay.daycount)
       : console.error("Error: Element with id 'daycount' not found.");
  }

  static setNDayCountry() {
    const exposition = Exposition.ndayMap[NDay.daycount];
    const el = document.getElementById('ndaycountry');
    if (!el) {
      console.error("Error: Element with id 'ndaycountry' not found.");
      return;
    }

    if (exposition) {
      el.innerHTML = exposition.render();
    } else {
      el.textContent = ''; // 該当がなければ空に
    }
  }
}
