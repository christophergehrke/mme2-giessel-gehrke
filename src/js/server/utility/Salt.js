/**
 * Nimmt eine Längenangabe, und liefert einen zufällig generierten String (Salt) der angegebenen Länge zurück
 * @param {Number} len Die Zeichenlänge des zu erstellenden Salt
 * @return {String} salt Der erstellte Salt
 */
exports.createSalt = function(len) {
	var salt = "";
	while(salt.length < len) {
		salt += Math.random().toString(36).substring(2, 19);
	}
	return salt.substring(0,len);
};