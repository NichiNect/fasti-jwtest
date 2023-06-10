const TestController = require('../app/Http/Controllers/TestController');
const UserController = require('../app/Http/Controllers/UserController');

module.exports = async (app) => {
    app.get('/test', TestController.index);

    // * User
    app.get('/users', UserController.index);
}
