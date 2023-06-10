const dotenv = require('dotenv');

dotenv.config();

exports.databaseConfig = {
    client: 'mysql2',
    connection: {
        host: String(process.env.DB_HOST ?? '127.0.0.1'),
        user: String(process.env.DB_USERNAME ?? 'root'),
        password: String(process.env.DB_PASSWORD ?? ''),
        database: String(process.env.DB_DATABASE ?? 'test'),
    },
    // migrations: {
    //     directory: './database/migrations'
    // },
    // seeds: {
    //     directory: './database/seeds',
    // },
}
