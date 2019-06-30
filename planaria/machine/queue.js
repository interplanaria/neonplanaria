const tape = require('./tape')
const fs = require('fs')
const Queue = require('better-queue');
const tapeFile = "/tape.txt"
const init = function(config) {
  return new Queue(function(o, cb) {
    let localTape = o.c.tape || process.cwd();
    if (o.type === 'block') {
      let blockpath = o.subdir + "/" + o.height + ".json"
      console.log("PLANARIA", "Reading from bitbus", blockpath)
      if (fs.existsSync(blockpath)) {
        fs.readFile(blockpath, "utf-8", function(err, res) {
          try {
            let d = JSON.parse(res)
            fs.readFile(o.subdir + "/mempool.json", "utf-8", async function(err2, mem) {
              try {
                let m = JSON.parse(mem)
                await o.c.onblock({
                  height: o.height,
                  tx: d,
                  mem: m,
                  tape: o.tape
                })
                await tape.write("BLOCK " + d[0].blk.i + " " + Date.now(), localTape + tapeFile)
                cb()  // success
              } catch (e2) {
                cb(e2)  // error
              }
            })
          } catch (e) {
            cb(e) // error
          }
        })
      } else {
        cb()  // the block doesn't exist for the sub-blockchain. go to the next block.
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
            cb()
          }
        } catch (e) {
          cb(e)
        }
      })
    }
  }, config)
}
module.exports = {
  init: init
}
