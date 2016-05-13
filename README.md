# sic_tools
Javascript tools for SIC² an integrated modeling software for canals and their control (http://sic.g-eau.net)

The tools available are:
* import_xyz.html: Convert XYZ points in sections of profiles along a route defined by the user
* geometrie.html: 3D visualisation of a canal geomtry exported by SIC²

# Installation

Just unzip the repository to your harddisk and launch the html file in your favorite browser (the tools have been tested only with Mozilla Firefox).

#import_xyz.html : user manual

This tool allow to create sections profil from XYZ points and a route. XYZ points are triangulated by the Delaunay method (thanks to https://github.com/ironwallaby/delaunay). The user draw the route on the screen, 
sections are created with a constant space step and profils are extracted.

## File format specifications

The imported file should be in ASCII format with 3 columns (X,Y,Z) and no header. Column separator may be tabs, commas or semicolons.

The ASCII file produce by the tool corresponds to the format used by SIC² for importing geometry in one reach (See: http://sic.g-eau.net/import-sections-and-cross-profiles?lang=en).

## Quick start
* Launch import_xyz.html in a browser
* Choose the file to import
* Draw the route of the canal from upstream to downstream on the map, by clicking for each direction change (Notice that the nodes created here avec not the same definition of the nodes used in SIC² which are used for delimitating the reaches)
* Stop the draw with a double-click
* Copy and paste the text at the bottom of the window into SIC² 

## Configuration of the tool

The user interface for configuring the tool is still in developpment and is not available for the moment.

However, some parameters can be tuned by modifying the source code: 
* Space step between sections: Modify value of `this.spaceX` in line 390 or 392 depending of the length of the route.
* Section Width (The width on which the tools search intersection between a section and triangle edges): Modify value of `this.spaceX`  in line 394.
* Edge maximum length (For removing triangle with edge exceeding a maximum value): Modify value of `this.edgeMaxLength` in line 143
