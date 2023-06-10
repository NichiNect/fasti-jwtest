const BaseModel = require('../Base/Model');
const bcrypt = require('bcryptjs');

class UserModel extends BaseModel {

    /**
     * Find all user
     */
    async getUsers() {

        const users = await this.QueryBuilder.select('*').from('users');

        return users;
    }

    /**
     * Find one user
     */
    async findUser(id) {

        const user = await this.QueryBuilder.select('*')
            .from('users')
            .where('id', id)
            .first();
        
        return user;
    }

    /**
     * Create new user
     */
    async createUser(data) {

        const salt = bcrypt.getSalt(10);
        const passwordHash = bcrypt.hashSync(data.password, salt);

        const newUser = await this.QueryBuilder.insert({
            username: data.username,
            name: data.name,
            email: data.email,
            password: passwordHash,
            logintype: 'LOCAL'
        }).into('users');

        return this.findUser(newUser[0]);
    }

    /**
     * Update specified user
     */
    async updateUser(id, data) {

        let updateableFieldMapping = {
            username: 'username',
            name: 'name',
            email: 'email',
            password: 'password',
        };

        let updateData = {};

        console.log('updateData', updateData)

        for (let key in updateableFieldMapping) {

            if (data[key]) {
                updateData[updateableFieldMapping[key]] = data[key];

                if (data.password) {

                    const salt = bcrypt.getSalt(10);
                    const passwordHash = bcrypt.hashSync(data.password, salt);
                    updateData['password'] = passwordHash;
                }
            }

        }

        if (Object.keys(updateData).length > 0) {
            let success = await this.QueryBuilder.update(updateData)
                .from('users')
                .where('id', id);
        }
    }

    /**
     * Delete specified user
     */
    async deleteUser(id) {

        const user = await this.QueryBuilder.from('users')
            .where('id', id)
            .del();

        return 1
    }
}

module.exports = new UserModel();
