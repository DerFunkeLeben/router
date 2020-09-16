const Router = require('./router');

class RouterResco extends Router {
  __routerAdapter(slide, scen, presentation) {
    const { scenario } = this.__currPresConfig;
    const [initSlide] = scenario[this.__defaultScene];
    super.__setCurrScen(scen);
    const newSlide = slide === initSlide ? 'index' : slide;
    const isDesktop = navigator.platform === 'Win32' || navigator.platform === 'MacIntel';
    if (isDesktop) window.location = `/${presentation}/build/${newSlide}.html#${scen}`;
    else window.location = `${newSlide}.html`;
  }
}

module.exports = RouterResco;
