/**
 * Scripts for generating profile section from xyz points
 */



function readSingleFile(evt) {
	//Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0];

	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			$.txtContent.s = e.target.result;
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}


/*
 * Objet gérant la triangulation
 */
function Canal() {
	this.boundaries = [{'min':Infinity,'max':-Infinity},{'min':Infinity,'max':-Infinity},{'min':Infinity,'max':-Infinity}]; /// Boundaries of the xyz points
    this.c2cRatio = 0.; /// Ratio for converting Canvas to Coords (for keeping aspect ratio)
    this.c2cCenterGap = []; /// Gap for centering the figure
	this.vertices = []; /// Store xyz points
	this.triangles = []; /// Store Delaunay triangle output

    /**
    * Compute parameters mandatory for coordinates conversion
    * @param canvas canvas object with properties width and height
    * @author David Dorchies
    * @date 24/07/2016
    */
    this.calcC2Cparameters = function (canvas) {
        // Ratio conversion between original coords system and canvas coords
        this.c2cRatio = Math.max(this.boundaries[0].max - this.boundaries[0].min,this.boundaries[1].max - this.boundaries[1].min);
        // Gap for centering the figure
        var axeLength = [canvas.width, canvas.height];
        for(var i = 0; i < 2; i++) {
            this.c2cCenterGap[i] = (axeLength[i] - (this.boundaries[i].max - this.boundaries[i].min) * axeLength[i] / this.c2cRatio) / 2;
        }
    }


    /**
     * Compute coordinates of one point in the canvas from boundaries of points to be drawn
     * @param canvas canvas object with properties width and height
     * @param boundaries array of dim 2 (1 for each 2 axes x and y) with properties min and max
     * @param xy array of dim 2 with respectively coordinates x and y of the point to compute
     * @author David Dorchies
     * @date 20/04/2016
     */
    this.coords2Canvas = function(canvas, xy) {
        var axeLength = [canvas.width, canvas.height];
        var xy2 = Array(2);

        for(var i=0; i<2; i++) {
            xy2[i] = (xy[i] - this.boundaries[i].min) * axeLength[i] / this.c2cRatio + this.c2cCenterGap[i];
        }
        // bottom and top are inverted for the canvas
        xy2[1] = axeLength[1] - xy2[1];
        return xy2;
    }


	/**
	 * Compute the segments from Delaunay triangulation outputs
	 */
	this.triangles2Segments = function() {
		var s = [];
		for(var i=this.triangles.length; i;) {
			i--;s.push([this.triangles[i],this.triangles[i-1]]);
			i--;s.push([this.triangles[i],this.triangles[i-1]]);
			i--;s.push([this.triangles[i],this.triangles[i+2]]);
		}
		var s2 = [];
		for(var i=0; i < s.length; i++) {
			var bDuplicate = false;
			for(var j=0; j< s2.length; j++) {
				if((s[i][0] == s2[j][0] & s[i][1] == s2[j][1]) | (s[i][1] == s2[j][0] & s[i][0] == s2[j][1])) {
					bDuplicate = true;
					break;
				}
			}
			if(!bDuplicate) {
				s2.push(s[i]);
			}
		}
		return s2;
	}

	this.edgeLength = function(i,j) {
		var l = topo.getLength2D(this.vertices[this.triangles[i]],this.vertices[this.triangles[j]]);
		return l;
	}

	/**
	 * Remove triangles with edge exceeding edgeMaxLength
	 */
	this.reduceTriangles = function() {
		if($.expCfg.edgeMaxLength < 0) {
			$.expCfg.edgeMaxLength = topo.getLength2D(
				[this.boundaries[0].min,this.boundaries[1].min],
				[this.boundaries[0].max,this.boundaries[1].max])/10;
		}
		var newTriangles = [];
		for(var i=0; i<this.triangles.length; i=i+3) {
			var bKeep = true;
			if(this.edgeLength(i, i+1) > $.expCfg.edgeMaxLength) bKeep = false;
			if(this.edgeLength(i+1, i+2) > $.expCfg.edgeMaxLength) bKeep = false;
			if(this.edgeLength(i+2, i) > $.expCfg.edgeMaxLength) bKeep = false;

			if(bKeep) {
				for(var j= 0; j<3; j++) {
					newTriangles.push(this.triangles[i+j])
				}
			}
		}
		this.triangles = newTriangles;
	}

	this.start = function() {
		$( "canvas" ).show();
		var allTextLines = $.txtContent.s.split(/\r\n|\n/);
		for(i=0; i< allTextLines.length; i++) {
			if(allTextLines[i].substr(0,1)!="%" && allTextLines[i].trim()!="") {
				var xyz = allTextLines[i].split(/\t|;|,/);
				for(j=0; j<3; j++) {
					xyz[j] = parseFloat(xyz[j]);
					this.boundaries[j].min = Math.min(this.boundaries[j].min,xyz[j]);
					this.boundaries[j].max = Math.max(this.boundaries[j].max,xyz[j]);
				}
				this.vertices.push(xyz);
			}
		}
		// Add margin around boundaries
		for(j=0; j<3; j++) {
			var scope = this.boundaries[j].max-this.boundaries[j].min;
			this.boundaries[j].min -= scope/20;
			this.boundaries[j].max += scope/20;
		}
		// Triangulation
		this.triangulate();

		console.time("render");
		this.render();
		console.timeEnd("render");

		alert("Draw the canal's route by clicking on the screen");

		$( "#toolbar" ).show();
		route.start();

	}

	/**
	 * Triangulation of xyz point and removal of high length edges
	 */
	this.triangulate = function() {
		console.time("triangulate");
		this.triangles = Delaunay.triangulate(this.vertices);
		this.reduceTriangles();
		console.timeEnd("triangulate");
	}

	this.render = function() {
		document.getElementById("container").style = "display:none;";
		var canvas = document.getElementById("canvas"),
			ctx = canvas.getContext("2d");
			ctx.canvas.width  = window.innerWidth;
			ctx.canvas.height = window.innerHeight;
			ctx.clearRect(0, 0, Number(canvas.width), Number(canvas.height));
			ctx.lineWidth = 0.3;
			ctx.strokeStyle = "#aaaaaa";

        this.calcC2Cparameters(canvas);
		var v2 = Array(this.vertices.length);
		for(var i = 0; i < this.vertices.length; i++) {
			v2[i] = this.coords2Canvas(canvas, this.vertices[i]);
		}

		for(var i = this.triangles.length; i; ) {
			var xy;
			ctx.beginPath();
			--i; ctx.moveTo(v2[this.triangles[i]][0], v2[this.triangles[i]][1]);
			--i; ctx.lineTo(v2[this.triangles[i]][0], v2[this.triangles[i]][1]);
			--i; ctx.lineTo(v2[this.triangles[i]][0], v2[this.triangles[i]][1]);
			ctx.closePath();
			ctx.stroke();
		}

		for(var i=0; i<this.vertices.length; i++) {
			// Draw point
			ctx.beginPath();
			ctx.arc(v2[i][0], v2[i][1], 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fillStyle = "#000000";
			ctx.fill();
		}
	}
}

function Route() {
	/**
	 * List of points part of the route with properties:
	 * - xy: coordinates of the point (geographic reference)
	 * - pK: chainage of the point
	 */
	this.nodes = [];

	/**
	 * Sections list with properties:
	 * - pK : Chainage of the section
	 * - Lxy : Coordinates of the left bank
	 * - Rxy : Coordinates of the right bank
	 */
	this.sections = [];
	/// Total length of the route
	this.routeLength = 0;
	/// Add node mode
	this.bAddNodeMode = true;

	/**
	 * Start drawing route
	 */
	this.start = function() {
		this.nodes = [];
		$( "canvas" ).click(function(e) {
			e = e ? e : window.event;
			var rect = this.getBoundingClientRect();
			route.addAt([e.clientX - rect.left, e.clientY - rect.top]);
		});
	}


	this.addAt = function(xy) {
		var canvas = document.getElementById('canvas');
		var xy2 = Array(2);
		var axeLength = [canvas.scrollWidth , canvas.scrollHeight];
		xy[1] = axeLength[1] - xy[1]; // bottom and top are inverted in the canvas
		for(var i=0; i<2; i++) {
			xy2[i] = (xy[i]-canal.c2cCenterGap[i]) / axeLength[i] * (canal.c2cRatio) + canal.boundaries[i].min;
		}
		var pK = 0;
		if(this.nodes.length > 0) {
			pK = this.nodes[this.nodes.length-1].pK;
			pK += topo.getLength2D(this.nodes[this.nodes.length-1].xy,xy2);
		}

		this.nodes.push({'xy':xy2,'pK':pK});
		this.render();
	};

	this.render = function() {
		console.time('render');
		var canvas = document.getElementById('canvas');
		if (!canvas.getContext)
		return;

		var ctx = canvas.getContext('2d');

		canal.render();

		// Draw route
		var vertex_last = [];
		for(var i=0; i<this.nodes.length; i++) {
			var vertex = canal.coords2Canvas(canvas,this.nodes[i].xy);

			// Draw edge
			if(i > 0) {
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(vertex_last[0], vertex_last[1]);
				ctx.lineTo(vertex[0], vertex[1]);
				ctx.closePath();
				ctx.strokeStyle = "#0000ff";
				ctx.stroke();
			}

			// Draw point
			ctx.beginPath();
			ctx.arc(vertex[0], vertex[1], 3, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fillStyle = "#ff0000";
			ctx.fill();

			ctx.font = "12px Sans";
			ctx.fillStyle = "black";
			ctx.fillText("pK="+this.nodes[i].pK.toFixed(3),vertex[0]+5, vertex[1]);

			vertex_last[0] = vertex[0];
			vertex_last[1] = vertex[1];
		}

		// Draw sections
		for(var i=0; i<this.sections.length; i++) {
			var sn = this.sections[i];
			var xy;
			ctx.lineWidth = 1;
			ctx.beginPath();
			xy = canal.coords2Canvas(canvas,sn.Lxy)
			ctx.moveTo(xy[0], xy[1]);
			xy = canal.coords2Canvas(canvas,sn.Rxy)
			ctx.lineTo(xy[0], xy[1]);
			ctx.closePath();
			ctx.strokeStyle = "#ff0000";
			ctx.stroke();
		}
		console.timeEnd('render');
	}


	this.setSections = function() {
		this.routeLength = this.nodes[this.nodes.length-1].pK;
		if($.expCfg.sectionSpaceStep < 0) {
			if(this.routeLength < 1000) {
				$.expCfg.sectionSpaceStep = this.routeLength / 20;
			} else {
				$.expCfg.sectionSpaceStep = 100;
			}
		}
		if($.expCfg.sectionWidth < 0) {
			$.expCfg.sectionWidth = $.expCfg.sectionSpaceStep * 5;
		}
	}

	this.computeSections = function() {
		var pK = 0;
		var iSegment = 0;
		while(pK <= this.routeLength) {
			// Compute coords of section's center
			var theta = topo.getTheta(this.nodes[iSegment].xy,this.nodes[iSegment+1].xy);
			var xy = topo.getXYfromPK(this.nodes[iSegment].xy,theta,pK-this.nodes[iSegment].pK);
			// Compute section's edges coords
			this.sections.push({"pK":pK,
				"Lxy": topo.getXYfromPK(xy,theta+Math.PI/2,$.expCfg.sectionWidth/2),
				"Rxy": topo.getXYfromPK(xy,theta-Math.PI/2,$.expCfg.sectionWidth/2)
			});
			// Set chainage of the next section
			if(pK==this.routeLength) break;
			pK += $.expCfg.sectionSpaceStep;
			pK = Math.min(pK,this.routeLength);
			while(iSegment < this.nodes.length -1 & pK > this.nodes[iSegment+1].pK) {
				iSegment++;
			}
		}
	}


	/*
	 * Interpolation of altitude for a 2D point located between two 3D points
	 * @param s Array of two points containing 3D vertex
	 * @param pInt 2D vertex of the point located on the same line
	 */
	this.getProfilePointZ = function(s,pInt) {
		var dTot = topo.getLength2D(canal.vertices[s[0]],canal.vertices[s[1]]);
		var dPart = topo.getLength2D(canal.vertices[s[0]],pInt);
		return canal.vertices[s[0]][2]+(canal.vertices[s[1]][2]-canal.vertices[s[0]][2])*dPart/dTot;
	}

	this.renderSegments = function (s) {
		this.render();
		var canvas = document.getElementById('canvas');
		if (!canvas.getContext)
		return;
		var ctx = canvas.getContext('2d');
		var xy;
		for(var i=0; i<s.length; i++) {
			ctx.lineWidth = 2;
			ctx.beginPath();
			xy = canal.coords2Canvas(canvas,vertices[s[i][0]])
			ctx.moveTo(xy[0], xy[1]);
			xy = canal.coords2Canvas(canvas,vertices[s[i][1]])
			ctx.lineTo(xy[0], xy[1]);
			ctx.closePath();
			ctx.strokeStyle = "#00ff00";
			ctx.stroke();
		}
	}

	this.computeProfils = function() {
		var segments = canal.triangles2Segments();
		for(var i=0; i< this.sections.length; i++) {
			var section = this.sections[i];
			// Line equation of the section
			section.ab = topo.getLineEquation(section.Lxy,section.Rxy);
			// Selecting segments intersecting the section
			var s = []; // the selected segments
			for(var j=0; j<segments.length; j++) {
				var s_ab = topo.getLineEquation(canal.vertices[segments[j][0]],canal.vertices[segments[j][1]]);
				if(topo.doesLineIntersect(section.ab,canal.vertices[segments[j][0]],canal.vertices[segments[j][1]]) &
					topo.doesLineIntersect(s_ab,section.Lxy,section.Rxy)) {
					// Intersection of 4 points checked
					s.push(segments[j]);
					//this.renderSegments(s);
				}
			}

			// Compute profile
			this.sections[i].profil = []; // Array for storing abscissa-elevation profile
			var x1 = section.Lxy[0];
			var y1 = section.Lxy[1];
			var x2 = section.Rxy[0];
			var y2 = section.Rxy[1];
			var px = Array(s.length);
			var pz = Array(s.length);
			for(var j=0; j<s.length; j++) {
				// Intersection coordinates
				// Source https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
				var x3 = canal.vertices[s[j][0]][0];
				var y3 = canal.vertices[s[j][0]][1];
				var x4 = canal.vertices[s[j][1]][0];
				var y4 = canal.vertices[s[j][1]][1];
				var pInt = [((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4)),
							((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4))];
				// Projection in section plan
				px[j] = topo.getLength2D(section.Lxy,pInt); // For x : starting from left bank at x=0
				pz[j] = this.getProfilePointZ(s[j],pInt);
			}
			// Sorting profil by abscissa
			var iProfs = getIndexesOfSortedArray(px);
			this.sections[i].profil = Array(iProfs.length);
			for(var j=0; j<s.length; j++) {
				this.sections[i].profil[j] = [px[iProfs[j]],pz[iProfs[j]]];
			}
		}
	}
}


// http://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
function getIndexesOfSortedArray(toSort) {
	var tS2 = Array(toSort.length);
	for (var i = 0; i < toSort.length; i++) {
		tS2[i] = [toSort[i], i];
	}
	tS2.sort(function(left, right) {
		return left[0] < right[0] ? -1 : 1;
	});
	var sortIndexes = [];
	for (var j = 0; j < toSort.length; j++) {
		sortIndexes.push(tS2[j][1]);
	}
	return sortIndexes;
}

function sic_ascii(scts) {
	var s = "";
	for(var i=0; i<scts.length; i++) {
		s += "x="+scts[i].pK+"$"+scts[i].pK+"\n";
		for(j=0; j<scts[i].profil.length; j++) {
			s += scts[i].profil[j][0] + "\t" + scts[i].profil[j][1] + "\n";
		}
	}
	dialog_export.dialog( "open" );
	$( "#myText" ).val(s);
	$( "#myText" ).select();
}

/**
 * Conversion of xyz point to pK and abscissa-elevation coords considering canal route
 * @author David Dorchies
 * @date 21/05/2016
 */
var xyz2pK = {
	/**
	 * Conversion
	 */
	convert : function() {
		var pKAE = []; /// List of points in pK / Abscissa-Elevation coords
		// Loop on xyz points
		for(var i=0; i<canal.vertices.length; i++) {
			// For each point, calculation of distance for each segment of route
			var abscMin = +Infinity;
			for(var j=1; j<route.nodes.length; j++) {
				// Calculation of line equation between point and closest point on the segment
				var ab = topo.getLineEquation(route.nodes[j-1].xy,route.nodes[j].xy);
				var xy0 = topo.getClosestP2L(ab,canal.vertices[i]);
				var ab0 = topo.getLineEquation(canal.vertices[i],xy0);
				if(topo.doesLineIntersect(ab0,route.nodes[j-1].xy,route.nodes[j].xy)) {
					// The point is orthogonal to the current segment
					// pK calculation
					var pK = route.nodes[j-1].pK + topo.getLength2D(route.nodes[j-1].xy,xy0);
					// Distance between the current segment and the point
					var absc = topo.getLength2D(xy0,canal.vertices[i])
					// Test with previous intersections found and store result
					if(absc<abscMin) {
						abscMin = absc;
						// Is it on the left or on the right considering flow direction ?
						// Using determinant of the 2 vectors from starting node of the current segment, the orthogonal point on the segment and the point
						var ah = [];
						var hb = [];
						for(var k=0; k<2; k++) {
							ah.push(xy0[k]-route.nodes[j-1].xy[k]);
							hb.push(canal.vertices[i][k]-xy0[k]);
						}
						var det = ah[0]*hb[1]-hb[0]*ah[1];
						if(det > 0) {absc = -absc;} // The point in on the left
					}
				}
			}
			pKAE.push([pK,absc]);
		}
		xyz2pK.export(pKAE);
	},
	export : function(pKAE){
		var s = "";
		for(var i=0; i<pKAE.length; i++) {
			s += canal.vertices[i][0]+"\t"+canal.vertices[i][1]+"\t"+canal.vertices[i][2]+"\t"+pKAE[i][0]+"\t"+pKAE[i][1]+"\n";
		}
		dialog_export.dialog( "open" );
		$( "#myText" ).val(s);
		$( "#myText" ).select();
	}
};
