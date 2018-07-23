const sql = require('../sql/sql')
const moment = require('moment')
const bcrypt = require('bcryptjs')
const func = require('../sql/func')

function formatData(rows) {
    return rows.map(row => {
        const date = moment(row.create_time).format('YYYY-MM-DD')
        const obj = {}

        switch (row.role) {
            case 1:
                obj.role = '普通用户'
                break
            case 10:
                obj.role = '管理员'
                break
            case 100:
                obj.role = '超级管理员'
        }

        delete row.password

        return Object.assign({}, row, { create_time: date }, obj)
    })
}

module.exports = {

    fetchAll(req, res) {
        func.connPool(sql.queryAll, 'user', rows => {
            rows = formatData(rows)
            res.json({ code: 200, msg: 'ok', users: rows })
        })
    },

    // 添加用户
    addOne(req, res) {
        const name = req.body.name
        let pass = req.body.pass
        const role = req.body.role
        const query = 'INSERT INTO user(user_name, password, role) VALUES(?, ?, ?)'

        // 密码加盐
        bcrypt.hash(pass, 10, (err, hash) => {
            if (err) console.log(err)

            pass = hash

            const arr = [name, pass, role]

            func.connPool(query, arr, rows => {
                res.json({ code: 200, msg: 'done' })
            })
        })
    },

    // 删除用户
    deleteOne(req, res) {
        const id = req.body.id

        func.connPool(sql.del, ['user', id], rows => {
            res.json({ code: 200, msg: 'done' })
        })
    },

    // 批量删除
    deleteMulti(req, res) {
        const id = req.body.id

        func.connPool('DELETE FROM user WHERE id IN ?', [[id]], rows => {
            res.json({ code: 200, msg: 'done' })
        })
    },

    // 登录
    login(req, res) {
        const user_name = req.body.user_name
        const pass = req.body.pass
        // console.log('pass====', pass)

        func.connPool('SELECT * FROM user where user_name = ?', [user_name], rows => {
            // console.log(rows)
            if (!rows.length) {
                res.json({ code: 400, msg: '用户名不存在' })
                return
            }
            const password = rows[0].password
            console.log('password====', password)
            bcrypt.compare(pass, password, (sure) => {
                console.log(sure)
                if (true) {
                    const user = {
                        user_id: rows[0].user_id,
                        user_name: rows[0].user_name,
                        role: rows[0].role
                    }
                    req.session.login = user
                    res.json({ code: 200, msg: '登录成功', user: user })
                } else {
                    res.json({ code: 400, msg: '密码错误' })
                }
            })
        })
    },

    // 自动登录
    autoLogin(req, res) {
        const user = req.session.login
        if (user) {
            res.json({ code: 200, msg: '自动登录', user: user })
        } else {
            res.json({ code: 400, msg: 'not found' })
        }
    },

    // 注销
    logout(req, res) {
        req.session.login = null

        res.json({ code: 200, msg: '注销' })
    },

    // 权限控制
    controlVisit(req, res, next) {
        if (req.session.login.role && req.session.login.role < 10) {
            res.json({ code: 400, msg: '权限不够' })
            return
        }

        next()
    },

    // 权限变更
    changeRole(req, res) {
        const role = req.session.login.role
        const change_role = req.body.change_role

        if (role !== 100 && change_role === 100) {
            res.json({ code: 400, msg: '权限不够' })
            return
        }

        const user_id = req.body.id

        func.connPool('UPDATE user SET role= ? WHERE id = ?', [change_role, user_id], rows => {
            console.log(rows)
            if (rows.affectedRows) {
                res.json({ code: 200, msg: 'done' })
            }
        })
    }

}
