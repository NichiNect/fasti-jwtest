const AuthController = require('../app/Http/Controllers/AuthController');
const TestController = require('../app/Http/Controllers/TestController');
const UserController = require('../app/Http/Controllers/UserController');

// * Middleware
const { Auth } = require('../app/Http/Middlewares/AuthMiddleware');

module.exports = async (app) => {
    app.get('/test', TestController.index);

    // * Auth
    app.post('/auth/login', AuthController.login);
    app.post('/auth/register', AuthController.register);

    // * User
    app.get('/users', { preValidation: [Auth] }, UserController.index);
}
