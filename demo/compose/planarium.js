const {planarium} = require("neonplanaria")
const bitquery = require('bitquery')

const config = require('./config')

planarium.start({
  name: "<{name}>",
  port: config.PLANARIUM_PORT,
  onstart: async function () {
    let db = await bitquery.init({url: config.MONGO_URI, address: "planaria"});
    return {db: db};
  },
  onquery: function (e) {
    let code = Buffer
      .from(e.query, 'base64')
      .toString()
    let req = JSON.parse(code)
    if (req.q && req.q.find) {
      e
        .core
        .db
        .read("planaria", req)
        .then(function (result) {
          e
            .res
            .json(result)
        })
    } else {
      e
        .res
        .json([])
    }
  }
})
