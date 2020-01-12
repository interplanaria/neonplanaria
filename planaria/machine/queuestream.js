const tape = require('./tape')
const fs = require('fs')
const es = require('event-stream')
const BatchStream = require('batch-stream');
const Queue = require('better-queue');
const tapeFile = "/tape.txt"
const init = function(config) {
  return new Queue(function(o, cb) {
    let localTape = o.c.tape || process.cwd();
    let blockpath = o.subdir + "/" + o.height + ".txt"
    let mempoolpath = o.subdir + "/mempool.txt"
    console.log("blockpath = ", blockpath)
    if (o.type === 'block') {
      console.log("PLANARIA", "Reading from bitbus", blockpath)
      if (fs.existsSync(blockpath)) {
        let blockstream = fs.createReadStream(blockpath)
        let mempoolstream = fs.createReadStream(mempoolpath)
        o.c.onblock({
          height: o.height,
          tx: (size) => {
            let stx = blockstream.pipe(es.split()).pipe(es.parse())
            if (size) {
              let batch = new BatchStream({ size : size });
              stx = stx.pipe(batch)
            }
            return stx;
          },
          mem: (size) => {
            let stx = mempoolstream.pipe(es.split()).pipe(es.parse())
            if (size) {
              let batch = new BatchStream({ size : size });
              stx = stx.pipe(batch)
            }
            return stx;
          },
          tape: o.tape
        })
        .then(async () => {
          await tape.write("BLOCK " + o.height + " " + Date.now(), localTape + tapeFile)
          cb()
        })
      } else {
        cb()
      }
    } else if (o.type === 'mempool') {
      let mempoolpath = o.subdir + "/mempool.txt"
      let mempoolstream = fs.createReadStream(mempoolpath)
      o.c.onmempool({
        tx: (size) => {
          let stx = mempoolstream.pipe(es.split()).pipe(es.parse())
          if (size) {
            let batch = new BatchStream({ size : size });
            stx = stx.pipe(batch)
          }
          return stx;
        },
        tape: o.tape
      })
      .then(async () => {
        // ONLY AFTER onmempool finishes successfully, add to log
        await tape.write("MEMPOOL " + o.hash + " " + Date.now(), localTape + tapeFile)
        cb()
      })
    }
  }, config)
}
module.exports = {
  init: init
}
