let express = require("express")
let router = express.Router()
let fs = require("fs")
let {log} = require("./common.js")

router.use(express.json())
// Use routers from all exported .js files in this folder, except for index.js and common.js
let apiFiles = fs.readdirSync(__dirname).filter(fileName => fileName != "index.js" && fileName != "common.js").map(fileName => fileName.slice(0, -3)).forEach(fileName => {
  try{
    // if(!"lists boards users login".split(" ").includes(fileName))
    //   return

    let apiName = "/" + fileName
    let catchRouteError = ({error, result}) => {
      log(error)
      result.status(500)
      result.end()
    }

    let params = {apiName, catchRouteError, ...require("./common.js")}
    let importedRouter = require("./" + fileName)(params)

    router.use(importedRouter)
  } catch(e) {
    let log = require("./common.js").log
    log("An error has occurred when adding Route "+fileName)
    log(e)
  }
})

module.exports = router