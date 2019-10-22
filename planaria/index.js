const machine = require('./machine/index')
const script = require('./script/index')
const tape = require('./machine/tape')
const bitbus = require('bitbus')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const callsites = require('callsites')
const validate = function(p) {
  let errors = [];
  if (p.src) {
    if (!p.src.from) {
      errors.push("src must have 'from' attribute")
    } 
    if (!p.src.path) {
      errors.push("src must have 'path' attribute")
    }
  } else {
    if (p.filter) {
      if (p.filter.q) {
        if (!p.filter.q.find) {
          errors.push("require a filter.q.find attribute")
        }
      } else {
        errors.push("require a filter.q attribute")
      }
    } else {
      errors.push("require a filter attribute")
    }
  }
  return errors;
}
const id = () => {
  let filename = callsites()[1].getFileName() // second file in the call stack
  let data = fs.readFileSync(filename, "utf8")
  let hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
}
const start = async function(p) {
  let errors = validate(p);
  if (errors.length > 0) {
    console.log("PLANARIA", errors.join("\n"));
    process.exit(1);
  } else {
    /*
    * cases:
    * 1. default bus path + default tape path: (!p.tape && !p.src) => use current path for p.tape, initialize bus at current path.
    * 2. custom bus path + default tape path: (!p.tape && p.src) => use current path for p.tape, use the bus path 
    * 3. custom bus path + custom tape path: (p.tape && p.src) => use the custom path for p.tape, use the bus path
    * 4. default bus path + custom tape path: (p.tape && !p.src) => use the custom path for p.tape, initialize bus at p.tape
    */
    let buspath;
    if (p.tape) {
      // if 'tape' exists, use that as the tape path
      p.tape = path.resolve(".", p.tape)
    } else {
      // if 'tape' doesn't exist, use current path as tape path
      p.tape = process.cwd()
    }
    if (!p.src) {
      // if 'src' doesn't exist,
      // initialize bitbus with tape path
      await bitbus.init({ BUS_PATH: p.tape })
      buspath = await bitbus.build(p.filter)    
      // set 'src' with the initialized buspath and 'filter.from'
      p.src = {
        from: p.filter.from,
        path: buspath
      }
    } else {
      // if 'src' exists, assume that bitbus is already initialized, and use 'src.path' as buspath
      buspath = p.src.path;
    }
    let current = await tape.current(buspath, p)
    console.log("PLANARIA", "onstart() ... ")
    if (p.onstart) await p.onstart(current);
    console.log("PLANARIA", "starting machine...")
    await machine.start(p); 
    console.log("PLANARIA", "finshed starting!")
  }
}
module.exports = {
  start: start,
  exec: script.exec,
  id: id
}
