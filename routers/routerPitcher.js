const Router = require('@onpoint-dev/mpa-router/routers/router');

class RouterPitcher extends Router {
  constructor(settings) {
    super(settings);
    this.hrefOrigin = document.location.href.split('/' + CURRENT_PRESENTATION + '/')[0];
  }

  __routerAdapter(slide, scen, presentation) {
    const newSlide = `${presentation}_${slide}`;
    super.__setCurrScen(scen);

    document.location = `${this.hrefOrigin}/${presentation}/${newSlide}/${newSlide}.html#${scen}`;
  }
}

module.exports = RouterPitcher;
