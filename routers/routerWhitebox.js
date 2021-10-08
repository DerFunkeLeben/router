const Router = require('./router');

class RouterWhitebox extends Router {
  constructor(settings) {
    super(settings);

    this.__slidesNames = window.slidesNames;
  }

  __routerAdapter(slide, scene, presentation) {
    const slideName = presentation + '_' + slide;
    super.__setCurrScen(scene);

    if (this.__slidesNames[slide] === undefined) {
      throw new Error(`Данный слайд "${slide}" отсутствует!`);
    }

    if (
      (this.__isChrome && window.navigator.platform === 'Win32') ||
      (this.__isChrome && window.navigator.platform.includes('Mac'))
    ) {
      document.location = `/${presentation}/${slideName}/${slideName}.html#`;
    } else {
      CommunicateEmbedded.navigate(this.__slidesNames[slide]);
    }
  }
}

module.exports = RouterWhitebox;
