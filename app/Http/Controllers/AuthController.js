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

    static async bindLdap(request, response) {

        const bodyParams = request.body;

        const ldap = require('../../../utils/Ldap');

        const ldapConfig = {
            ldapUrl: `${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`,
            ldapDefaultUser: process.env.LDAP_DEFAULT_USER,
            ldapDefaultPassword: process.env.LDAP_DEFAULT_PASSWORD
        };

        const test = await ldap.loginLdap(ldapConfig.ldapUrl, 'uid=einstein,dc=example,dc=com', ldapConfig.ldapDefaultPassword);

        return response.status(200)
            .send({
                message: 'Success',
                data: test
            });
    }

    static async searchLdap(request, response) {

        const key = request.body.key;

        const ldap = require('../../../utils/Ldap');

        const ldapConfig = {
            ldapUrl: `${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`,
            ldapDefaultUser: process.env.LDAP_DEFAULT_USER,
            ldapDefaultPassword: process.env.LDAP_DEFAULT_PASSWORD
        };

        const client = await ldap.loginLdap([ldapConfig.ldapUrl], ldapConfig.ldapDefaultUser, ldapConfig.ldapDefaultPassword);

        const opts = {
            filter: `(${key})`,
            scope: 'sub',
            attributes: []
        };

        let done = await new Promise((resolve, reject) => {
            client.search('dc=example,dc=com', opts, (err, res) => {

                res.on('searchEntry', async (entry) => {
                    let ldapEntry = entry.object;

                    resolve(ldapEntry);
                });

                res.on('resultError', (err) => {
                    console.error('result error:'  + err);
                    resolve(false);
                });

                res.on('error', (err) => {
                    console.error('error: ' + err.message);
                    resolve(false);
                });

                res.on('end', (result) => {
                    console.log('on: --------end: ' + result);
                    resolve(result);
                });
            });
        });

        return response.status(200)
            .send({
                data: done
            });
    }
}

module.exports = AuthController;
