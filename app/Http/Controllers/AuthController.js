const UserModel = require('../../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

class AuthController {

    static async login(request, response) {

        const bodyParams = request.body;

        if (!bodyParams?.username && !bodyParams?.password) {
            return response.status(422)
                .send({
                    message: 'Validation error: Username and password must required'
                });
        }

        const checkUser = await UserModel.findOneByUsername(bodyParams.username, [
            {
                field: 'logintype',
                value: 'LOCAL'
            }
        ]);

        if (!checkUser) {
            return response.status(401)
                .send({
                    message: 'This username is not match in our records'
                });
        }

        // * Check password
        const checkPassword = await bcrypt.compare(bodyParams.password, checkUser.password);

        if (!checkPassword) {
            return response.status(401)
                .send({
                    message: 'This password is wrong'
                });
        }

        // * Prepare token
        const token = jwt.sign({
            id: checkUser.id,
            username: checkUser.username,
            logintype: checkUser.logintype
        }, (process.env.SECRET_KEY ?? 'YourSecretKey'), {
            expiresIn: '1d'
        });

        return response.status(200)
            .send({
                message: 'Success',
                token
            });
    }

    static async register(request, response) {

        const bodyParams = request.body;

        if (!bodyParams?.username && !bodyParams?.password && !bodyParams?.name && !bodyParams?.email) {
            return response.status(422)
                .send({
                    message: 'Validation error: Username, name, email, and password must required'
                });
        }

        // * Check unique username & email
        const userUsername = await UserModel.QueryBuilder.from('users')
            .select('*')
            .where('username', bodyParams?.username)
            .first();

        if (userUsername) {
            return response.status(422).send({
                message: 'Validation error: username already used'
            });
        }

        const userEmail = await UserModel.QueryBuilder.from('users')
            .select('*')
            .where('email', bodyParams?.email)
            .first();

        if (userEmail) {
            return response.status(422).send({
                message: 'Validation error: email already used'
            });
        }

        // * Insert new user
        const user = await UserModel.createUser({
            username: bodyParams?.username,
            name: bodyParams?.name,
            email: bodyParams?.email,
            password: bodyParams?.password,
        });

        return response.status(200)
            .send({
                message: 'Success',
                data: user
            });
    }
}

module.exports = AuthController;
