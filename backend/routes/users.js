let {createSession} = require("./common.js")
let {hashify} = require("./common.js")

module.exports = (args) => {
  let router = require("express").Router()

  router.post(args.apiName, async(req, res) => {
    try{
      let {username, password} = req.body.data
      password = hashify(password)

      if((await req.client.query("SELECT id FROM users WHERE username = $1", [username])).rows.length > 0) {
        //args.log(`User ${username} was attempted to be registered, but it was already taken.`)
        return res.status(409).end()
      }
      let r = await req.client.query("INSERT INTO users(username, password) VALUES($1, $2) RETURNING id", [username, password])
      let user_id = r.rows[0].id
      let session = await createSession(req.client, user_id)
      //args.log("Registered user "+username)
      res.end(JSON.stringify({session}))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.get(args.apiName+"/:session", async(req, res) => {
    try{
      let {session} = req.params
      if(!(await args.authentificateUserWithSession(req.client, session))) return res.status(401).end()

      let users = (await req.client.query("SELECT id as user_id, username FROM users")).rows
      res.end(JSON.stringify(users))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.delete(args.apiName, async(req, res) => {
    try{
      let session, username, password

      let user_id
      if(req.body.auth && req.body.auth.session) {
        //if(!req.body.auth.session) return res.status(400).end()
        session = req.body.auth.session
        let r = (await req.client.query("SELECT id FROM sessions WHERE session = $1", [session]))
        if(r.rows.length == 0) return res.status(204).end()
        user_id = r.rows[0].id
      }
      else if(req.body.data && req.body.data.username && req.body.data.password) {
        //if(!req.body.data.username || !req.body.data.password) return res.status(400).end()
        username = req.body.data.username
        password = req.body.data.password
        password = hashify(password)
        let r = (await req.client.query("SELECT id FROM users WHERE username = $1 AND password = $2", [username, password]))
        if(r.rows.length == 0) return res.status(204).end()
        user_id = r.rows[0].id
      }
      else return res.status(400).end()

      await req.client.query("DELETE FROM users WHERE id = $1", [user_id])
      await req.client.query("DELETE FROM sessions WHERE user_id = $1", [user_id])

      res.end()
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  return router
}