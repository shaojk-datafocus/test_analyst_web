module.exports = {
  devServer: {
    port: 8080,
    proxy: 'http://localhost:5000'
    // proxy: {
    //   '/example': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true
    //   }
    // }
  }
}
