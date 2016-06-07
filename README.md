# sic_tools
Javascript tools for SIC² an integrated modeling software for canals and their control (http://sic.g-eau.net)

The tools available are:
* import_xyz.html: Convert XYZ points in sections of profiles along a route defined by the user
* geometrie.html: 3D visualisation of a canal geomtry exported by SIC²

# Installation

Just unzip the repository to your harddisk and launch the html file in your favorite browser (the tools have been tested only with Mozilla Firefox).

#import_xyz.html : user manual

This tool can achieve two goals. It uses XYZ point series and a route manually drawn by the user on the screen:
* creating section profiles from a triangulation of the XYZ points. The triangulation is done by the Delaunay method (thanks to https://github.com/ironwallaby/delaunay). Sections are created with a constant space step and a section width which can be configured.
* converting each XYZ coords into two values which are: the longitudinal abscissa along the route (the so-called "chainage" in irrigation canal conceptor's language) and the lateral abscissa on the section profile which contains the considered point.

## File format specifications

The imported file should be in ASCII format with 3 columns (X,Y,Z) and no header. Column separator may be tabs, commas or semicolons.

### Export for SIC² tool

The ASCII file produced by the tool corresponds to the format used by SIC² for importing geometry in one reach (See: http://sic.g-eau.net/import-sections-and-cross-profiles?lang=en).

### Convert to pK coords tool

The ASCII file can be imported into LibreOffice or Excel by copy and paste. It gives to the user the original XYZ coords of each point completed with longitudinal abscissa and lateral abscissa (negative value for left side and positive value for right side compared to the position of the route).


## Quick start
* Launch import_xyz.html in a browser
* Choose the file to import
* Draw the route of the canal from upstream to downstream on the map, by clicking for each direction change (Notice that the nodes created here avec not the same definition of the nodes used in SIC² which are used for delimitating the reaches)
* Click on the button of the tool to use: "Export to SIC²" for the triagulation; "Convert to pK coords" for the coords conversion
* Copy and paste the text generated in the dialog window to SIC² or you favorite spreadsheet 

