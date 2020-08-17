const Router = require('./router');

class RouterVeeva extends Router {
  createCall(text, slide, callback) {
    var callClickStream = {};
    callClickStream.Track_Element_Description_vod__c = text;
    callClickStream.Track_Element_Id_vod__c = slide;
    com.veeva.clm.createRecord('Call_Clickstream_vod__c', callClickStream, callback);
  }

  __routerAdapter(slide, scen, presentation) {
    const newSlide = `${presentation}_${slide}`;
    super.__setCurrScen(scen);
    if (this.__isChrome) document.location = `/${presentation}/${newSlide}/index.html#${scen}`;
    else {
      if (this.__flagList.includes('DONT_USE_PRES_ID')) document.location = `veeva:gotoSlide(${newSlide}.zip`;
      else document.location = `veeva:gotoSlide(${newSlide}.zip), ${presentation})`;
    }
  }
}

module.exports = RouterVeeva;
