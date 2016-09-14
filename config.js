var Config = {
  dist: './dist',
  src: './src',
  tmp: './.tmp',
  github: {
    context: {
      BASE_URL: 'public-transportation/dist/'
    }
  },
  production: {
    context: {
      BASE_URL: ''
    }
  }
};

module.exports = Config;