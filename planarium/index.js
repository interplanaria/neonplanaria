const express = require('express')
const app = express()
var machine;
const start = async function(o) {
  console.log("PLANARIUM", "initializing machine...")
  machine = await o.onstart()
  if (o.custom) {
    o.custom({
      core: machine,
      app: app
    })
  }
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views')
  app.use(express.static(__dirname + '/public'))
  const port = o.port || 3000
  const host = o.host
  app.get(/^\/q\/([^\/]+)/, function(req, res) {
    let b64= req.params[0]
    o.onquery({
      query: b64,
      res: res,
      core: machine
    })
  })
  app.get("/query", function(_, res) {
    let defaultQuery = o.default || { v: 3, q: { find: {}, limit: 10 } };
    let code = JSON.stringify(defaultQuery, null, 2);
    res.render('explorer', {
      name: o.name,
      code: code,
    })
  })
  app.get(/^\/query\/([^\/]+)/, function(req, res) {
    let b64= req.params[0]
    let code = Buffer.from(b64, 'base64').toString()
    res.render('explorer', {
      name: o.name, code: code,
    })
  })
<<<<<<< HEAD
  app.get('/', function(_, res) {
=======
<<<<<<< HEAD
  app.get('/', function(_, res) {
=======
  app.get('/', function(req, res) {
>>>>>>> 17d565b76f6ce1e337fccd8399ed8a7a0e34643e
>>>>>>> 22089f397ed962b2d88b27d45bc199cd259017ab
    res.sendFile(__dirname + "/public/index.html")
  })
  if (host) {
    app.listen(port, host, () => {
      console.log("PLANARIUM", `listening on ${host}:${port}!`)
    })
  } else {
    app.listen(port, () => {
      console.log("PLANARIUM", `listening on port ${port}!`)
    })
  }
}
module.exports = {
  start: start
}
