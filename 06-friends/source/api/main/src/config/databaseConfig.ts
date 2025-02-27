export default () => ({
  mongo_connection_string: process.env.MONGO_CONNECTION_STRING ? process.env.MONGO_CONNECTION_STRING : 'mongodb://localhost:27017',
  mongo_database_name: process.env.MONGO_DATABASE_NAME ? process.env.MONGO_DATABASE_NAME : 'dsc-demo',
})
