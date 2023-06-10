const UserModel = require('../../Models/UserModel');

class UserController {

    static async index (request, response) {

        const data = await UserModel.getUsers();

        return response.status(200)
            .send({
                message: 'Success',
                data
            });
    }
}

module.exports = UserController;
