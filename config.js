var Config = {
  dist: './dist',
  src: './src',
  tmp: './.tmp',
  github: {
    context: {
      BASE_URL: 'polymer-seed/dist/'
    }
  },
  production: {
    context: {
      BASE_URL: ''
    }
  }
};

module.exports = Config;