// Laden des MySQL-Moduls
var mysql = require('mysql');

// Laden der für die Datenbank notwendigen Klassen
var Benutzer = require('./../class/Benutzer');

/**
 * Baut eine Verbindung zur Datenbank auf, und liefert diese als Objekt zurück
 * @return {Object|Null} connection Die Datenbankverbindung
 */
function connect() {
	var connection = mysql.createConnection({
	  host : 'localhost',
	  user : 'root',
	  password : '',
	  database : 'MME2'
	});
	connection.connect(function(err) {
		if (err) {
			connection = null;
		}
	});
	return connection;
};

/**
 * Durchsucht die Datenbank nach Tupeln, die mindestens ein Attribut mit dem
 * Dummy-Objekt übereinstimmt
 * @param {Object} dummyObj Das Dummy-Objekt
 * @param {Function} callback Die Callback-Funktion
 */
exports.readByArguments = function (dummyObj, callback) {
    var connection = connect();

    var whereQuery = "";
    var values = [];
    for (var key in dummyObj) {
        if (dummyObj[key] !== null && typeof dummyObj[key] != "function") {
            whereQuery += key + " = ? OR ";
            values.push(dummyObj[key]);
        }
    }
    whereQuery = whereQuery.substring(0, whereQuery.length - 4);

    var classBroker = null;
    if (dummyObj instanceof Benutzer) {
        classBroker = require('./BenutzerBroker');
    }
    if (classBroker !== null) {
        classBroker.readByArguments(whereQuery, values, connection, function (err) {
            if (err) {
                connection.end();
                callback(err, null);
            }
        }, function (success) {
            if (success) {
                connection.end();
                callback(null, success);
            }
        });
    }
    else {
        connection.end();
        callback(-1, null);
    }
};

/**
 * Schreibt ein Objekt in die Datenbank
 * @param {Object} obj Das Objekt, dass in die Datenbank geschrieben werden soll
 * @param {Function} callback Die Callback-Funktion
 */
exports.write = function (obj, callback) {
    var connection = connect();
    var classBroker = null;
    if (obj instanceof Benutzer) {
        classBroker = require('./BenutzerBroker');
    }
    if (classBroker !== null) {
        classBroker.write(obj, connection, function (err) {
            if (err) {
                connection.end();
                callback(err, null);
            }
        }, function (success) {
            if (success) {
                connection.end();
                callback(null, success);
            }
        });
    }
    else {
        connection.end();
        callback(-1, null);
    }
};