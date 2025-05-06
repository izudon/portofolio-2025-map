export default class Entity {
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
