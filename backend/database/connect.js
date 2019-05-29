require("dotenv").config()
let {Pool} = require("pg")

module.exports = async() => new Pool().connect()