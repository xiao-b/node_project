const mysql = require('mysql')
const db = require('../configs/db')
const pool = mysql.createPool(db)

module.exports = {
    connPool(sql, val, cb) {
        pool.getConnection((err, conn) => {
            if (err) throw err
            conn.query(sql, val, (err, rows) => {
                if (err) throw err
                cb(rows)
                conn.release()
            })
        })
    },

    // json格式
    writeJson(res, code = 200, msg = 'ok', data = null) {
        const obj = { code, msg, data }

        if (!data) {
            delete obj.data
        }

        res.send(obj)
    }
}
