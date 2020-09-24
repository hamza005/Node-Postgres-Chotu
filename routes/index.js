const usersRoute = require('./users_route');

module.exports = (app, db) => {
    usersRoute(app, db);
}