const fs = require('fs');
const Queue = require('./queue');
const Processor = require('./processor');
const Listener = require('./listener');
var mode;
var queue;

const onfinishprocess = function(dir, c, resolve) {
  if (mode === 'PROCESS') {
    console.log("PLANARIA", "switching to LISTEN mode")
    mode = 'LISTEN';
    Listener.listen(dir, c, queue)
    resolve()
  }
}

// Try to process
const trycompute = function(subdir, c, resolve) {
  let logpath = subdir + "/tape.txt";
  if (fs.existsSync(logpath)) {
    mode = "PROCESS";
    Processor.compute(subdir, c, queue)
      .then(function(size) {
        console.log("PLANARIA", "queue size", size)
        if (size === 0) {
          onfinishprocess(subdir, c, resolve)
        }
      });
  } else {
    setTimeout(function() {
      console.log("PLANARIA", "standby for" + logpath)
      trycompute(subdir, c)
    }, 1000);
  }
}
// Try to start controllers
const trystart = function(c, resolve, reject) {
  const dir = c.src.path
  if (fs.existsSync(dir)) {
    // initialize job queue
    queue = Queue.init()
    mode = "PROCESS";
    queue.on('drain', function () {
      console.log("PLANARIA", "Queue drained") 
      onfinishprocess(dir, c, resolve)
    })
    trycompute(dir, c, resolve)
  } else {
    setTimeout(function() {
      console.log("PLANARIA", "standby...")
      trystart(c)
    }, 1000);
  }
}

// Start controllers
const start = function(c) {
  return new Promise(function(resolve, reject) {
    trystart(c, resolve, reject)
  })
}
module.exports = {
  start: start
}
