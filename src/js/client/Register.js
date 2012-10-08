// Stellt alle für den Registrierungsvorgang notwendingen Funktionen zur Verfügung
var Register = {

    /**
     * Initialisiert die request()-Funktion und übergibt dieser dabei als Parameter eine
     * Callback-Funktion
     */
	action : function() {
		this.request(function(data) {
			console.log('register request failed');
			console.log(data);
		});
	},

    /**
     * Erstellt einen AJAX-Request an den Server und überträgt dabei die im Formular
     * angegebenen Daten 
     * @param {Function} callback Die Callback-Funktion
     */
	request : function(callback) {
		this.removeErrorMessages();
		require(['utility/SHA256'], function() {
			var username = $('form[name="register"] input[name="username"]').val();
			var mail = $('form[name="register"] input[name="mail"]').val();
			var password = $('form[name="register"] input[name="password"]').val();
			if (password.length > 0 && password.length < 5) {
				password = "xxx";
			}
			else if (password.length >= 5) {
				password = SHA256(password);
			}
			$.ajax('src/ajax/Register', {
				type: 'GET',
				dataType: 'json',
				data: {
					username: username,
					mail: mail,
					password: password
				},
				success: function(data) {
					if (data.server) {
						if (data.fields) {
							$.each(data.fields, function(k, v) {
								Register.addErrorMessage(k, v);
							});
						}
					}
					else if (data.html) {
						$('#content').append(data.html);
					}
				},
				error: function(data) {
					if (callback) {
						callback(data);
					}
				}
			});
		});
	},

    /**
     * Fügt eine Fehlermeldung an das betroffene Eingabefeld an
     * @param {String} inputName Der Name des betroffenen Eingabefelds
     * @param {String} errorMessage Die Fehlermeldung
     */
	addErrorMessage : function(inputName, errorMessage) {
		var errorItem = '<tr class="formError"><td></td><td>'+errorMessage+'</td></tr>';
		var item = $('form[name="register"] :input[name="'+inputName+'"]');
		$(item).css("border", "1px solid #f90");
		var itemRow = $(item).closest("tr");
		itemRow.after(errorItem);
	},

    /**
     * Entfernt alle Fehlermeldungen
     */
	removeErrorMessages : function() {
		var items = $('form[name="register"] :input:not([type="button"],[type="checkbox"])');
		$.each(items, function(k, v) {
			$(v).removeAttr("style");
		});
		var errorItems = $('form[name="register"] .formError');
		$.each(errorItems, function(k, v) {
			$(v).remove();
		});
	}

};