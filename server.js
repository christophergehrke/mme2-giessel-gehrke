// Laden der benötigten Node-Module
var http = require('http');
var url  = require('url');
var fs   = require('fs');
var path = require('path');

/**
 * Der Port auf dem der Server laufen soll
 * @const
 * @type {Number}
 */
var PORT = 1337;

/**
 * MIME-Types aller benötigten Dateitypen
 * @enum {String}
 */
var mimeTypes = {
	html : 'text/html',
	js   : 'text/javascript',
	css  : 'text/css',
	jpg  : 'image/jpeg',
	jpeg : 'image/jpeg',
	png  : 'image/png',
	gif  : 'image/gif'
};

/**
 * Dateitypen die eine Zugangsberechtigung benötigen
 * @enum {Boolean}
 */
var forbidden = {
	js  : true,
	css : true
};

/**
 * Zugangsberechtigte und -unberechtigte IP-Adressen
 * @enum {Object}
 */
var lists = {
    /**
     * Zugangsberechtigte IP-Adressen
     * @enum {Boolean}
     */
	white : {
		'127.0.0.1' : true
	},
    /**
     * Zugangsunberechtigte IP-Adressen
     * @enum {Boolean}
     */
	black : {
		//'127.0.0.1' : true
	}
};

// Erstellen des Servers
http.createServer(function (request, response) {

    // Prüfen der Zugangsberechtigung
    var okToServe = false;

    // Ermitteln der IP-Adresse des Clients
    var clientIP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    // Äquivalent zu "Order Allow,Deny" in Apache (siehe .htaccess)
    if (clientIP in lists.white) okToServe = true;
    if (clientIP in lists.black) okToServe = false;

    // Ermitteln des Requestpaths und ggf. Fileextension
    var path = url.parse(request.url).pathname.toLowerCase();
    var extension = (path.match(/[a-zA-Z0-9]+\.(.+)$/)) ? true : false;
    var forbiddenFileRequested = false;
    if (extension) {
        var fileExtension;
        for (var key in forbidden) {
            var suffix = '.' + key;
            if (path.indexOf(suffix, path.length - suffix.length) !== -1) {
                forbiddenFileRequested = true;
                fileExtension = key;
                break;
            }
        }
    }

    // Setzen des Content-Type
    var contentType = 'text/html';
    if (extension) {
        if (mimeTypes[fileExtension]) {
            var contentType = mimeTypes[fileExtension];
        }
    }

    // Falls AJAX-Request
    if (path.indexOf("/src/ajax/") == 0) {
        if (!okToServe) {
            response.writeHead(403);
            response.end("Access denied! (Error 403)", 'utf8');
        }
        var file = path.replace("/src/ajax/", "");
        file = file.replace(/\?.*/, "");
        var ajax = require('./src/js/server/' + file);
        ajax.init(request, response);
        return;
    }
    // Falls Page-Request
    else if (!extension) {
        var template = require('./src/js/server/Template');
        var html = template.getPage(path);
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(html, 'utf8');
    }
    // Falls File-Request
    else {
        path = '.' + path;
        fs.exists(path, function (exists) {
            if (!okToServe) {
                response.writeHead(403);
                response.end("Access denied! (Error 403)", 'utf8');
            }
            else if (exists && okToServe) {
                fs.readFile(path, function (error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf8');
                    }
                });
            }
            else {
                var template = require('./src/js/server/Template');
                var html = template.getPage('/404');
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(html, 'utf8');
            }
        });
    }

}).listen(PORT);

console.log('Server running and listening on port '+PORT+'.');