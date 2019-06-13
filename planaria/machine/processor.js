const tape = require('./tape')
const compute = async function(subdir, c, q) {
  let current = await tape.current(subdir, c)
  let size = 0;
  for(let i=current.head; i<=current.tape.src.end; i++) {
    q.push({c: c, type: "block", height: i, subdir: subdir, tape: current.tape});
    size++;
  }
  return size;
}
module.exports = {
  compute: compute
}
