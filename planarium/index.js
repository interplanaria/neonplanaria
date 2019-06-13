const express = require('express')
const app = express()
var machine;
const start = async function(o) {
  console.log("PLANARIUM", "initializing machine...")
  machine = await o.onstart()
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views')
  app.use(express.static(__dirname + '/public'))
  const port = o.port || 3000
  app.get(/^\/q\/([^\/]+)/, function(req, res) {
    let b64= req.params[0]
    o.onquery({
      query: b64,
      res: res,
      core: machine
    })
  })
  app.get("/query", function(req, res) {
    let code = JSON.stringify({
      v: 3,
      q: { find: {}, limit: 10 }
    }, null, 2)
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
  if (o.custom) {
    o.custom({
      core: machine,
      app: app
    })
  }
  app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html")
  })
  app.listen(port, () => {
    console.log("PLANARIUM", `listening on port ${port}!`)
  })
}
module.exports = {
  start: start
}
