const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.Auth = async (request, response, next) => {

    const requestToken = request.headers?.authorization;

    if (!requestToken) {
        return response.status(401).send({
            message: 'Unauthenticated'
        });
    }

    const tokenSplited = requestToken.split(' ');
    const [tokenType, tokenContent] = [
        tokenSplited[0],
        tokenSplited[1]
    ];

    if (tokenType != 'Bearer') {
        return response.status(401).send({
            message: 'Token type is invalid'
        });
    }

    const userData = jwt.verify(tokenContent, (process.env.SECRET_KEY ?? 'YourSecretKey'), (err, decoded) => {

        if (err) {
            return response.status(401).send({
                message: 'Token is invalid'
            });
        }

        return decoded;
    });

    console.log('userdata', userData);

    next();
}