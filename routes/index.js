var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var Search = require('../models/searches');

var router = express.Router();
var apiKey = process.env.APIKEY;
var mLab = process.env.MONGOLAB_URI;

// connect to mongoDB database
mongoose.connect(mLab);

// extract displayUrl from bing api generated url
function getDisplayUrl(bingUrl) {
    var protocol = bingUrl.slice(0, bingUrl.indexOf('www'));
    var firstCut = decodeURIComponent(bingUrl).slice(protocol.length);
    return firstCut.slice(firstCut.indexOf(protocol), firstCut.indexOf('&p=DevEx'));
}

// root route
router.get('/', function(req, res) {
    res.render('index');
});

// search route
router.get('/api/imagesearch/:search', function(req, res) {
    var searchResults = [];
    var searchTerm = req.params.search;
    var offset = req.query.offset;
    if (offset === undefined) {
        offset = '0';
    }
    var options = {
        url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + searchTerm + '&count=10&offset=' + offset,
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'User-Agent': req.headers['user-agent']
        }
    };
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            // add timestamp to 'searches' database
            Search.create({ term: searchTerm, when: Date.now() }, function(err, entry) {
                if (err) return handleError(err);
            });
            
            // display results
            var info = JSON.parse(body).value;
            for (var i = 0; i < info.length; i++) {
                var result = {
                    'url': getDisplayUrl(info[i].contentUrl),
                    'snippet': info[i].name,
                    'thumbnail': info[i].thumbnailUrl,
                    'context': getDisplayUrl(info[i].hostPageUrl)
                };
                searchResults.push(result);
            }
            res.json(searchResults);
        } else {
            res.send('Search failed');
        }
    });
});


// latest searches route
router.get('/api/latest/imagesearch/', function(req, res) {
    mongoose.model('searches').find(function(err, searches) {
        if (err) return handleError(err);
        res.send(searches);
    }).limit(10).select({ "term": 1, "when": 1, "_id": 0});
});


module.exports = router;