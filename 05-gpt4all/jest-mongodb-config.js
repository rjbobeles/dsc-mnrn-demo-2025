module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '8.0.3',
      skipMD5: true,
    },
    instance: {
      dbName: 'dsc-demo',
    },
    autoStart: false,
  },
}
