const Router = require('./router');

class RouterResco extends Router {
  constructor(settings) {
    super(settings);
    if (Object.keys(window.STATISTIC).includes(this.__currSlide))
      this.__addEventToSaveStat(window.STATISTIC[this.__currSlide]);
  }

  __addEventToSaveStat(questions = []) {
    questions.forEach(({ idWithSlide, answers, manualHandle }) => {
      if (manualHandle) return;
      answers.forEach(({ node, text }) =>
        document.querySelector(`.${node}`).addEventListener('click', (e) => {
          console.log('ahahahah');
          ClmBridge.setValue(
            idWithSlide,
            text,
            () => {},
            () => {},
          );
        }),
      );
    });
  }

  __routerAdapter(slide, scen, presentation) {
    const { scenario } = this.__currPresConfig;
    const [initSlide] = scenario[this.__defaultScene];
    super.__setCurrScen(scen);
    const newSlide = slide;
    const isDesktop = navigator.platform === 'Win32' || navigator.platform === 'MacIntel';
    if (isDesktop) window.location = `/${presentation}/build/${newSlide}.html#${scen}`;
    else window.location = `${newSlide}.html`;
  }
}

module.exports = RouterResco;
