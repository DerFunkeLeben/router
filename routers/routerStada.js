const Router = require('./router');

class RouterStada extends Router {
  constructor(settings) {
    super(settings);
    this._scenario = settings.scenario;
    this._history = settings.history;
    this._currSlide = this._history.location.pathname.replace('/', '');
    this._scene = settings.scenario['default'];
    this._ribs = settings.ribs;
    this._sceneName = 'default';
    this._slideStore = {};
    this._menuIsOpen = false;
    this._resetStore = true;
    this.getQueryVariable = settings.getQueryVariable;
    settings.history.listen((location) => {
      this._currSlide = location.pathname.replace('/', '');
      this._sceneName = this.getSearchParams(location.search);
    });
  }
  getSearchParams(query) {
    const params = new URLSearchParams(query);
    const scene = params.get('scene');
    return scene;
  }

  setStoreItem(key, value) {
    return (this._slideStore = { ...this._slideStore, [key]: value });
  }

  getStoreItem(key) {
    if (key) return this._slideStore[key];
    else return this._slideStore;
  }

  saveStore() {
    this._resetStore = false;
  }

  to(slide, flow) {
    if (flow) {
      this._scene = this._scenario[flow];
      if (flow !== this._sceneName) {
        this._prevSceneName = this._sceneName;
        this._sceneName = flow;
      }
    }
    const isVisit = this.getQueryVariable('isVisit');
    this._history.push(`${slide}?scene=${flow || this._sceneName}&isVisit=${isVisit}`);
    this._currSlide = slide;
    this._resetStore && this.setStoreItem(slide, null);
    this._resetStore = true;
  }

  getSlide(turn) {
    const currIdx = this._scene.indexOf(this._currSlide);
    let nextIdx = turn === 'next' ? currIdx + 1 : currIdx - 1;
    let nextSlide = this._scene[nextIdx];

    if (currIdx === 0 && turn === 'prev') {
      const homeSlide = this._scenario['default'];
      nextSlide = homeSlide;
    }
    return nextSlide === null ? undefined : nextSlide;
  }

  goRib(rib) {
    if (typeof rib === 'string') return this.to(this._scenario[rib][0], rib);
    else if (rib.slide) return this.to(rib.slide, rib.scene);
    else return this.to(this._scenario[rib.scene][0], rib.scene);
  }

  next() {
    this.findSetScene();

    const nextSlide = this.getSlide('next');
    !nextSlide && this.shakeSlide();
    if (this._ribs[this._currSlide] && this._ribs[this._currSlide].next === null) {
      this.shakeSlide();
      return;
    }
    if (this._ribs[this._currSlide] && this._ribs[this._currSlide].next) {
      if (typeof this._ribs[this._currSlide].next === 'function') {
        if (this._ribs[this._currSlide].next() === null || this._ribs[this._currSlide].next() === undefined) {
          this.shakeSlide();
          return;
        }
        if (this._ribs[this._currSlide].next() === 'next' && nextSlide === undefined) {
          this.shakeSlide();
          return;
        }
        if (this._ribs[this._currSlide].next() === 'next' && nextSlide !== undefined) {
          return this.to(nextSlide, this._sceneName);
        }
        const rib = this._ribs[this._currSlide].next();
        this.goRib(rib);
      } else {
        const rib = this._ribs[this._currSlide].next;
        this.goRib(rib);
      }
    }

    if (nextSlide !== undefined) {
      return this.to(nextSlide, this._sceneName);
    }
  }

  prev() {
    if (this._ribs[this._currSlide] && this._ribs[this._currSlide].prev === null) {
      return;
    }
    if (this._ribs[this._currSlide] && this._ribs[this._currSlide].prev) {
      if (typeof this._ribs[this._currSlide].prev === 'function') {
        if (this._ribs[this._currSlide].prev() === null) return;
        const rib = this._ribs[this._currSlide].prev();
        this.goRib(rib);
      } else {
        const rib = this._ribs[this._currSlide].prev;
        this.goRib(rib);
      }
    }
    this._history.goBack();
  }

  findSetScene() {
    this._scene = this._scenario[this._sceneName];
  }

  shakeSlide() {
    console.log('s');
    const slide = document.querySelector('.slide');
    slide.classList.add('shake');
    setTimeout(() => slide.classList.remove('shake'), 1000);
  }
}

module.exports = RouterStada;
