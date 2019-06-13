const fs = require('fs')
const readline = require('readline');
const path = require('path')
const stream = require('stream');
const write = function(str, logpath) {
  return new Promise(function(resolve, reject) {
    let lp = path.resolve(logpath, "../");
    if (!fs.existsSync(lp)) {
      fs.mkdirSync(lp, { recursive: true });
    }
    fs.appendFile(logpath, str + "\n", function(err, res) {
      if (err) {
        console.log("PLANARIA", err);
        process.exit(1);
      } else {
        resolve();
      }
    })
  })
}
const range = function (logpath) {
  return new Promise(function(resolve, reject) {
    if (fs.existsSync(logpath)) {
      const instream = fs.createReadStream(logpath);
      const outstream = new stream;
      let r = readline.createInterface(instream, outstream);
      let maxheight = null;
      let minheight = null;
      r.on('line', function(line) {
        let chunks = line.split(" ");
        let type = chunks[0];
        let height = parseInt(chunks[1]); 
        if (type === 'BLOCK' || type === 'REWIND') {
          // update maxheight
          maxheight = height;
          // update minheight only in the beginning
          if (!minheight) {
            minheight = height;
          }
        }
      });
      r.on('close', function() {
        if (maxheight) {
          resolve({ end: maxheight, start: minheight })
        } else {
          resolve(null)
        }
      });
    } else {
      resolve(null)
    }
  })
}
// Given a tape path, returns both ends of the tape file: "start", "end"
// Process input (Bitcoin or Bitbus)
// 1. Replicate bitbus/bitcoin tape to planarian tape
// 2. Queue jobs from the tape
const current = async function(subdir, c) {
  /*******************************************************
  *
  *   1. Get output tape (Planarian Log)
  *     => figure out where it left off
  *
  *******************************************************/
  let destTape = await range(c.tape + "/tape.txt")

  /*******************************************************
  *
  *   2. Get input tape (Bitbus Log)
  *     => figure out the start and the end of the chain
  *
  *******************************************************/
  let srcTape = await range(subdir + "/tape.txt")

  /*******************************************************
  *
  * srcTape (bitbus || bitcoin)
  *
  *   [start][.][.][.][.][.][.][end]
  *
  * destTape (planarian)
  *
  *   [start][.][.][.][.][.][.][end]
  *
  * Read destTape and figure out where to resume from:
  *
  * 1. if destTape is empty
  *   1.a. if 'from' exists, it overrides all other conditions. start from 'from'
  *     - however, if 'from' is smaller than srcTape.start, it must exit.
  *   1.b. if srcTape is also empty, there's nothing to do. exit
  *   1.c. if srcTape has an item, start from [srcTape.start]
  * 2. if destTape has an item, start from [destTape.end+1]
  *
  *******************************************************/
  let HEAD;
  if (destTape) {
    // destination tape exists. continue
    if (srcTape) {
      HEAD = destTape.end+1;
    } else {
      // dest exists but source tape doesn't exist.
      // Need to warn in order to avoid out of sync
      console.log("PLANARIA", "Planaria tape exists but source tape not availalble...Please update Planaria log to start in sync with source log.")
      process.exit(1);
    }
  } else {
    // destination tape doesn't exist.
    if (c.filter && c.filter.from) {
      // 'from' exists. it overrides everything else.
      HEAD = c.filter.from;
    } else if (srcTape) {
      // start from source tape's beginning
      HEAD = srcTape.start;
    } else {
      console.log("PLANARIA", "Source tape not available...")
      process.exit(1);
    }
  }
  return {
    head: HEAD,
    tape: {
      src: srcTape,
      self: {
        start: (destTape ? destTape.start : null),
        end: (destTape ? destTape.end : null),
        write: function(str) {
          return new Promise(function(resolve, reject) {
            fs.writeFile(c.log, str, function(err, res) {
              if (err) {
                console.log("PLANARIA", err);
                process.exit(1);
              } else {
                resolve();
              }
            })
          })
        }
      }
    }
  }
}
module.exports = {
  write: write,
  range: range,
  current: current
}
