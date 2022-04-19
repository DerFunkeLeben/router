const Router = require('./router');

class RouterTerrasoft extends Router {
  constructor(settings) {
    super(settings);
    this.hrefOrigin = document.location.href.split('/' + CURRENT_PRESENTATION + '/')[0];
    console.log('this.hrefOrigin===', this.hrefOrigin);
  }

  __routerAdapter(slide, scen, presentation) {
    const newSlide = `${presentation}_${slide}`;
    super.__setCurrScen(scen);

    if (this.__isChrome) window.location.replace(`${this.hrefOrigin}/${presentation}/${newSlide}/${newSlide}.html`);
    else {
      window.location.replace(`${this.hrefOrigin}/${presentation}/${newSlide}/${newSlide}.html`);
    }
  }
}

module.exports = RouterTerrasoft;
