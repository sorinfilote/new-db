module.exports = (args) => {
  let router = require("express").Router()

  router.post(args.apiName, async(req, res) => {
    try{
      let {title} = req.body.data
      if(!(await args.authentificateUserWithSession(req.client, req.body.auth.session))) return res.status(401).end()

      let user_id = await args.getIdFromSession(req.client, req.body.auth.session)
      let board_id = (await req.client.query("INSERT INTO boards(user_id, title) VALUES($1, $2) RETURNING id", [user_id, title])).rows[0].id
      await args.joinUserIntoBoard(req.client, user_id, board_id)

      res.end(JSON.stringify({board_id}))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.put(args.apiName, async(req, res) => {
    try{
      let {board_id, title} = req.body.data
      if(!(await args.authentificateUserWithSession(req.client, req.body.auth.session))) return res.status(401).end()

      if(title === undefined)
        return res.status(400).end()

      let user_id = await args.getIdFromSession(req.client, req.body.auth.session)
      if(!(await args.validateBoardOwnership(req.client, user_id, board_id))) return res.status(403).end()

      await req.client.query("UPDATE boards SET title=$1 WHERE id=$2", [title, board_id])
      res.end()
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.get(args.apiName + "/:session", async(req, res) => {
    try{
      if(!(await args.authentificateUserWithSession(req.client, req.params.session))) return res.status(401).end()

      let user_id = await args.getIdFromSession(req.client, req.params.session)
      let boards = (await req.client.query("SELECT a.id AS board_id, a.title, a.creation_date, a.last_updated FROM boards a JOIN user_to_board b ON a.id = b.board_id WHERE b.user_id = $1", [user_id])).rows

      res.end(JSON.stringify(boards))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.get(args.apiName + "/:session/:board_id", async(req, res) => {
    try{
      if(!(await args.authentificateUserWithSession(req.client, req.params.session))) return res.status(401).end()
      let {board_id} = req.params

      let user_id = await args.getIdFromSession(req.client, req.params.session)
      if(!(await args.validateBoardParticipation(req.client, user_id, board_id)))
        return res.status(403).end()
      let title = (await req.client.query("SELECT title FROM boards WHERE id = $1", [board_id])).rows[0].title

      res.end(JSON.stringify({title}))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.delete(args.apiName, async(req, res) => {
    try{
      let {board_id} = req.body.data
      if(!(await args.authentificateUserWithSession(req.client, req.body.auth.session))) return res.status(401).end()

      let user_id = await args.getIdFromSession(req.client, req.body.auth.session)
      if(!(await args.validateBoardOwnership(req.client, user_id, board_id))) return res.status(403).end()

      await req.client.query("DELETE FROM boards WHERE id=$1", [board_id])
      await req.client.query("DELETE FROM cards WHERE list_id IN(SELECT id FROM lists WHERE board_id = $1)", [board_id])
      await req.client.query("DELETE FROM lists WHERE board_id = $1", [board_id])
      res.end()
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  return router
}
