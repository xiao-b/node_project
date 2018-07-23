const express = require('express')
const bodyParser = require('body-parser')
// const path = require('path')
const session = require('express-session')
const router = require('./routes/router')
const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
})
const upload = multer({ storage: storage })
const port = process.env.PORT || 9999
const app = express()
app.post('/uploads', upload.single('avatar'), function (req, res, next) {
    // req.file 是 `avatar` 文件的信息
    // req.body 将具有文本域数据，如果存在的话

    res.send({data: Object.keys(req), connection: req.next})
})
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.all('*', function (req, res, next) {
    // console.log(req,res)
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

app.listen(port, () => console.log(`devServer start on port:${port}`))
