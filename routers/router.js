class Router {
  constructor(settings) {
    console.log(settings);
    this.__isChrome = navigator.vendor === 'Google Inc.';
    this.__redefinitionConsole();
    this.__sessionStorageAdapter = this.sessionStorageAdapter();
    this.__checkNeedConsole('init');
    this.__archivePresId = settings.archivePresId;
    this.__allPres = settings.allPres;
    this.__defaultScene = 'default';
    this.__currPres = settings.currPres;
    this.__currPresConfig = this.__allPres[this.__currPres];
    this.__currScen =
      settings.currScen || this.__sessionStorageAdapter.getItem('currScen') || document.location.hash.replace('#', '');
    this.__currSlide = settings.currSlide;
    this.__isDopSlide = JSON.parse(this.__sessionStorageAdapter.getItem('isDopSlide')) || false;
    this.__slideStore = JSON.parse(this.__sessionStorageAdapter.getItem('slideStore')) || {};
    this.__customBranch = JSON.parse(this.__sessionStorageAdapter.getItem('customBranch')) || [];
    this.__addCustomBranchToPres();
    this.__getSlideInfo();
    this.__consolePassword = ['up', 'up', 'down', 'up', 'down', 'down'];
    this.__consolePasswordInput = [];
    this.__consoleActive = JSON.parse(this.__sessionStorageAdapter.getItem('consoleActive')) || false;
    this.__returnFromAnchor = false;
    this.__returnFromPres = false;
    this.__flagList = settings.routerFlags || [];
  }

  sessionStorageAdapter() {
    return {
      getItem: (item) => sessionStorage.getItem(item),
      setItem: (item, key) => sessionStorage.setItem(item, key),
    };
  }

  setCustomBranch(customBranch) {
    this.__saveCustomBranch(customBranch);
    this.__addCustomBranchToPres();
  }

  __saveCustomBranch(customBranch) {
    this.__sessionStorageAdapter.setItem('customBranch', JSON.stringify(customBranch));
    this.__customBranch = customBranch;
  }

  __addCustomBranchToPres() {
    if (this.__currPres) this.__currPresConfig.scenario['customBranch'] = this.__customBranch;
  }

  __redefinitionConsole() {
    const consoleDiv = document.querySelector('#console');
    const textDiv = consoleDiv.querySelector('#text');
    if (!consoleDiv || !textDiv)
      console.warn(
        'ВНИМАНИЕ\n в layout.jade отсутсвутет #сonsole и/или #text\n это приведет к невозможности вызвать консоль на планшете!',
      );
    if (!this.__isChrome && consoleDiv && textDiv) {
      const iscrollConsole = new window.IScroll(consoleDiv);
      console.log = (...args) => {
        try {
          textDiv.innerHTML += `\n<p>${JSON.stringify(args)}<p>`;
        } catch (error) {
          console.log('прости кажется там ссылка на DOM-элемент, не могу ее отрендерить');
        }
        iscrollConsole.refresh();
      };
      console.error = (...args) => {
        textDiv.innerHTML += `\n<p class='error'>${JSON.stringify(args)}<p>`;
        iscrollConsole.refresh();
      };
    }
  }

  __checkNeedConsole(direction) {
    if (this.__consoleActive === true) return;
    console.log(direction);
    if (direction === 'init') {
      this.__sessionStorageAdapter.getItem('consoleActive') && this.__showConsole();
    } else {
      this.__consolePasswordInput.push(direction);
      console.log(this.__consolePasswordInput.toString() === this.__consolePassword.toString());
      console.log(this.__consolePasswordInput, this.__consolePassword);
      if (this.__consolePasswordInput.toString() === this.__consolePassword.toString()) this.__showConsole();
    }
  }

  __showConsole() {
    const consoleDiv = document.querySelector('#console');
    consoleDiv.classList.add('console_active');
    this.__consoleActive = true;
    this.__sessionStorageAdapter.setItem('consoleActive', 'true');
  }

  __getSlideInfo() {
    try {
      //первый вход в презу, установка ветки 'default'
      if (!this.__currScen) this.__currScen = this.__defaultScene;

      //режим верстки
      if (this.__currPres === '') return;
      //определение принадлежности слайда установленной ветке
      if (!this.__currPresConfig.scenario[this.__currScen].includes(this.__currSlide)) {
        this.__currScen = this.__searchCurrSlideScen();
        this.__setCurrScen(this.__currScen);
        console.warn('найдена новая ветка');
      }
      this.__currSlideIndex = this.__currPresConfig.scenario[this.__currScen].indexOf(this.__currSlide);
      this.__nextSlide = this.__getNextSlide();
      this.__prevSlide = this.__getPrevSlide();
      this.__rib = this.__getRib('next');
      this.__reverseRib = this.__getRib('prev');
    } catch (error) {
      this.__navError = error;
      console.error(error);
    }
  }

  getCurrScen() {
    return this.__currScen;
  }

  getCurrScenArr() {
    return this.__currPresConfig.scenario[this.__currScen];
  }

  __getNextSlideOnCustomBranchOff() {
    const scenario = router.__allPres[router.__currPres].scenario.customBranch;
    const prevSlides = JSON.parse(sessionStorage.getItem('historyArr'));
    const prevSlide = prevSlides[prevSlides.length - 1];
    const prevSlideIndex = scenario.indexOf(prevSlide.slide);
    const nextSlide = scenario[prevSlideIndex + 1];
    return nextSlide;
  }

  __getNextSlide() {
    const nextSlide = this.__currPresConfig.scenario[this.__currScen][this.__currSlideIndex + 1];
    if (nextSlide !== undefined) return nextSlide;
    else return null;
  }

  __getPrevSlide() {
    const prevSlide = this.__currPresConfig.scenario[this.__currScen][this.__currSlideIndex - 1];
    if (prevSlide !== undefined) return prevSlide;
    else return null;
  }

  __getRib(direction) {
    const ribName = this.__currSlide;
    const rib = this.__currPresConfig.ribs[ribName] ? this.__currPresConfig.ribs[ribName][direction] : null;
    return rib;
  }

  __searchSlideScen(slide) {
    let foundScen = '';
    const nonScenNames = ['ribs', 'menu', 'config', 'dop_slides', 'video', 'еще что-то'];
    const isDefault = this.__currPresConfig.scenario['default'].includes(slide);
    if (isDefault) return 'default';
    Object.keys(this.__currPresConfig.scenario).forEach((scen) => {
      if (nonScenNames.includes(scen)) return;
      if (this.__currPresConfig.scenario[scen].includes(slide)) foundScen = scen;
    });
    if (foundScen === '') {
      console.warn(`scen for ${slide} not found`);
      return null;
    } else return foundScen;
  }

  __searchCurrSlideScen() {
    return this.__searchSlideScen(this.__currSlide);
  }

  setStoreItem(key, value) {
    console.log('Router.setStoreItem', key, value);
    let newStore = {};
    if (this.__slideStore === null) newStore[key] = value;
    else newStore = { ...this.__slideStore, [key]: value };
    this.__sessionStorageAdapter.setItem('slideStore', JSON.stringify(newStore));
    this.__slideStore = newStore;
    return newStore;
  }

  getStoreItem(key) {
    if (this.__slideStore)
      if (key) return this.__slideStore[key];
      else return this.__slideStore;
    else {
      console.log('Store еще не был создан');
      return null;
    }
  }

  setNextSlide(slide) {
    this.__nextSlide = slide;
  }

  setNextSlideScen(scen) {
    this.__currScen = scen;
  }

  __setCurrScen(scen) {
    if (/^dop_.*/.test(scen)) this.__sessionStorageAdapter.setItem('isDopSlide', true);
    else this.__sessionStorageAdapter.setItem('isDopSlide', false);
    this.__sessionStorageAdapter.setItem('currScen', scen);
  }

  goNextSlide() {
    this.__goNeighbour(this.__nextSlide, this.__rib);
  }

  goPrevSlide() {
    if (this.__reverseRib) {
      this.__goNeighbour(this.__prevSlide, this.__reverseRib);
    } else {
      if (this.__flagList.includes('SWIPE_RIGHT_WORK_WITH_SCEN_NO_HISTORY')) {
        if (!this.__prevSlide) return console.warn('prev slide is null');
        this.to(this.__prevSlide, this.__currScen, this.__currPres);
      } else {
        const { slide, scen, pres } = this.__historyPop();
        this.__routerAdapter(slide, scen, pres);
      }
    }
  }

  __getNextSlideByRib(ribProp) {
    return new Function('return ' + ribProp)()() || null;
  }

  __goNeighbour(slideProp, ribProp) {
    try {
      if (ribProp) {
        if (typeof ribProp === 'string' && (ribProp.match('function') || ribProp.match('() =>'))) {
          const tergetRib = this.__getNextSlideByRib(ribProp);
          if (!tergetRib)
            if (slideProp) return this.to(slideProp, this.__currScen, this.__currPres);
            else return this.shakeSlide();

          return this.to(tergetRib.slide, tergetRib.scene, tergetRib.pres);
        } else return this.to(ribProp.slide, ribProp.scene, ribProp.pres);
      } else if (slideProp) return this.to(slideProp, this.__currScen, this.__currPres);
      else return console.warn('next slide is null');
    } catch (error) {
      this.__navError = error;
      console.error(error);
    }
  }

  to(slide, scen, presentation) {
    if (slide === this.__currSlide && scen === this.__currScen) return;
    const pres = presentation ? presentation : this.__currPres;
    if (this.__returnFromPres) {
      this.__historyPop();
    }
    if (this.__returnFromAnchor || this.__returnFromPres) {
      this.__returnFromAnchor = false;
      this.__returnFromPres = false;
    } else {
      this.__historyPush();
    }

    this.__routerAdapter(slide, scen, pres);
  }

  __routerAdapter(slide, scen, presentation) {
    let newSlide = `${presentation}_${slide}`;
    let newPres = `${presentation}`;
    console.log(scen);
    this.__setCurrScen(scen);
    if (this.__isChrome) document.location = `/${newPres}/${newSlide}/index.html#${scen}`;
    else document.location = `veeva:gotoSlide(${newSlide}.zip, ${newPres})`;
  }

  setPrevPresentation() {
    this.__sessionStorageAdapter.setItem('prevPresSlide', this.__currSlide);
    this.__sessionStorageAdapter.setItem('prevPresScene', this.__currScen);
    this.__sessionStorageAdapter.setItem('prevPresentation', this.__currPres);
  }

  setReturnToPrevPresentation(slide) {
    const path = {
      presentation_id: this.__currPres,
      slide_filename: `${this.__currPres}_${slide ? slide : 'start_01'}.zip`,
    };
    this.__sessionStorageAdapter.setItem('az-visits-return-slide', JSON.stringify(path));
  }

  //якори
  pushAnchor() {
    const anchor = this.__currSlide + ',' + this.__currScen + ',' + this.__currPres;
    const anchors = JSON.parse(this.__sessionStorageAdapter.getItem('anchors')) || [];
    console.log(anchor);
    anchors.push(anchor);
    const anchorsJSON = JSON.stringify(anchors);
    this.__sessionStorageAdapter.setItem('anchors', anchorsJSON);
  }

  goToAnchor() {
    const anchors = JSON.parse(this.__sessionStorageAdapter.getItem('anchors'));
    if (!anchors || anchors.length < 1) return;
    const anchor = anchors.pop();
    const anchorsJSON = JSON.stringify(anchors);
    this.__sessionStorageAdapter.setItem('anchors', anchorsJSON);

    const historyArr = JSON.parse(this.__sessionStorageAdapter.getItem('historyArr'));
    const reversedHistory = historyArr.reverse();
    const anchorIndex = reversedHistory.findIndex((historyStep) => {
      const { slide, scen, pres } = historyStep;
      const historyStepStr = `${slide},${scen},${pres}`;
      return historyStepStr === anchor;
    });
    if (anchorIndex !== -1) {
      const newHistory = reversedHistory.slice(anchorIndex + 1).reverse();
      this.__sessionStorageAdapter.setItem('historyArr', JSON.stringify(newHistory));
    }
    this.__returnFromAnchor = true;
    this.to(...anchor.split(','));
  }

  cutAnchors(slide, scene, presentation) {
    const pres = presentation || this.__currPres;
    const anchors = JSON.parse(this.__sessionStorageAdapter.getItem('anchors'));
    if (!anchors || anchors.length < 1) return;
    const anchor = slide + ',' + scene + ',' + pres;
    const index = anchors.indexOf(anchor);
    if (index < 0) return;
    anchors.splice(index);
    const anchorsJSON = JSON.stringify(anchors);
    this.__sessionStorageAdapter.setItem('anchors', anchorsJSON);
  }

  clearAnchors() {
    const anchors = [];
    const anchorsJSON = JSON.stringify(anchors);
    this.__sessionStorageAdapter.setItem('anchors', anchorsJSON);
  }

  backFromPres() {
    const slide = this.__sessionStorageAdapter.getItem('prevPresSlide');
    const scene = this.__sessionStorageAdapter.getItem('prevPresScene');
    const pres = this.__sessionStorageAdapter.getItem('prevPresentation');
    if (slide && scene && pres) {
      this.__returnFromPres = true;
      this.to(slide, scene, pres);
    }
  }

  __historyPush() {
    // if (this.__isDopSlide) return;
    let slideArrEl = {
      slide: this.__currSlide,
      scen: this.__currScen,
      pres: this.__currPres,
    };
    let historyArrString;
    let historyArr = this.__sessionStorageAdapter.getItem('historyArr');
    if (!historyArr) historyArrString = JSON.stringify([slideArrEl]);
    else {
      let newHistArr = JSON.parse(historyArr);
      newHistArr.push(slideArrEl);
      historyArrString = JSON.stringify(newHistArr);
    }
    this.__sessionStorageAdapter.setItem('historyArr', historyArrString);
    return slideArrEl;
  }

  __historyPop() {
    let historyArr = JSON.parse(this.__sessionStorageAdapter.getItem('historyArr'));
    if (!historyArr) return;

    let slideArrEl = historyArr.pop();

    this.__sessionStorageAdapter.setItem('historyArr', JSON.stringify(historyArr));
    return slideArrEl;
  }

  rememberHomeSlide() {
    const homeSlide = {
      slide: this.__currSlide,
      scene: this.__currScen,
    };
    this.setStoreItem('homeSlide', homeSlide);
  }

  goToHomeSlide() {
    const homeSlide = this.getStoreItem('homeSlide');
    this.to(homeSlide.slide, homeSlide.scene);
  }

  goToFirstSlide() {
    if (!this.__currPresConfig.scenario) return console.log('verstka mode');
    const targetSlide = this.__currPresConfig.scenario[this.__defaultScene][0];
    this.__sessionStorageAdapter.clear();
    this.to(targetSlide, this.__defaultScene);
  }

  shakeSlide() {
    const slide = document.querySelector('.slide');
    slide.classList.add('shake');
    setTimeout(() => slide.classList.remove('shake'), 1000);
  }
}

module.exports = Router;
