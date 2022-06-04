const jwt = require("jsonwebtoken");
const jwtKey = "my_secret_key"

const checkLogin = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtKey);
        const { username, userId } = decoded;
        req.username = username;
        req.userId = userId;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = checkLogin;