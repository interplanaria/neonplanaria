const {planaria} = require("neonplanaria")

const MongoClient = require('mongodb')

const config = require('./config')
const filterQuery = require('./filter_query.json')

var db;
var kv;

const connect = function (cb) {
  MongoClient
    .connect(config.MONGO_URI, {
      useNewUrlParser: true
    }, function (err, client) {
      if (err) {
        console.log("retrying...")
        setTimeout(function () {
          connect(cb);
        }, 1000)
      } else {
        db = client.db("planaria");
        cb();
      }
    })
}

planaria.start({
  filter: filterQuery,
  onmempool: async function (e) {
    await db
      .collection("u")
      .insertMany([e.tx])
  },
  onblock: async function (e) {
    await db
      .collection("c")
      .insertMany(e.tx)
  },
  onstart: function (e) {
    return new Promise(async function (resolve, reject) {
      if (!e.tape.self.start) {
        /* Code related to initialization process */
      }
      connect(function () {
        if (e.tape.self.start) {
          db
            .collection("c")
            .deleteMany({
              "blk.i": {
                "$gt": e.tape.self.end
              }
            })
            .then(resolve)
        } else {
          resolve();
        }
      })
    })
  }
})
