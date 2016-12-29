var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var searchesSchema = mongoose.Schema({
    term: String,
    when: Date
});

var Search = mongoose.model('searches', searchesSchema);
module.exports = Search;