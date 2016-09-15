function App() {
  this.name = 'public-transportation!';
  this._app = null;
  this.baseURL = '/* @echo BASE_URL */' || '';
  this._app = document.querySelector('#app');
    
  // only load webcomponent polyfill if needed
  if(!this.supportWebComponents()) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'bower_components/webcomponentsjs/webcomponents-lite.min.js';
    script.onload = this.init;
    document.head.appendChild(script);
  } else {
    this.init();
  }
}

/**
   * Check browser support for webcomponents
   *
   */
App.prototype.supportWebComponents = function() {
  return 'registerElement' in document
    && 'import' in document.createElement('link')
    && 'content' in document.createElement('template');
};

/**
 * Application is now ready
 *
 */
App.prototype.init = function() {
  console.log('Application is now ready');
};

window.app = new App();