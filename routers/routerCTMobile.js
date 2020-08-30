const Router = require('@onpoint-dev/mpa-router/routers/router');

class RouterCTMobile extends Router {

  initSwipeHandlers() {
    this.__swipeLeftEvent = new Event('swipeleft', { bubbles: true })
    this.__swipeRightEvent = new Event('swiperight', { bubbles: true })
  }

  __routerAdapter(slide, scene, presentation) {
//     const slideOrder = this.__slidesToOrderRel[slide]
//     if (slideOrder === undefined)
//       throw new Error(`
// Для слайда "${slide}" нет порядкового номера, по которому приложение должно будет перейти.
// Добавь этот номер в "src/pres_config/slidesToOrderRel.js".
//     `)
    if (this.__isChrome) {
      // console.log(slideOrder)
      document.location.pathname = `${presentation}/${presentation}_${slide}.html`
    } else {
      console.log(slide, slideOrder)
      CTAPPgoToSlide(slideOrder)
    }
  }
}

module.exports = RouterCTMobile;
