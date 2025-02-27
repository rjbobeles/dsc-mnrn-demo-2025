export default () => ({
  api_prefix: 'api',
  version: '0.0.0',
  http_port: 4000,
  name: process.env.NAME ? process.env.NAME : '',
  production_features: process.env.PRODUCTION_FEATURES ? process.env.PRODUCTION_FEATURES === 'true' : false,
  environment_name: process.env.ENVIRONMENT_NAME ? process.env.ENVIRONMENT_NAME : 'development',
})
