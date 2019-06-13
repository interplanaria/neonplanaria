const {spawn} = require('child_process');
module.exports = {
  exec: function(cmd, args, options) {
    return new Promise(function(resolve, reject) {
      if (options) {
        options.stdio = 'inherit'
      } else {
        options = { stdio: 'inherit' }
      }
      console.log("PLANARIA", "exec()", cmd, args, options);
      let ps = spawn(cmd, args, options)
      ps.on('exit', resolve)
    })
  }
}
