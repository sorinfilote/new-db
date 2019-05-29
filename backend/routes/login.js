let {createSession} = require("./common.js")
let {hashify} = require("./common.js")

module.exports = (args) => {
  let router = require("express").Router()

  router.post(args.apiName, async(req, res) => {
    try{
      let {username, password} = req.body.data
      password = hashify(password)

      let r = await req.client.query("SELECT id FROM users WHERE username = $1 AND password = $2", [username, password])
      if(r.rows.length == 0)
        return res.status(404).end()
      let user_id = r.rows[0].id
      let session = await createSession(req.client, user_id)
      //args.log("Logged in user "+username)
      res.end(JSON.stringify({session}))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  return router
}