const express = require('express')
const bodyParser = require('body-parser')
// const path = require('path')
const session = require('express-session')
const router = require('./routes/router')

const port = process.env.PORT || 9999
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.all('*',function (req, res, next) {
    console.log(req,res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(session({
    secret: 'fuckupig',
    cookie: { maxAge: 3600000 },
    resave: true,
    saveUninitialized: true
}))

app.use(router)

app.listen(port, () => {
    console.log(`devServer start on port:${port}`)
})
