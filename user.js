const express = require('express')
const db = require('./db')
const utils = require('./utils')


const app = express.Router()

app.get('/', (req, res) =>{
    const statement = `select * from user`

    db.query(statement, (error,data) =>{

        res.send(utils.createResult(error,data))
    })
})



module.exports = app