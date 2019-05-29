module.exports = (args) => {
  let router = require("express").Router()

  router.post(args.apiName, async(req, res) => {
    try{
      let {board_id, title} = req.body.data;
      if(!(await args.authentificateUserWithSession(req.client, req.body.auth.session))) return res.status(401).end()
      let user_id = await args.getIdFromSession(req.client, req.body.auth.session)
      if(!(await args.validateBoardOwnership(req.client, user_id, board_id))) return res.status(403).end()

      let list_pos = (await req.client.query("SELECT pos FROM lists WHERE board_id = $1 ORDER BY pos DESC LIMIT 1", [board_id])).rows[0]
      list_pos = (list_pos !== undefined) ? list_pos.pos : 0
      list_pos += 16384
      let list_id = (await req.client.query("INSERT INTO lists(board_id, title, pos) VALUES($1, $2, $3) RETURNING id AS list_id", [board_id, title, list_pos])).rows[0].list_id

      res.end(JSON.stringify({list_id}))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.put(args.apiName, async(req, res) => {
    try{
      let {list_id, title} = req.body.data
      if(!(await args.authentificateUserWithSession(req.client, req.body.auth.session))) return res.status(401).end()
      let board_id = (await req.client.query("SELECT board_id FROM lists WHERE id = $1", [list_id])).rows[0].board_id
      let user_id = await args.getIdFromSession(req.client, req.body.auth.session)
      if(!(await args.validateBoardOwnership(req.client, user_id, board_id))) return res.status(403).end()

      await req.client.query("UPDATE lists SET title=$1 WHERE id = $2", [title, list_id])

      res.end()
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.get(args.apiName + "/:session/:board_id", async(req, res) => {
    try{
      let {board_id, session} = req.params
      if(!(await args.authentificateUserWithSession(req.client, session))) return res.status(401).end()
      let user_id = await args.getIdFromSession(req.client, session)
      if(!(await args.validateBoardParticipation(req.client, user_id, board_id))) return res.status(403).end()

      let lists = (await req.client.query("SELECT id AS list_id, title, creation_date, last_updated FROM lists WHERE board_id = $1 ORDER BY pos ASC", [board_id])).rows

      res.end(JSON.stringify(lists))
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  router.delete(args.apiName, async(req, res) => {
    try{
      let {list_id, title} = req.body.data
      if(!(await args.authentificateUserWithSession(req.client, req.body.auth.session))) return res.status(401).end()
      let board_id = (await req.client.query("SELECT board_id FROM lists WHERE id = $1", [list_id])).rows[0].board_id
      let user_id = await args.getIdFromSession(req.client, req.body.auth.session)
      if(!(await args.validateBoardOwnership(req.client, user_id, board_id))) return res.status(403).end()

      await req.client.query("DELETE FROM lists WHERE id = $1", [list_id])
      await req.client.query("DELETE FROM cards WHERE list_id = $1", [list_id])

      res.end()
    }catch(e){ args.catchRouteError({error: e, result: res}) }
  })

  return router
}
