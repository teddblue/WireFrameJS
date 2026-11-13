var winWidth = 480;
var winHeight = 360;
const div = document.getElementById("NicksGame");
const canvas = document.createElement("canvas");
canvas.width = winWidth;
canvas.height = winHeight;
canvas.style = "image-rendering: pixelated; image-rendering: crisp-edges"
const pen = canvas.getContext("2d");
pen.fillRect(0, 0, 480, 360);
div.appendChild(canvas);
const menu = document.createElement("div");
menu.innerHTML += '<input type="text", id="modelImport", name="modelImport">';
menu.innerHTML += '<input type="button", id="importButton", value="import", onClick="importModel()"/>'
menu.innerHTML += '<button id="clear", onclick="clearSpace()">clear</button>'
menu.innerHTML += '<button id="fulscreen", onclick="fullscreen()">⛶</button>'
menu.innerHTML += '<p id="message">hello</p>'
//for collapse use "⮌"
div.appendChild(menu);
function fullscreen() {
	if (canvas.webkitRequestFullScreen) {
		canvas.webkitRequestFullScreen();
	} else {
		canvas.mozRequestFullScreen();
	}
}

// Geometry Data
const pi = Math.PI

var VertList = [
	[0, -1, 1],
	[1, 1, 0],
	[-1, 1, 0],
	[-1, 1, 2],
	[1, 1, 2]
]
var PolyList = [
	[0, 1, 2],
	[0, 2, 3],
	[0, 3, 4],
	[0, 4, 1]
]

// Geometry functions
function Transform(A, v) {
	//console.log(A)
	return(
		[
			(A[0]*v[0] + A[1]*v[1] + A[2]*v[2]),
			(A[3]*v[0] + A[4]*v[1] + A[5]*v[2]),
			(A[6]*v[0] + A[7]*v[1] + A[8]*v[2])
		]
	)
}
function VectorAdd(a, b) {
	return(
		[
			(a[0] + b[0]),
			(a[1] + b[1]),
			(a[2] + b[2])
		]
	)
}
function VectorSub(a, b) {
	return(
		[
			(a[0] - b[0]),
			(a[1] - b[1]),
			(a[2] - b[2])
		]
	)
}
function VectorRot(a, b) {
	var sx = Math.sin(b[0])
	var cx = Math.cos(b[0])
	var sy = Math.sin(b[1])
	var cy = Math.cos(b[1])
	var sz = Math.sin(b[2])
	var cz = Math.cos(b[2])
	var T = [
		(cx*cy), (cx*sy*sz - sx*cz), (cx*sy*cz + sx*sz),
		(sx*cy), (sx*sy*sz + cx*cz), (sx*sy*cz - cx*sz),
		(-1*sy), (cy*sz), (cy*cz)
	]
	return (
		Transform(
			T,
			a
		)
	)
}

// Drawing
function VectorCast(v) {
	var scale = 100/v[2];
	v = Transform([scale,0,0,0,scale,0,0,0,0],v);
	v = VectorAdd(v,[240,180,0]);
	return v;
}
function VectorDraw(v) {
	v = VectorCast(v)

	var size = 3;
	pen.fillStyle = "green";
	//console.log(v)
	pen.fillRect(
		Math.floor(v[0]) - Math.floor(size/2),
		Math.floor(v[1]) - Math.floor(size/2),
		size,
		size
	);
}




// Control
var Cam = {
	pos: [0,0,-10],
	rot: [0,0,0],
	turn: 1,
	move: 10
}
var Keys = {}
var Mouse = { x: 0, y: 0, z: 0, b1: 0, b2: 0, b3: 0 }
document.addEventListener('keydown', (event) => {
	if (Keys[event.key]) {
		Keys[event.key] += 1;
	} else {
		Keys[event.key] = 1;
	}
}, false);
document.addEventListener('keyup', (event) => {
	Keys[event.key] = 0;
}, false);
document.addEventListener('mousemove', (event) => {
	Mouse.x = event.movementX;
	Mouse.y = event.movementY;
}, false);
canvas.addEventListener("click", async () => {
	await canvas.requestPointerLock();
});
function checkControls(DTime) {
	var yRot = (Keys["ArrowLeft"] > 0) - (Keys["ArrowRight"] > 0);
	var xRot = (Keys["ArrowDown"] > 0) - (Keys["ArrowUp"] > 0);
	var zRot = (Keys["u"]>0) - (Keys["o"]>0);
	if (document.pointerLockElement == canvas) {
		yRot = Mouse.x / -20
		xRot = Mouse.y / 20
		zRot = 0
	}
	Cam.rot[1] -= yRot * Cam.turn * DTime / 1000;
	Cam.rot[0] -= xRot * Cam.turn * DTime / 1000;
	Cam.rot[2] -= zRot * Cam.turn * DTime / 1000;
	if (Cam.rot[0] > pi / 2) { Cam.rot[0] = pi / 2 };
	if (Cam.rot[0] < pi / -2) { Cam.rot[0] = pi / -2 };

	var xMove = (Keys["a"] > 0) - (Keys["d"] > 0);
	var yMove = (Keys["e"] > 0) - (Keys["q"] > 0);
	var zMove = (Keys["s"] > 0) - (Keys["w"] > 0);
	Cam.pos[0] -= xMove * Cam.move * DTime / 1000;;
	Cam.pos[1] -= yMove * Cam.move * DTime / 1000;;
	Cam.pos[2] -= zMove * Cam.move * DTime / 1000;;

	Mouse.x = 0
	Mouse.y = 0
}

// I/O
function importModel() {
	const text = document.getElementById("modelImport").value;
	//console.log(text)
	if (!text) {
		console.log("file not found");
		return (null);
	}
	const data = text.split(" ");
	const startVert = VertList.length;
	const startPoly = PolyList.length;
	var dataChunk = [];
	var mode = "";
	var newMesh = new Mesh
	for (let i = 0; i < data.length; i++) {
		if (data[i] != "#" && data[i] !== "") {
			if (data[i] == "v" || data[i] == "vn" || data[i] == "f" || i - 1 == data.length) {
				if (mode == "v") {
					const item = [
						parseFloat(dataChunk[0]),
						parseFloat(dataChunk[1]),
						parseFloat(dataChunk[2])
					];
					VertList.push(item);
					newMesh.Verts.push(VertList.length - 1);
				} else if (mode == "f") {
					var pointA = parseInt(dataChunk[0].split("/")[0]) - 1 + startVert;
					var pointB = parseInt(dataChunk[1].split("/")[0]) - 1 + startVert;
					var pointC = parseInt(dataChunk[2].split("/")[0]) - 1 + startVert;
					PolyList.push([pointA, pointB, pointC]);
				}
				dataChunk = [];
				mode = data[i];
			} else {
				dataChunk.push(data[i]);
			}
		}
	}
	newMesh.DPos[2] = .01;
	newMesh.DRot[2] = (2 * pi) / 120;
	console.log(newMesh);
	MeshList.push(newMesh);
}
function showMessage(s) {
	document.getElementById("message").innerHTML = s;
}
function runCommand() {
	
}

// Gameloop
function drawVerts(verts){
	for(let i=0; i<VertList.length; i++){
		const v = VectorRot(VectorSub(VertList[i], Cam.pos), Cam.rot);
		VectorDraw(v);
	}
}
function drawScene(cam, verts, polys){
	pen.fillStyle = "black"
	pen.fillRect(0, 0, winWidth, winHeight)
	drawVerts(verts);
	//drawPolys();
}
function MainLoop(timestamp) {
	var DTime = timestamp - lastRender;
	checkControls(DTime);
	drawScene([10,0,-10,0,10,-250,0,0,10], VertList, PolyList);
	lastRender = timestamp;
	showMessage("pos: "+Cam.pos+"\nrot: "+Cam.rot);
	window.requestAnimationFrame(MainLoop);
	//if (MeshList[1]) {
		//movMesh(MeshList[1], MeshList[1].DPos);
		//rotMesh(MeshList[1], MeshList[1].DRot);
	//}
};
var lastRender = 0;
window.requestAnimationFrame(MainLoop);