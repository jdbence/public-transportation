class App {
  name = 'public-transportation!';
  _app = null;
  baseURL = '/* @echo BASE_URL */' || '';
  
  constructor() {
    this._app = document.querySelector('#app');
    
    // only load webcomponent polyfill if needed
    if(!this.supportWebComponents()) {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'bower_components/webcomponentsjs/webcomponents-lite.js';
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
  supportWebComponents() {
    return 'registerElement' in document
      && 'import' in document.createElement('link')
      && 'content' in document.createElement('template');
  }
  
  /**
   * Application is now ready
   *
   */
  init = () => {
    console.log('Application is now ready');
  }
}

window.app = new App();