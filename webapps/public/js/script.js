/*jshint esversion: 6 */

/*********** MessageBox ****************/
// simply show info.  Only close button
function infoMessageBox(message, title){
	$("#info-body").html(message);
	$("#info-title").html(title);
	$("#info-popup").modal('show');
}

// simply show info.  Only close button. large window
function infoMessageBoxLg(message, title){
	$("#info-body-lg").html(message);
	$("#info-title-lg").html(title);
	$("#info-popup-lg").modal('show');
}

// modal with full control
function messageBox(body, title, ok_text, close_text, callback){
	$("#modal-body").html(body);
	$("#modal-title").html(title);
	if (ok_text) $("#modal-button").html(ok_text);
	if(close_text) $("#modal-close-button").html(close_text);
	$("#modal-button").unbind("click"); // remove existing events attached to this
	$("#modal-button").click(callback);
	$("#popup").modal("show");
}
/*********** dash actions ****************/
