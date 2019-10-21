/**
 * UI scripts for the import_xyz tools
 * @author David Dorchies
 * @date 07/06/2016
 */
$(function() {
	$('#fileinput').change(readSingleFile);
	//document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

	$("#newfile").button()
	.click(function() {
		window.location.reload();
	});

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
		spinner_pKspaceX.spinner("value", $.expCfg.sectionPKSpaceStep);
		spinner_cpMaxWidth.spinner("value", $.expCfg.cpMaxWidth);
		spinner_sectionMinPoints.spinner("value", $.expCfg.sectionMinPoints);
		dialog_configuration_pk.dialog( "open" );
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

	var spinner_pKspaceX = $( "#spinner_pKspaceX" ).spinner({ step: 0.1 });
	var spinner_cpMaxWidth = $( "#spinner_cpMaxWidth" ).spinner();
	var spinner_sectionMinPoints = $( "#spinner_sectionMinPoints" ).spinner();
	dialog_configuration_pk = $( "#dialog-configuration-pk" ).dialog({
		autoOpen: false,
		modal: true,
		//width: 500,
		buttons: {
			"Generate section profiles": function() {
				// Save new parameters
				$.expCfg.sectionPKSpaceStep = spinner_pKspaceX.spinner("value");
				$.expCfg.cpMaxWidth = spinner_cpMaxWidth.spinner("value");
				$.expCfg.sectionMinPoints = spinner_sectionMinPoints.spinner("value");
				$( this ).dialog( "close" );
				xyz2pK.convert();
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});

});
