/**
 * Library of topology calculation functions
 * @author David Dorchies
 * @date 21/05/2016
 */
var topo = {
	/**
	 * Distance between two 2D points
	 */
	getLength2D : function(p1,p2) {
		return Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
	},

	/**
	 * Give the angle of a 2D segment from 2 points from the first axis
	 */
	getTheta : function(p1,p2) {
		return Math.atan2(p2[1]-p1[1],p2[0]-p1[0]);
	},

	/**
	 * Compute 2D coordinates from a starting point, an angle and a distance
	 * @param xy 2D starting point
	 * @param theta angle from x abscissa
	 * @param pK distance
	 */
	getXYfromPK : function(xy,theta,pK) {
		return [xy[0]+pK*Math.cos(theta),xy[1]+pK*Math.sin(theta)];
	},

	/**
	 * Compute line equation from 2 points
	 */
	getLineEquation : function(p1,p2) {
		var ab = Array(2);
		ab[0] = (p1[1]-p2[1])/(p1[0]-p2[0]);
		if(p1[0]!=0) {
			ab[1] = p1[1] - (ab[0]*p1[0]);
		} else if(sections[i].Rxy[0]!=0) {
			ab[1] = p2[1] - (ab[0]*p2[0]);
		} else {
			alert("Impossible to compute section profil");
		}
		return ab;
	},

	/**
	 * Is there an intersection : between the line and the segment formed from the 2 points ?
	 */
	doesLineIntersect : function(ab, p1, p2) {
		var test =  [ab[0]*p1[0] - p1[1] + ab[1], ab[0]*p2[0] - p2[1] + ab[1]];
		test[0] = test[0] > 0 ? 1 : 0;
		test[1] = test[1] > 0 ? 1 : 0;
		if(test[0]!=test[1]) {
			return true;
		} else {
			return false;
		}
	},


	/**
	 * Closest point on a line from a point
	 * @param ab Line equation (y=ax+b)
	 * @param p Point coordinates
	 * @return Coordinate of closest point on the line
	 * @see https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
	 */
	getClosestP2L : function (ab, p) {
		var a = ab[0];
		var b = -1;
		var c = ab[1];
		var x = p[0];
		var y = p[1];
		return [
			(b*(b*x - a*y) - a*c) / (a*a + b*b),
			(a*(-b*x + a*y) - b*c) / (a*a + b*b)
		];
	}
}
