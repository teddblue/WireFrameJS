This can render wireframe polygons from a .obj file using html.\
To load an obj file:\
1) open your obj file in a text editor (you may have to add ".txt" to the end of the file name\
2) copy all the text from the file and paste it into the text box below the 3d view\
3) click the "import" button\
Note: the first imported object will barrel-roll away to show off model distinction, model movement, and model rotation\
\
WireFrame JS is a project I originally made from scratch in Pencilcode (with help from documentation and forums). It can be found here: http://share.pencilcode.net/home/xzyat-teddblue-Wireframe. I rewrote the code from the ground up in javascript canvas so it can run faster.\
\
In this version, multiple models can be displayed at a time. The second visible model will barrel-roll away slowly to show off model movement and rotation.
The differences between this and the older version are: rendering in HTML canvas over pencilcode (obviously), drawing lines between groups of points (real polygons) instead of just 2, adding the 'Mesh' class to group points, and the addition and improvement of things like point movement and rotation.\
\
Both versions have an import feature. To use it you must find a ".obj" file, and add ".txt" to the end of the filename. Open that text file and copy all its contents into the text box below the display. Click the import button to make it appear!\
\
I'm not exactly done with this project. My next step will be filling polygons. This version of the project will remain as is though, since it's "WireFrameJS" and not "FullPolygon3DEngineJS". The additions to this project will be made in a fork.
