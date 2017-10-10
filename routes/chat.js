exports.get = function(req, res) {
    res.render('chat', {
        user: 'admin'
    });
};