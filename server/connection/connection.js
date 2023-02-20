import mysql from 'mysql2'

export default mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'robots',
    password: '7777777'
}).promise()
