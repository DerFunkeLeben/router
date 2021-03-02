const Router = require('./router');

class RouterStada extends Router {
  constructor(settings) {
    super(settings);
    this._scenObj = settings.scenObj;
    this._history = settings.history;
    this._currSlide = this._history.location.pathname.replace('/', '');
    this._scene = settings.scenObj['default'];
    this._ribs = settings.ribs;
    this._sceneName = 'default';
    this._slideStore = {};
    this._menuIsOpen = false;
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

  setStoreItem(key = this._currSlide, value) {
    return (this._slideStore = { ...this._slideStore, [key]: value });
  }

  getStoreItem(key = this._currSlide) {
    if (key) return this._slideStore[key];
    else return this._slideStore;
  }

  to(slide, flow) {
    if (flow) {
      this._scene = this._scenObj[flow];
      if (flow !== this._sceneName) {
        this._prevSceneName = this._sceneName;
        this._sceneName = flow;
      }
    }
    const isVisit = this.getQueryVariable('isVisit');
    this._history.push(`${slide}?scene=${flow || this._sceneName}&isVisit=${isVisit}`);
    this._currSlide = slide;
  }

  getSlide(turn) {
    const currIdx = this._scene.indexOf(this._currSlide);
    let nextIdx = turn === 'next' ? currIdx + 1 : currIdx - 1;
    let nextSlide = this._scene[nextIdx];

    if (currIdx === 0 && turn === 'prev') {
      const homeSlide = this._scenObj['default'];
      nextSlide = homeSlide;
    }
    return nextSlide === null ? undefined : nextSlide;
  }

  next() {
    this.findSetScene();

    const nextSlide = this.getSlide('next');
    if (this._ribs[this._currSlide] && this._ribs[this._currSlide].next === null) {
      return;
    }
    if (this._ribs[this._currSlide] && this._ribs[this._currSlide].next) {
      if (typeof this._ribs[this._currSlide].next === 'function') {
        if (this._ribs[this._currSlide].next() === null || this._ribs[this._currSlide].next() === undefined) {
          return;
        }
        if (this._ribs[this._currSlide].next() === 'next' && nextSlide === undefined) {
          return;
        }
        if (this._ribs[this._currSlide].next() === 'next' && nextSlide !== undefined) {
          return this.to(nextSlide, this._sceneName);
        }
        const { slide, scene } = this._ribs[this._currSlide].next();
        return this.to(slide, scene);
      } else {
        const { slide, scene } = this._ribs[this._currSlide].next;
        return this.to(slide, scene);
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
        const { slide, scene } = this._ribs[this._currSlide].prev();
        return this.to(slide, scene);
      } else {
        const { slide, scene } = this._ribs[this._currSlide].prev;
        return this.to(slide, scene);
      }
    }
    this._history.goBack();
  }

  findSetScene() {
    this._scene = this._scenObj[this._sceneName];
  }
}

module.exports = RouterStada;
