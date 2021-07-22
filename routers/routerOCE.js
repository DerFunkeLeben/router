const Router = require('./router');
const { registerHandleSurveyClick, registerSurveyListner, isSlideWithStats, getSurveyJSON } = require('../oceSurvey');

function getDataFromConfig() {
  // if (navigator.vendor === 'Google Inc.') return {};

  // const data = document.querySelector('#config');
  // while (data.innerHTML === '{{{.}}}') {}
  // return (window.configData = JSON.parse(data.innerHTML));

  if ('Google Inc.' === navigator.vendor) return {};
  const data = document.querySelector('script[id=config]');
  while (data.innerHTML === 'window.configData = {{{.}}};') {}
  return window.configData;
}

function getDataFromGlobalState() {
  try {
    if (window.configData.state !== '') {
      const globalState = JSON.parse(window.configData.state);
      Object.keys(globalState).forEach((key) => {
        if (typeof globalState[key] === 'string') {
          sessionStorage.setItem(key, globalState[key]);
        } else {
          sessionStorage.setItem(key, JSON.stringify(globalState[key]));
        }
      });
    } else return console.log('Global state is empty');
  } catch (error) {
    console.log('getDataFromGlobalState');
    console.log(JSON.stringify(error));
  }
}

function updateGlobalStateAndRouter() {
  getDataFromConfig();
  getDataFromGlobalState();
  getSurveyJSON(window.router.__currPres);
  window.router.__currScen = window.router.__sessionStorageAdapter.getItem('currScen');
  window.router.__getSlideInfo();
}

class RouterOCE extends Router {
  constructor(settings) {
    getDataFromConfig();
    getDataFromGlobalState();
    super(settings);
    if (Object.keys(window.STATISTIC).includes(this.__currSlide))
      this.__addValueToSaveStat(window.STATISTIC[this.__currSlide]);
    if (isSlideWithStats()) {
      registerSurveyListner();
      registerHandleSurveyClick();
      getSurveyJSON(settings.currPres);
    }
    this.__updateStateOnOpenSlide();
    this.__setSlideIdVocablury();
    this.__blockCLMSwipe();
  }

  __addValueToSaveStat(questions = []) {
    questions.forEach(({ answers }) =>
      answers.forEach((answer) => (document.querySelector(`.${answer.node}`).dataset.value = answer.id)),
    );
  }

  __updateStateOnOpenSlide() {
    /*
     * вот тут не уверен, что все будет корректно, логика в общем такая:
     * слайд открывается впервый раз, происходит инициализация роутера
     * пользователь уходит со слайда
     * пользователь возвращается на слайд
     * по скольку слайд был открыт ранее он не загружается занова
     * поэтому мы просто обновляем сессион сторадж слайда
     * и вроде все должно работать
     */
    if (!this.__isChrome) window.CLMPlayer.registerEventListener('viewappearing', updateGlobalStateAndRouter);
    /*
     * была идея удалять роутер каждый раз при выходе со слайда и инициализировать при входе
     * но данная идея не оч хороша, потому что не смог придумать как инициализировать роутер внутри роутера
     */
    // window.CLMPlayer.registerEventListener('viewdisappearing', () => (window.router = undefined));
  }

  __setSlideIdVocablury() {
    this.__slideIdVocablury = {};
    if (!this.__isChrome)
      window.configData.presentations[window.configData.presentationIndex].sequences.forEach(
        (seq) => (this.__slideIdVocablury[seq.slides[0].name] = seq.id),
      );
  }

  /*
   * слайды запускаются в iframe поэтому общего sessionStorage у них нет, поэтому мы при каждой записи собираем наш sessionStorage и записываем его в глобальный
   */
  __shareSessionStorage() {
    if (this.__isChrome) return;
    const globalState = {};
    Object.keys(sessionStorage).forEach((key) => {
      const firstElem = sessionStorage[key][0];
      globalState[key] =
        firstElem === '[' || firstElem === '{' || firstElem === '"'
          ? JSON.parse(sessionStorage[key])
          : sessionStorage[key];
    });
    window.CLMPlayer.saveState(JSON.stringify(globalState));
  }

  sessionStorageAdapter() {
    if (!this.__isChrome) {
      return {
        getItem: (item) => sessionStorage.getItem(item),
        setItem: (item, key) => {
          sessionStorage.setItem(item, key);
          this.__shareSessionStorage();
        },
      };
    } else
      return {
        getItem: (item) => sessionStorage.getItem(item),
        setItem: (item, key) => sessionStorage.setItem(item, key),
      };
  }

  __blockCLMSwipe() {
    if (!this.__isChrome) window.CLMPlayer.defineNoSwipeRegion('region', 0, 0, 1024, 768);
    else console.log('you are in comp');
  }

  __routerAdapter(slide, scen, presentation) {
    const newSlide = `${presentation}_${slide}`;
    const slideCLMName = `01_${newSlide}.html`;
    this.__setCurrScen(scen);
    if (this.__isChrome) return (document.location = `/${presentation}/${newSlide}/${slideCLMName}#${scen}`);
    else {
      const sequenceId = this.__slideIdVocablury[slideCLMName];
      return window.CLMPlayer.gotoSlide(sequenceId, slideCLMName, 'swipeleft');
    }
  }
}

module.exports = RouterOCE;
