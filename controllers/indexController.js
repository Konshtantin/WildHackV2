const New = require('../models/new')

function index_get(req, res) {
    New.find()
        .then(news => {
            res.render('newsList', {news})
        })
}



module.exports = {
    index_get
}