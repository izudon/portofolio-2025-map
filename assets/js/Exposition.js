import Entity from './Entity.js';
import Facility from './Facility.js';

export default class Exposition extends Entity {
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
      .map(e => {
        const cls = e.fid ? "exhibitor" : "non-exhibitor";
        const dataAttr = e.fid ? `data-fid="${e.fid}"` : "";
  
        return `
          <li class="${cls}" ${dataAttr}>
            <span class="sign">${e.sign}</span>
            <span class="name">${e.name_ja}</span>
          </li>
        `;
      })
      .join("");
  
    ul.innerHTML = html;

    ul.addEventListener("click", (event) => {
      const li = event.target.closest("li.exhibitor");
      if (!li) return;

      const fid = li.dataset.fid;
      if (fid && typeof Facility?.raise === "function") {
        Facility.raise(fid);
      }
    });
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

