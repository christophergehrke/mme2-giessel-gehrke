/**
 * Benutzer-Klasse
 * @constructor
 * @param {String} mail E-Mail-Adresse des Benutzers
 * @param {String} password Verschlüsseltes Passwort des Benutzers
 * @param {String} password_salt Passwort Salt des Benutzers
 * @param {String} username Benutzername des Benutzers
 * @param {Number} created UNIX-Timestamp des Zeitpunkts der Registrierung des Benutzers
 * @param {Number=} last_login UNIX-Timestamp des Zeitpunkts der letzten Anmeldung des Benutzers
 * @param {Number=} id ID des Benutzers in der Datenbank
 */
var Benutzer = function (mail, password, password_salt, username, created, last_login, id) {
    this.mail = mail || null;
    this.password = password || null;
    this.password_salt = password_salt || null;
    this.username = username || null;
    this.created = created || null;
    this.last_login = last_login || null;
    this.id = id || null;
};

// Definition der Klassenmethoden
Benutzer.prototype = {
    getMail: function () {
        return this.mail;
    },
    getPassword: function () {
        return this.password;
    },
    getPasswordSalt: function () {
        return this.password_salt;
    },
    getUsername: function () {
        return this.username;
    },
    getCreated: function () {
        return this.created;
    },
    getLastLogin: function () {
        return this.last_login;
    },
    getID: function () {
        return this.id;
    }
};

// Exportieren der Klasse
module.exports = Benutzer;