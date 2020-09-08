const Router = require('@onpoint-dev/mpa-router/routers/router');

class RouterCTMobile extends Router {
  constructor(settings) {
    super(settings);
    this.__slidesOrder = window.slidesOrder;
  }

  __routerAdapter(slide, scene, presentation) {
    const slideOrder = this.__slidesToOrderRel[slide];
    if (slideOrder === undefined)
      if (this.__isChrome) {
        //       throw new Error(`
        // Для слайда "${slide}" нет порядкового номера, по которому приложение должно будет перейти.
        // Добавь этот номер в "src/pres_config/slidesToOrderRel.js".
        //      `);
        // console.log(slideOrder)
        document.location.pathname = `${presentation}/${presentation}_${slide}.html`;
      } else {
        console.log(slide, slideOrder);
        CTAPPgoToSlide(slideOrder);
      }
  }
}

module.exports = RouterCTMobile;
