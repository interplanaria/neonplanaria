const env = process.env.NODE_ENV;

const PRODUCTION_API_URL = process.env.PRODUCTION_API_URL || 'https://example.com'
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/0'
const MONGO_INSTANCE_NAME = process.env.MONGO_INSTANCE_NAME || 'planaria-mongo'
const PLANARIUM_PORT = process.env.PLANARIUM_PORT || 7070

module.exports = {
    env,
    MONGO_URI,
    PRODUCTION_API_URL,
    MONGO_INSTANCE_NAME,
    PLANARIUM_PORT
}