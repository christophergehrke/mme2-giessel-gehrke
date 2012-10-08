// Laden der Benutzerklasse
var Benutzer = require('./../class/Benutzer');

/**
 * Durchsucht die Datenbank nach bestimmten Tupeln
 * @param {String} whereQuery Where-Teil des MySQL-Query
 * @param {Array} values Attributwerte
 * @param {Function} errCallback Die onError-Callback-Funktion
 * @param {Function} successcallback Die onSuccess-Callback-Funktion
 */
exports.readByArguments = function (whereQuery, values, connection, errCallback, successCallback) {
    var query = connection.query('SELECT * FROM Benutzer WHERE ' + whereQuery, values, function (err, result) {
        if (err) {
            errCallback(err);
        }
        else {
            if (result[0]) {
                successCallback(new Benutzer(result[0].mail, result[0].password, result[0].password_salt, result[0].username, result[0].created, result[0].last_login, result[0].id));
            }
            else {
                successCallback(-1);
            }
        }
    });
};

/**
 * Schreibt einen Benutzer in die Datenbank
 * @param {Object} user Der Benutzer
 * @param {Object} connection Die Datenbankverbindung
 * @param {Function} errCallback Die onError-Callback-Funktion
 * @param {Function} successcallback Die onSuccess-Callback-Funktion
 */
exports.write = function (user, connection, errCallback, successCallback) {
    var mail = user.getMail();
    var password = user.getPassword();
    var password_salt = user.getPasswordSalt();
    var username = user.getUsername();
    var created = user.getCreated();
    var query = connection.query('INSERT INTO Benutzer SET mail = ?, password = ?, password_salt = ?, username = ?, created = ?', [mail, password, password_salt, username, created], function (err, result) {
        if (err) {
            errCallback(err);
        }
        else {
            if (result.insertId) {
                successCallback(result.insertId);
            }
            else {
                errCallback(-1);
            }
        }
    });
};