const { planaria } = require("../index")
const path = require('path');
planaria.start({
  filter: {
    "stream": true,
    "from": 609080,
    "q": {
      "find": { "out.s1": "1LtyME6b5AnMopQrBPLk4FGN8UBuhxKqrn" },
      "project": { "out.s2": 1, "out.s3": 1 }
    }
  },
  onmempool: async function(e) {
    console.log("onmempool e = ", e)
    let str = e.tx()
    str.on("data", (e) => {
      console.log("data", e)
    })
  },
  onblock: async function(e) {
    console.log("onblock e = ", e)
    let str = e.tx(10)
    str.on("data", (e) => {
      console.log("block", e)
    })
  },
  onstart: function(e) {
    console.log("onstart e = ", e)
  },
})
