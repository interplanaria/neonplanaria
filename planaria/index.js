const machine = require('./machine/index')
const script = require('./script/index')
const tape = require('./machine/tape')
const bitbus = require('bitbus')
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
const start = async function(p) {
  let errors = validate(p);
  if (errors.length > 0) {
    console.log("PLANARIA", errors.join("\n"));
    process.exit(1);
  } else {
    let buspath;
    if (!p.src) {
      await bitbus.init() // generate bitbus key if it doesn't exist yet
      buspath = await bitbus.build(p.filter)    
      p.src = {
        from: p.filter.from,
        path: buspath
      }
    } else {
      buspath = p.src.path;
    }
    if (!p.tape) p.tape = process.cwd()
    let current = await tape.current(buspath, p)
    console.log("PLANARIA", "onstart() ... ")
    await p.onstart(current);
    console.log("PLANARIA", "starting machine...")
    await machine.start(p); 
    console.log("PLANARIA", "finshed starting!")
  }
}
module.exports = {
  start: start,
  exec: script.exec
}
