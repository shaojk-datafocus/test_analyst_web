module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://192.168.0.99',
        target: 'http://localhost:5000',
        pathRewrite: {
          '^/api': ''
        },
        changeOrigin: true
      }
    }
  },
  publicPath: './'
}
