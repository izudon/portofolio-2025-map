import Exposition from './Exposition.js';

export default class NDay {
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
