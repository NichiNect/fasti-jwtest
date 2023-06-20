const BaseModel = require('../app/Base/Model');
const ldapJS = require('ldapjs');

class Ldap extends BaseModel {

    async loginLdap(url, username, password) {

        return new Promise((resolve, reject) => {
            const client = ldapJS.createClient({
                url: url,
                timeout: 1000,
                connectTimeout: 1000,
            });

            client.once('error', () => {
                reject(false);
            });

            client.bind(`${username}`, (password ?? ''), (err, res) => {
                if (err) {
                    console.log(err);
                    resolve(err?.lde_message);
                }

                resolve(client);
            });
        });
    }
}

module.exports = new Ldap();
