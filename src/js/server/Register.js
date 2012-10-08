var url = require('url');
var broker = require('./utility/broker/Broker');
var Benutzer = require('./utility/class/Benutzer');

/**
 * Initialisiert den Registrierungsvorgang
 * @param {Object} request Das Request-Objekt
 * @param {Object} response Das Response-Objekt
 */
exports.init = function (request, response) {
    var url_parts = url.parse(request.url, true);
    var data = url_parts.query;

    var jsonResponse;

    // Validierung der beim Request übergebenen Daten
    var missingArguments = checkForMissingArguments(data);
    if (countObjectLength(missingArguments) > 0) {
        jsonResponse = {
            "server": "missing argument exception",
            "fields": missingArguments
        };
        returnResponse(response, jsonResponse);
    }
    var illegalArguments = checkForIllegalArguments(data);
    if (countObjectLength(illegalArguments) > 0) {
        jsonResponse = {
            "server": "illegal argument exception",
            "fields": illegalArguments
        };
        returnResponse(response, jsonResponse);
    }

    // Benutzerdummy erstellen
    data["mail"] = data["mail"].toLowerCase();
    var dummyObj = new Benutzer(data["mail"], null, null, data["username"], null);

    // Datenbank anhand des Benutzerdummys auf bereits vorhandene Einträge durchsuchen
    broker.readByArguments(dummyObj, function readCallback(err, success) {
        if (err) {
            if (err == -1) {
                jsonResponse = {
                    "server": "Bei der Datenbankabfrage ist ein Fehler aufgetreten."
                };
            }
            else {
                jsonResponse = {
                    "server": "Es ist ein Query-Fehler aufgetreten. SQL-Query: " + err.code
                };
            }
            returnResponse(response, jsonResponse);
        }
        if (success) {

            // Wenn keine Einträge gefunden wurden
            if (success == -1) {

                // Benutzer erstellen
                data["password_salt"] = createPasswordSalt();
                data["password"] = encryptPassword(data["password"], data["password_salt"]);
                data["created"] = Math.round(+new Date() / 1000);
                var userObj = new Benutzer(data["mail"], data["password"], data["password_salt"], data["username"], data["created"]);

                // Benutzer in die Datenbank schreiben
                broker.write(userObj, function(err, success) {
                    if (err) {
                        if (err == -1) {
                            jsonResponse = {
                                "server": "Bei der Datenbankabfrage ist ein Fehler aufgetreten."
                            };
                        }
                        else {
                            jsonResponse = {
                                "server": "Es ist ein Query-Fehler aufgetreten. SQL-Query: " + err.code
                            };
                        }
                        returnResponse(response, jsonResponse);
                    }
                    if (success) {
                        jsonResponse = {
                            "html" : '<div id="registrationSucceeded"><h2>Herzlichen Glückwunsch, du hast dich erfolgreich registriert!</h2><p>Du kannst dich jetzt beim System <a href="/login">anmelden</a>.</p></div>'
                        };
                        returnResponse(response, jsonResponse);
                    }
                });
            }

            // Wenn Benutzer gefunden wurde
            else {
                if (success.getUsername().toLowerCase() == dummyObj.getUsername().toLowerCase()) {
                    jsonResponse = {
                        "server": "illegal argument exception",
                        "fields": { "username": "Dieser Benutzername ist bereits vergeben." }
                    };
                }
                else {
                    jsonResponse = {
                        "server": "illegal argument exception",
                        "fields": { "mail": "Diese E-Mail-Adresse wird bereits verwendet." }
                    };
                }
                returnResponse(response, jsonResponse);
            }
        }
    });
};

/**
 * Liefert einen zufällig generierten String (Salt) mit einer Länge von 64 Zeichen
 * @return {String} salt Der erstellte Salt mit der Länge von 64 Zeichen
 */
function createPasswordSalt() {
    var salt = require('./utility/Salt');
    return salt.createSalt(64);
};

/**
 * Verschlüsselt das Passwort mit Hilfe des Verschlüsselungs-Algorithmus SHA256
 * @param {String} password Das unverschlüsselte Passwort
 * @param {String} salt Der Salt
 * @return {String} password Das verschlüsselte Passwort
 */
function encryptPassword(password, salt) {
	var crypt = require('./utility/SHA256');
	return crypt.SHA256(password+salt);
};

/**
 * Nimmt die übergebenen Daten, und liefert ein assoziatives Array mit allen fehlenden Daten und
 * der entsprechenden Fehlermeldung zurück 
 * @param {Object} data Die beim Request übergebenen Querydaten
 * @return {Object} missingArguments Assoziatives Array mit allen fehlenden Daten und der
 *      entsprechenden Fehlermeldung
 */
function checkForMissingArguments(data) {
	var missingArguments = new Object();
	if (!data.username || data.username == "") {
		missingArguments["username"] = "Du hast keinen Benutzernamen angegeben."
	}
	if (!data.mail || data.mail == "") {
		missingArguments["mail"] = "Du hast keine E-Mail-Adresse angegeben."
	}
	if (!data.password || data.password == "") {
		missingArguments["password"] = "Du hast kein Passwort angegeben.";
	}
	return missingArguments;
};

/**
 * Nimmt die übergebenen Daten, und liefert ein assoziatives Array mit allen ungültigen Daten und
 * der entsprechenden Fehlermeldung zurück 
 * @param {Object} data Die beim Request übergebenen Querydaten
 * @return {Object} illegalArguments Assoziatives Array mit allen ungültigen Daten und der
 *      entsprechenden Fehlermeldung
 */
function checkForIllegalArguments(data) {
	var illegalArguments = new Object();
	if (!data.username.match(/^.{5,12}$/)) {
		illegalArguments["username"] = "Dein Benutzername ist zu kurz. Benutzernamen müssen aus 5 bis 12 Zeichen bestehen.";
	}
	else if (!data.username.match(/^[a-zA-Z0-9äßú]{5,12}$/)) {
		illegalArguments["username"] = "Dein Benutzername enthält ungültige Zeichen. Bitte verwende nur die alphanumerischen Zeichen (A-Z und 0-9).";
	}
	if (!data.mail.match(/^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@((\w+\+*\-*)+\.?)*[\w-]+\.[a-z]{2,6}$/)) {
		illegalArguments["mail"] = "Du hast eine ungültige E-Mail-Adresse angegeben.";
	}
	if (!data.password.match(/^[a-z0-9]{64}$/)) {
		illegalArguments["password"] = "Dein Passwort ist zu kurz. Passwörter müssen aus mindestens 5 Zeichen bestehen.";
	}
	return illegalArguments;
};

/**
 * Nimmt ein Objekt, und liefert dessen Länge (Anzahl der keys) zurück
 * @param {Object} obj Das zu zählende Objekt
 * @return {Number} len Die Länge des Objekts (Anzahl der keys)
 */
function countObjectLength(obj) {
	var len = 0;
	var key;
	for (key in obj) {
		len++;
	}
	return len;
};

/**
 * Beendet den Request
 * @param {Object} response Das Response-Objekt
 * @param {Object} jsonResponse Die Antwort des Servers als JSON-Objekt
 */
function returnResponse(response, jsonResponse) {
	response.writeHead(200, { 'Content-Type': 'text/json' });
	response.end(JSON.stringify(jsonResponse), 'utf-8');
};