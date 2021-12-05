const express = require('express')
const logger = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()
const app = express()

const indexRouter = require('./routers/indexRouter')

const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(PORT)
    })

app.use(logger('dev'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')


app.use('/', indexRouter)
