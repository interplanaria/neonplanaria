const Tail = require('tail').Tail;
const tape = require('./tape')
const tails = [];
const listen = function(subdir, c, q) {
  let logpath = subdir + "/tape.txt";
  let tail = new Tail(logpath)
  tail.on("line", async function(data) {
    let chunks = data.split(" ")
    let type = chunks[0];
    let current = await tape.current(subdir, c)
    if (type === 'BLOCK') {
      let height = parseInt(chunks[1]); 
      q.push({c: c, type: "block", height: height, subdir: subdir, tape: current.tape })
    } else if (type === 'MEMPOOL') {
      let hash = chunks[1];
      q.push({c: c, type: "mempool", hash: hash, subdir: subdir, tape: current.tape })
    }
  });
  tail.on("error", function(error) {
    console.log("PLANARIA", 'Tail error', error);
  });
  tails.push(tail)
}
module.exports = {
  listen: listen
}
