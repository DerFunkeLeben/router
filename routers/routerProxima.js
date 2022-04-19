const Router = require('./router');

class RouterProxima extends Router {
  constructor(settings) {
    super(settings);
    this.startDuration;
    this.__startDurationSlide();
  }

  __startDurationSlide() {
    this.startDuration = Date.now();
  }

  __getNumberOfSlide(slide) {
    return slidesOrder.slides.find((item) => item.name === slide).position;
  }

  __routerAdapter(slide, scene, presentation) {
    super.__setCurrScen(scene);
    if (typeof Android != 'undefined') {
      const durationOnSlide = ((Date.now() - this.startDuration) / 1000).toFixed();
      window.Android.addSlideNumInfo(
        this.__getNumberOfSlide(this.__currSlide),
        this.__currSlide,
        Number(durationOnSlide),
      );
      document.location.href = `${presentation}_${slide}.html`;
    } else if (this.__isChrome) {
      console.log(`${presentation}/${presentation}_${slide}.html`);
      document.location = `/${presentation}/${presentation}_${slide}.html`;
    } else {
      console.log(slide);
      document.location.href = `${presentation}_${slide}.html`;
    }
  }
}

module.exports = RouterProxima;
