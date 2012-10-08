/**
 * Nimmt einen Pfad, und liefert eine HTML-Seite als String zurück
 * @param {String} path Der Pfad des Requests
 * @return {String} html Die HTML-Seite
 */
exports.getPage = function(path) {

	var html = getFrame();
	
	var content;
	switch (path) {
		case "/":
			content = contentRegister();
			break;
		default:
			content = content404();
			break;
	}
	
	var title = "MME2 Projekt";
	var footer = "";
	var script = getScript(path);

	html = html.replace("#{content}", content);
	html = html.replace("#{title}", title);
	html = html.replace("#{footer}", footer);
	html = html.replace("#{script}", script);
	
	return html;
};

/**
 * Liefert die Registrierungs-HTML-Seite als String zurück
 * @return {String} html Die Registrierungs-HTML-Seite
 */
contentRegister = function() {
	var html;
	html  = '<form name="register">';
	html += '<table colspan="0" rowspan="0">';
	html += '<tr><td><label name="username">Benutzername</label></td><td><input name="username" tabindex="1" maxlength="12" autocomplete="off" type="text"></td></tr>';
	html += '<tr><td><label name="mail">E-Mail-Adresse</label></td><td><input name="mail" tabindex="2" maxlength="75" autocomplete="off" type="text"></td></tr>';
	html += '<tr><td><label name="password">Passwort</label></td><td><input name="password" tabindex="3" maxlength="15" autocomplete="off" type="password"></td></tr>';
	html += '<tr><td></td><td><input value="Registrieren" type="button" onclick="Register.action()"></td></tr>';
	html += '</table>';
	html += '</form>';
	return html;
};

/**
 * Liefert die Fehler404-HTML-Seite als String zurück
 * @return {String} html Die Fehler404-HTML-Seite
 */
content404 = function() {
	var html;
	html  = '<h1>Error 404, sorry!</h1>';
	return html;
};

/**
 * Liefert die das HTML-Template als String zurück
 * @return {String} html Das HTML-Template
 */
getFrame = function () {
	var html = '<!DOCTYPE html>\n';
	html += '<html lang="de">\n';
	html += '\t<head>\n';
	html += '\t\t<meta charset="utf-8" />\n';
	html += '\t\t<title>#{title}</title>\n';
	html += '\t\t<link rel="stylesheet" media="screen" href="/src/css/main.css">\n';
	html += '\t\t<script type="text/javascript" src="/src/js/jquery-1.8.2.min.js"></script>\n';
	html += '\t\t<script type="text/javascript" data-main="/src/js/client/Main" src="/src/js/requirejs.js"></script>\n';
	html += '\t</head>\n';
	html += '\t<body>\n';
	html += '\t\t<div id="wrapper">\n';
	html += '\t\t\t<div id="main">\n';
	html += '\t\t\t\t<div id="content">\n';
	html += '\t\t\t\t\t#{content}\n';
	html += '\t\t\t\t</div>\n';
	html += '\t\t\t</div>\n';
	html += '\t\t\t<footer>\n';
	html += '\t\t\t\t#{footer}\n';
	html += '\t\t\t</footer>\n';
	html += '\t\t</div>';
	html += '#{script}\n';
	html += '\t</body>\n';
	html += '</html>';
	return html;
};

/**
 * Liefert den seitenspezifischen JavaScript-Teil als String zurück
 * @param {String} path Der Pfad des Requests
 * @return {String} html Der seitenspezifische JavaScript-Teil
 */
getScript = function(path) {
	var html = "";
	switch (path) {
		case "/":
			html  = "<script>";
			html += "require(['Register'], function() { });";
			html += "</script>";
			break;
		default:
			break;
	}
	return html;
};