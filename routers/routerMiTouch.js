const Router = require('./router');

class RouterMiTouch extends Router {
  constructor(settings) {
    super(settings);
    if (Object.keys(window.STATISTIC).includes(this.__currSlide))
      this.__addEventToSaveStat(window.STATISTIC[this.__currSlide]);
  }
  // но кажись там нормальный работает и такое не нужно
  sessionStorageAdapter() {
    if (Boolean(window.parent.context)) {
      return {
        getItem: (item) => window.parent.context.presentations[window.parent.getCurrentPresentation()][item] || null,
        setItem: (item, key) =>
          (window.parent.context.presentations[window.parent.getCurrentPresentation()][item] = key),
      };
    } else
      return {
        getItem: (item) => sessionStorage.getItem(item),
        setItem: (item, key) => sessionStorage.setItem(item, key),
      };
  }

  __routerAdapter(slide, scen, presentation) {
    const newSlide = `${presentation}_${slide}`;
    super.__setCurrScen(scen);
    if (Boolean(window.parent.context)) window.parent.navigateToSequence(newSlide);
    else document.location = `/${presentation}/${newSlide}/index.html#${scen}`;
  }

  __addEventToSaveStat(questions = []) {
    questions.forEach(({ id, answers }) =>
      answers.forEach((answer) =>
        document
          .querySelector(`.${answer.node}`)
          .addEventListener('click', (e) => window.parent.addData(id, answer.id)),
      ),
    );
  }
}

module.exports = RouterMiTouch;
