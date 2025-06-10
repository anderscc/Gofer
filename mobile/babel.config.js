module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add any additional babel plugins here
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true
      }]
    ],
  };
};
