const tape = require('./tape')
const fs = require('fs')
const Queue = require('better-queue');
const tapeFile = "/tape.txt"
const init = function() {
  return new Queue(function(o, cb) {
    let localTape = o.c.tape || process.cwd();
    if (o.type === 'block') {
      let blockpath = o.subdir + "/" + o.height + ".json"
      console.log("PLANARIA", "Reading from bitbus", blockpath)
      if (fs.existsSync(blockpath)) {
        fs.readFile(blockpath, "utf-8", async function(err, res) {
          try {
            let d = JSON.parse(res)
            await o.c.onblock({
              height: o.height,
              tx: d,
              tape: o.tape
            })
            // ONLY AFTER onblock finishes, add to log
            await tape.write("BLOCK " + d[0].blk.i + " " + Date.now(), localTape + tapeFile)
          } catch (e) {
            console.log("PLANARIA", "Block queue exception", e, res, o)
          }
          cb(err)
        })
      } else {
//        console.log("PLANARIA", "Block " + o.height + " doesn't exist")
        cb()
      }
    } else if (o.type === 'mempool') {
      fs.readFile(o.subdir + "/mempool.json", "utf-8", async function(err, res) {
        try {
          let d = JSON.parse(res)
          let txs = d.filter(function(item) {
            return item.tx.h === o.hash
          })
          if (txs.length > 0) {
            let tx = txs[0];
            await o.c.onmempool({
              tx: tx,
              tape: o.tape
            })
            // ONLY AFTER onmempool finishes successfully, add to log
            await tape.write("MEMPOOL " + o.hash + " " + Date.now(), localTape + tapeFile)
          }
        } catch (e) {
          // todo
        }
        cb(err)
      })
    }
  })
}
module.exports = {
  init: init
}
