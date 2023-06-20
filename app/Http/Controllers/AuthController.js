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

        const checkUser = await UserModel.findOneByUsername(bodyParams.username);

        if (!checkUser) {
            return response.status(401)
                .send({
                    message: 'This username is not match in our records'
                });
        }

        switch (checkUser?.logintype) {
            case 'LDAP': {

                // * Check to LDAP Server
                const ldap = require('../../../utils/Ldap');

                const ldapConfig = {
                    ldapUrl: `${process.env.LDAP_HOST}:${process.env.LDAP_PORT}`,
                    ldapDefaultUser: process.env.LDAP_DEFAULT_USER,
                    ldapDefaultPassword: process.env.LDAP_DEFAULT_PASSWORD
                };

                const ldapClient = await ldap.loginLdap(ldapConfig.ldapUrl, checkUser?.user_dn, bodyParams?.password);

                if (ldapClient?.success == false) {
                    return response.status(401)
                        .send({
                            message: 'Failed to check LDAP Server',
                            errors: [
                                ldapClient?.message
                            ]
                        });
                }
            } break;
            case 'LOCAL': {
                
                // * Check password
                const checkPassword = await bcrypt.compare(bodyParams.password, checkUser.password);

                if (!checkPassword) {
                    return response.status(401)
                        .send({
                            message: 'This password is wrong'
                        });
                }
            } break;
            default: {
            }
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
            client.instance.search('dc=example,dc=com', opts, (err, res) => {

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

    static async syncLdapUser (request, response) {

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

        let syncType = 'UPDATE';

        let done = await new Promise((resolve, reject) => {
            client.instance.search('dc=example,dc=com', opts, (err, res) => {

                res.on('searchEntry', async (entry) => {
                    let ldapEntry = entry.object;

                    let user = await UserModel.findOneByUsername(ldapEntry?.uid, [
                        {
                            field: 'user_dn',
                            value: ldapEntry?.dn
                        },
                        {
                            field: 'logintype',
                            value: 'LDAP'
                        }
                    ]);

                    if (!user) {
                        // * Create new user

                        syncType = 'CREATE';
                        const data = {
                            user_dn: ldapEntry?.dn,
                            username: ldapEntry?.uid,
                            email: ldapEntry?.mail,
                            name: ldapEntry?.cn,
                            password: null,
                            logintype: 'LDAP',
                            ldap_last_sync: new Date()
                        }

                        user = await UserModel.createUser(data)
                            .catch((error) => {
                                console.error(error);
                                // return response.status(500)
                                //     .send({
                                //         message: 'Failed to create new user from LDAP'
                                //     });
                                resolve(error);
                            });
                    } else {
                        // * Update existing user data

                        const data = {
                            user_dn: ldapEntry?.dn ?? user.user_dn,
                            username: ldapEntry?.uid ?? user.username,
                            email: ldapEntry?.mail ?? user.email,
                            name: ldapEntry?.cn ?? user.name,
                            password: null,
                            ldap_last_sync: new Date()
                        }

                        const updateUser = await UserModel.updateUser(user.id, data)
                            .catch((error) => {
                                console.error(error);
                                resolve(error);
                            });
                    }


                    console.log('user after everything', user);
                    resolve(user);
                });

                res.on('error', (err) => {
                    console.error('error: ' + err.message);
                    resolve(false);
                });
            });
        });

        const userData = await UserModel.findOneUser(done?.id);

        if (!userData) {
            return response.status(500)
                .send({
                    message: `Failed to sync ${key}`,
                });
        }

        return response.status(200)
            .send({
                message: `Success sync ${key}`,
                data: userData
            });
    }
}

module.exports = AuthController;
