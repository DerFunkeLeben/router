const Router = require('./router');

class RouterCTMobile extends Router {
  constructor(settings) {
    super(settings);
    this.__slidesOrder = window.slidesOrder;
  }

  __routerAdapter(slide, scene, presentation) {
    const slideOrder = this.__slidesOrder[slide];
    if (slideOrder === undefined) {
      throw new Error(`
      Для слайда "${slide}" нет порядкового номера, по которому приложение должно будет перейти.
      Добавь этот номер в "src/pres_config/slidesToOrderRel.js".
           `);
    }
    if (this.__isChrome) {
      console.log(slideOrder);
      console.log(`${presentation}/${presentation}_${slide}.html`);
      document.location = `/${presentation}/${presentation}_${slide}.html`;
    } else {
      console.log(slide, slideOrder);
      CTAPPgoToSlide(slideOrder);
    }
  }
}

module.exports = RouterCTMobile;
