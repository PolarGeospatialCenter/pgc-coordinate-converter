$ = jQuery = require('jquery');
//require('http://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js');
require('bootstrap');
require('jquery-validate');
proj4 = require('proj4');


var validator;

var sr3031 = "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
var sr3413 = "+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
var sr4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

// EVENT LISTENERS FOR FORM CONTROL (CHANGE AND BLUR) //
$("#convertCoordinatesForm input").change(function() { updateCoordinateForm(this.name); });
$("#convertCoordinatesForm input").keyup(function() { updateCoordinateForm(this.name); });

$("#convertCoordinatesForm select").change(function() { updateCoordinateForm(this.name); });

$("#resetFormButton").click(function() {
  $("#convertCoordinatesForm input").val(0);
  $("#convertCoordinatesForm input[data-coord-type=latlon]").eq(0).change();  // Trigger change event for latitude
});

$("#gmapsButton").hide();


// Forms/Return Key Fix
$("form").bind("keypress", function(e) { if (e.keyCode == 13) return false;});

// FORM VALIDATION SETUP
validator = $("#convertCoordinatesForm").validate({
  debug: true,
  errorPlacement: function(error, element) {
    $("#coordinateAlertMessages").append("<li>"+$(element).attr('data-message')+error[0].innerText+"</li>");
  }
});

// UPDATE FORM ON PAGE LOAD
updateCoordinateForm("dd");

function updateCoordinateForm(name) {
	if (name == "dd") {
		var dd = parseFloat($("#inputLatDD").val());
		var degs = dd | 0;
		var mins = Math.abs((dd - degs)*60) | 0;
		var secs = Math.abs((dd - degs)*3600) - (mins * 60);
		if (dd < 0) { $("#inputLatDDMdir").val("S"); $("#inputLatDMSdir").val("S"); }
		else { $("#inputLatDDMdir").val("N"); $("#inputLatDMSdir").val("N"); }
		$("#inputLatDDMdeg").val(Math.abs(degs) || 0);
		$("#inputLatDDMmin").val(Math.abs((dd - degs)*60).toFixed(6) || 0.0);
		$("#inputLatDMSdeg").val(Math.abs(degs) || 0);
		$("#inputLatDMSmin").val(mins || 0);
		$("#inputLatDMSsec").val(secs.toFixed(4) || 0.0);

		var dd = parseFloat($("#inputLonDD").val());
		var degs = dd | 0;
		var mins = Math.abs((dd - degs)*60) | 0;
		var secs = Math.abs((dd - degs)*3600) - (mins * 60);
		if (dd < 0) { $("#inputLonDDMdir").val("W"); $("#inputLonDMSdir").val("W"); }
		else { $("#inputLonDDMdir").val("E"); $("#inputLonDMSdir").val("E"); }
		$("#inputLonDDMdeg").val(Math.abs(degs) || 0);
		$("#inputLonDDMmin").val(Math.abs((dd - degs)*60).toFixed(6) || 0.0);
		$("#inputLonDMSdeg").val(Math.abs(degs) || 0);
		$("#inputLonDMSmin").val(mins || 0);
		$("#inputLonDMSsec").val(secs.toFixed(4) || 0.0);

		coords = projectCoords($("#inputLatDD").val(),$("#inputLonDD").val(),sr4326,sr3031);
		$("#inputLatAPS").val(parseFloat(coords.lat).toFixed(6) || 0.0);
		$("#inputLonAPS").val(parseFloat(coords.lon).toFixed(6) || 0.0);
	}
	else if (name == "ddm") {
		if ($("#inputLatDDMdir").val() == "S") { var mult = -1; $("#inputLatDMSdir").val("S"); }
		else { var mult = 1; $("#inputLatDMSdir").val("N"); }

		var degs = parseInt($("#inputLatDDMdeg").val());
		var mins = parseFloat($("#inputLatDDMmin").val());
		var secs = Math.abs((mins - (mins | 0)) * 60);
		$("#inputLatDD").val(mult*(degs + mins / 60).toFixed(6) || 0.0);
		$("#inputLatDMSdeg").val(degs || 0);
		$("#inputLatDMSmin").val(mins | 0 || 0);
		$("#inputLatDMSsec").val(secs.toFixed(4) || 0.0);

		if ($("#inputLonDDMdir").val() == "W") { var mult = -1; $("#inputLonDMSdir").val("W"); }
		else { var mult = 1; $("#inputLonDMSdir").val("W"); }

		var degs = parseInt($("#inputLonDDMdeg").val());
		var mins = parseFloat($("#inputLonDDMmin").val());
		var secs = Math.abs((mins - (mins | 0)) * 60);
		$("#inputLonDD").val(mult*(degs + mins / 60).toFixed(6) || 0.0);
		$("#inputLonDMSdeg").val(degs || 0);
		$("#inputLonDMSmin").val(mins | 0 || 0);
		$("#inputLonDMSsec").val(secs.toFixed(4) || 0.0);

		coords = projectCoords($("#inputLatDD").val(),$("#inputLonDD").val(),sr4326,sr3031);
		$("#inputLatAPS").val(parseFloat(coords.lat).toFixed(6) || 0.0);
		$("#inputLonAPS").val(parseFloat(coords.lon).toFixed(6) || 0.0);
	}
	else if (name == "dms") {
		if ($("#inputLatDMSdir").val() == "S") { var mult = -1; $("#inputLatDDMdir").val("S"); }
		else { var mult = 1; $("#inputLatDDMdir").val("N"); }

		var degs = parseInt($("#inputLatDMSdeg").val());
		var mins = parseInt($("#inputLatDMSmin").val());
		var secs = parseFloat($("#inputLatDMSsec").val());
		var val=mins/60;
		$("#inputLatDD").val(mult*(degs + val + (secs/3600)).toFixed(6) || 0.0);
		$("#inputLatDDMdeg").val(degs || 0);
		$("#inputLatDDMmin").val((mins + secs/60).toFixed(6) || 0.0);

		if ($("#inputLonDMSdir").val() == "W") { var mult = -1; $("#inputLonDDMdir").val("W"); }
		else { var mult = 1; $("#inputLonDDMdir").val("E"); }

		var degs = parseInt($("#inputLonDMSdeg").val());
		var mins = parseInt($("#inputLonDMSmin").val());
		var secs = parseFloat($("#inputLonDMSsec").val());
		var val=mins/60;
		$("#inputLonDD").val(mult*(degs + val + (secs/3600)).toFixed(6) || 0.0);
		$("#inputLonDDMdeg").val(degs || 0);
		$("#inputLonDDMmin").val((mins + secs/60).toFixed(6) || 0.0);

		coords = projectCoords($("#inputLatDD").val(),$("#inputLonDD").val(),sr4326,sr3031);
		$("#inputLatAPS").val(parseFloat(coords.lat).toFixed(6) || 0.0);
		$("#inputLonAPS").val(parseFloat(coords.lon).toFixed(6) || 0.0);
	}

	else if (name == "aps") {
		coords = projectCoords($("#inputLatAPS").val(),$("#inputLonAPS").val(),sr3031,sr4326);
		var dd = parseFloat(coords.lat);
		var degs = dd | 0;
		var mins = Math.abs((dd - degs)*60) | 0;
		var secs = Math.abs((dd - degs)*3600) - (mins * 60);
		$("#inputLatDD").val(dd.toFixed(6) || 0.0);
		if (dd < 0) { $("#inputLatDDMdir").val("S"); $("#inputLatDMSdir").val("S"); }
		else { $("#inputLatDDMdir").val("N"); $("#inputLatDMSdir").val("N"); }
		$("#inputLatDDMdeg").val(Math.abs(degs) || 0);
		$("#inputLatDDMmin").val(Math.abs((dd - degs)*60).toFixed(6) || 0.0);
		$("#inputLatDMSdeg").val(Math.abs(degs) || 0);
		$("#inputLatDMSmin").val(mins || 0);
		$("#inputLatDMSsec").val(secs.toFixed(4) || 0.0);

		var dd = parseFloat(coords.lon);
		var degs = dd | 0;
		var mins = Math.abs((dd - degs)*60) | 0;
		var secs = Math.abs((dd - degs)*3600) - (mins * 60);
		$("#inputLonDD").val(dd.toFixed(6) || 0.0);
		if (dd < 0) { $("#inputLonDDMdir").val("W"); $("#inputLonDMSdir").val("W"); }
		else { $("#inputLonDDMdir").val("E"); $("#inputLonDMSdir").val("E"); }
		$("#inputLonDDMdeg").val(Math.abs(degs) || 0);
		$("#inputLonDDMmin").val(Math.abs((dd - degs)*60).toFixed(6) || 0.0);
		$("#inputLonDMSdeg").val(Math.abs(degs) || 0);
		$("#inputLonDMSmin").val(mins || 0);
		$("#inputLonDMSsec").val(secs.toFixed(4) || 0.0);
	}

	validateForm();
}

function validateForm() {

	// CUSTOM VALIDATION
	$("input[name*=m]").each(function() { updateNegativeValues(this); });  // For DDM and DMS, make sure there are no negative values

	var invalids = 0;
	$("input").each(function() { if (!$(this).valid()) { invalids+=1; } });
	$("#coordinateAlertMessages").empty();
	if (invalids > 0) {
		$("input").each(function() {
			if (!$(this).valid()) {
				$(this).css("background-color","#F2DEDE");
				invalids+=1;
			}
			else { $(this).css("background-color","#FFFFFF"); }
		});
		$("#coordinateAlert").show();
		updateCopyText("invalid");
	}
	else {
		$("input").each(function() { $(this).css("background-color","#FFFFFF"); });
		$("#coordinateAlert").hide();
		$("#coordinateAlertMessages").empty();
		updateCopyText("valid");
	}
}

function updateNegativeValues(el) {
	var degs = parseInt($(el).val());
	if (degs < 0) { $(el).val(degs*-1) }
}

function updateCopyText(status) {
	if (status == "valid") {
		$("#ddLatText").html($("#inputLatDD").val().toString());
		$("#ddLonText").html($("#inputLonDD").val().toString());
		$("#ddmLatText").html($("#inputLatDDMdeg").val()+"° "+ $("#inputLatDDMmin").val().toString()+"' "+$("#inputLatDDMdir").val());
		$("#ddmLonText").html($("#inputLonDDMdeg").val()+"° "+ $("#inputLonDDMmin").val().toString()+"' "+$("#inputLonDDMdir").val());
		$("#dmsLatText").html($("#inputLatDMSdeg").val()+"° "+ $("#inputLatDMSmin").val()+"' "+$("#inputLatDMSsec").val().toString()+"\" "+$("#inputLatDMSdir").val());
		$("#dmsLonText").html($("#inputLonDMSdeg").val()+"° "+ $("#inputLonDMSmin").val()+"' "+$("#inputLonDMSsec").val().toString()+"\" "+$("#inputLonDMSdir").val());

		$("#apsLatText").html($("#inputLatAPS").val().toString());
		$("#apsLonText").html($("#inputLonAPS").val().toString());

		var latSign,lonSign;
		if ($("#inputLatDD").val() < 0) { latSign = "-" } else { latSign = "+" };
		if ($("#inputLonDD").val() < 0) { lonSign = "-" } else { lonSign = "+" };

		$("#isoLatText").html(latSign + pad($("#inputLatDMSdeg").val(),2) + pad($("#inputLatDMSmin").val(),2) + $("#inputLatDMSsec").val().toString());
		$("#isoLonText").html(latSign + pad($("#inputLonDMSdeg").val(),3) + pad($("#inputLonDMSmin").val(),2) + $("#inputLonDMSsec").val().toString());

		$("#gmapsButton").attr("href","https://maps.google.com/maps?q="+$("#inputLatDD").val().toString()+","+$("#inputLonDD").val().toString());
		$("#gmapsButton").show();
	}
	else {
		$("#gmapsButton").hide();
		$("#ddLatText").html("-");
		$("#ddLonText").html("-");
		$("#ddmLatText").html("-");
		$("#ddmLonText").html("-");
		$("#dmsLatText").html("-");
		$("#dmsLonText").html("-");
	}
}

// HELPER FUNCTIONS
function pad(n,w) {
	n = n+'';
	return n.length >= w ? n : new Array(w - n.length + 1).join(0) + n;
}

function projectCoords(y,x,inSR,outSR) {
  var np = proj4(inSR,outSR).forward([y,x]);
  return {'lat':np[0],'lon':np[1]};
}

// function projectCoords(y,x,inSR,outSR) {
// 	var p = new proj4.Point(parseFloat(x),parseFloat(y));
// 	var np = proj4.transform(inSR, outSR, p);
// 	return {'lat':np.y,'lon':np.x};
// }
