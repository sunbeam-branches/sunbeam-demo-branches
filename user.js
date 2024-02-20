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

app.post('/', (req, res)=>{
    const {id,name , email, password} = req.body

    const statement = `insert into user values (?,?,?,?)`
    
    db.query(statement,[id,name , email, password], (error,data) =>{

        res.send(utils.createResult(error,data))
    }) 

})


app.put('/update/:id', (req, res)=>{
    const {name , email, password} = req.body
const id = req.params

const statement = `update user set name = ?, email= ?, password =? where id = id`

db.query(statement,[name , email, password,id], (error,data) =>{

    res.send(utils.createResult(error,data))
}) 
})

app.delete('/delete/:id', (req, res) =>{
    const id = req.params

    const statement = `delete from user where id = id`
    db.query(statement,[id], (error,data) =>{

        res.send(utils.createResult(error,data))
    }) 

})


module.exports = app