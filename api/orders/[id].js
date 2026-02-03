const mainHandler = require('./index');

module.exports = async (req, res) => {
    return mainHandler(req, res);
};
