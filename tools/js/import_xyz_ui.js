/**
 * UI scripts for the import_xyz tools
 * @author David Dorchies
 * @date 07/06/2016
 */
$(function() {
	$('#fileinput').change(readSingleFile);
	//document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

	$( "#draw" ).button()
	.click(function() {
		dialog_reset.dialog( "open" );
	});

	$( "#exportsic" ).button()
	.click(function() {
		route.setSections();
		spinner_spaceX.spinner("value", $.expCfg.sectionSpaceStep);
		spinner_sectionWidth.spinner("value", $.expCfg.sectionWidth);
		spinner_edgeMaxLength.spinner("value", $.expCfg.edgeMaxLength);
		dialog_configuration.dialog( "open" );
	});

	$( "#convertpk" ).button()
	.click(function() {
		xyz2pK.convert();
	});

	dialog_export = $( "#dialog-export" ).dialog({
		autoOpen: false,
		modal: true,
		height: 500,
		width: 500
	});

	dialog_reset = $( "#dialog-reset" ).dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		buttons: {
			"Delete route": function() {
				canal.render();
				route.start();
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});

	var spinner_spaceX = $( "#spinner_spaceX" ).spinner();
	var spinner_sectionWidth = $( "#spinner_sectionWidth" ).spinner();
	var spinner_edgeMaxLength = $( "#spinner_edgeMaxLength" ).spinner();
	dialog_configuration = $( "#dialog-configuration" ).dialog({
		autoOpen: false,
		modal: true,
		//width: 500,
		buttons: {
			"Generate section profiles": function() {
				// Save new parameters
				$.expCfg.sectionSpaceStep = spinner_spaceX.spinner("value");
				$.expCfg.sectionWidth = spinner_sectionWidth.spinner("value");
				$.expCfg.edgeMaxLength = spinner_edgeMaxLength.spinner("value");
				$( this ).dialog( "close" );
				// Compute triangulation and section profiles
				canal.triangulate();
				route.setSections();
				route.computeSections();
				route.render();
				route.computeProfils();
				sic_ascii(route.sections);
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});

});

$( document ).ready(function() {$( "#toolbar" ).hide();});
