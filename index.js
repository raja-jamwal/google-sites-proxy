/**
 * Created by Raja Jamwal on 27/2/17.
 * (c) DataGrid Softwares LLP
 */
var express = require('express'),
    app = express(),
    https = require('https'),
    config = require('./config.js'),
    mysql = require('mysql'),
    cache = require('memory-cache'),
    _ = require('lodash'),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));

var connection = null;

app.set('port', process.env.port || 8000);


var handleRequest = function(request, response, domain) {
    var userSite = cache.get(domain),
        mappedDomain = config.googleSitesRoot + userSite,
        url = request.url;

    console.log(url);

    var mappedUrl = url == '/' ? mappedDomain : config.googleSites+url;

    https.get(mappedUrl, function(sitesResponse) {
        sitesResponse.pipe(response);
    });
};

app.post("/add/user", function(request, response) {
    var fields = {
        name: request.body.name,
        email: request.body.email,
        site: request.body.site,
        domain: request.body.domain
    };

    var insertQuery = "INSERT into users (name, email, site, domain) VALUES (':name', ':email', ':site', ':domain');";
    for (var key in fields) {
        insertQuery = insertQuery.replace(":"+key, fields[key]);
    }
    console.log(insertQuery);
    connection.query(insertQuery, function(err, rows, fields) {
        if (!err)
        {
            response.send("SUCCESS");
        }
        else {
            response.status(500);
            response.send("Oh well Database issue, that's all I know, Contact :supportEmail".replace(':supportEmail', config.support.email));
            console.log('Error while performing Query.');
        }
    });
});

app.all('*', function(request, response) {
   var domain = (request.headers.host.split(':')[0]).replace('www.','');
   if (!cache.get(domain)) {
       console.log("***Making DB Request **");
       var query = 'SELECT * from users where domain=":domain" or domain="www.:domain"'.replace(/:domain/g, domain);
       console.log(query);
       connection.query(query, function(err, rows, fields) {
           if (!err)
           {
               if (!_.isEmpty(rows)) {
                   var dbResult = _.head(rows);
                   cache.put(dbResult.domain, dbResult.site);
                   handleRequest(request, response, domain);
               } else {
                    response.send('Your site is not registered with us. Contact :supportEmail'.replace(':supportEmail', config.support.email));
               }
           }
           else{
               response.send("Oh well Database issue, that's all I know, Contact :supportEmail".replace(':supportEmail', config.support.email));
               console.log('Error while performing Query.');
           }
       });
   } else {
       console.log("** Not Making DB Request **");
       handleRequest(request, response, domain);
   }
});


app.listen(app.get('port'), function() {
    console.log("-- Server started --");
    connection = mysql.createConnection({
        host     : config.db.host,
        user     : config.db.user,
        password : config.db.password,
        database : config.db.database
    });

    connection.connect(function(err) {
        if (err) {
            console.log('Error connecting to database');
            process.exit(1);
        }
        console.log('Database is connected');
    });
});