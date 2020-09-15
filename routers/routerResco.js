const Router = require('./router');

class RouterResco extends Router {
  __routerAdapter(slide, scen, presentation) {
    super.__setCurrScen(scen);
    const isDesktop = navigator.platform === 'Win32' || navigator.platform === 'MacIntel';
    if (isDesktop) document.location = `/${presentation}/${slide}.html#${scen}`;
    else window.location = `${slide}.html`;
  }
}

module.exports = RouterResco;
