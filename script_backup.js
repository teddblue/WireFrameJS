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

class Vert {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	neg() {
		return (new Vert(0 - this.x, 0 - this.y, 0 - this.z));
	}
	add(other) {
		return (new Vert(this.x + other.x, this.y + other.y, this.z + other.z))
	}
	sub(other) {
		return (new Vert(this.x - other.x, this.y - other.y, this.z - other.z))
	}
	transform(A){
		return (new Vert(
			(this.x*A[0] + this.y*A[1] + this.z*A[2]),
			(this.x*A[3] + this.y*A[4] + this.z*A[5]),
			(this.x*A[6] + this.y*A[7] + this.z*A[8])
		));
	}
}



var VertList = [
	new Vert(0, -1, 1),
	new Vert(1, 1, 0),
	new Vert(-1, 1, 0),
	new Vert(-1, 1, 2),
	new Vert(1, 1, 2)
]
var PolyList = [
	[0, 1, 2],
	[0, 2, 3],
	[0, 3, 4],
	[0, 4, 1]
]
class Mesh {
	constructor(Verts = [], DPos = new Vert(0, 0, 0), DRot = new Vert(0, 0, 0)) {
		this.Verts = Verts;
		this.DPos = DPos;
		this.DRot = DRot;
		this.Pos = new Vert(0, 0, 0);
		this.Rot = new Vert(0, 0, 0);
	}
}
var MeshList = [
	[0, 1, 2, 3, 4]
]
var Cam = {
	pos: new Vert(0, 0, -5),
	rot: new Vert(0, 0, 0),
	scale: 100,
	fov: 100,
	move: 0.5,
	turn: 10
}

// Drawing
function VertToPos(v) {
	v = rotateVert(v, Cam.rot, Cam.pos)
	var p = false;
	var d = 0 - ((winWidth / Cam.scale) / 2) / Math.tan(Cam.fov);
	var sX = v.x - Cam.pos.x;
	var sY = v.y - Cam.pos.y;
	var sZ = v.z - Cam.pos.z;
	if (sZ > d) {
		sX = sX * (d / sZ);
		sY = sY * (d / sZ);
		p = [Math.floor((sX * Cam.scale) + winWidth / 2), (sY * Cam.scale) + winHeight / 2];
	}
	return p;
}
function drawVerts() {
	for (let i = 0; i < VertList.length; i++) {
		var p = VertToPos(VertList[i]);
		if (p) {
			var size = 4;
			pen.fillStyle = "green";
			pen.fillRect(p[0] - Math.floor(size / 2), p[1] - Math.floor(size / 2), size, size);
		}
	}
}
function drawPolys() {
	for (let i = 0; i < PolyList.length; i++) {
		pen.strokeStyle = "lime";
		pen.fillStyle = "blue";
		var v = VertToPos(VertList[PolyList[i][0]]);
		pen.beginPath();
		pen.moveTo(v[0], v[1]);
		for (let j = 1; j < PolyList[i].length; j++) {
			v = VertToPos(VertList[PolyList[i][j]]);
			pen.lineTo(v[0], v[1]);
		}
		var v = VertToPos(VertList[PolyList[i][0]]);
		pen.lineTo(v[0], v[1]);
		//pen.fill();
		pen.stroke();
	}
}

// Geometry functions
function rotateVert(ver, rot, org = new Vert(0, 0, 0)) {
	var x1, y1, z1, x2, y2, z2
	// Z rotation xy
	x1 = ((ver.x - org.x) * Math.cos(rot.z)) + ((ver.y - org.y) * Math.sin(rot.z));
	y1 = ((ver.y - org.y) * Math.cos(rot.z)) - ((ver.x - org.x) * Math.sin(rot.z));
	// Y rotation zx
	z1 = ((ver.z - org.z) * Math.cos(rot.y)) + (x1 * Math.sin(rot.y));
	x2 = (x1 * Math.cos(rot.y)) - ((ver.z - org.z) * Math.sin(rot.y));
	// X rotation yz
	y2 = (y1 * Math.cos(rot.x)) + (z1 * Math.sin(rot.x));
	z2 = (z1 * Math.cos(rot.x)) - (y1 * Math.sin(rot.x));
	// create verticie
	x2 += org.x
	y2 += org.y
	z2 += org.z
	var transform = new Vert(x2, y2, z2);
	//console.log(transform)
	return transform;
}
function clearSpace() {
	VertList = [];
	PolyList = [];
	MeshList = [];
	console.log("space cleared")
}
function movMesh(m, move) { //move mesh
	for (let i = 0; i < m.Verts.length; i++) {
		var v = VertList[m.Verts[i]];
		v.x += move.x;
		v.y += move.y;
		v.z += move.z;
		VertList[m.Verts[i]] = v;
	}
	m.Pos.x += move.x;
	m.Pos.y += move.y;
	m.Pos.z += move.z;
}
function posMesh(m, pos) { //set position of mesh
	for (let i = 0; i < m.Verts.length; i++) {
		var v = VertList[m.Verts[i]];
		v.x = (pos.x - m.Pos.x);
		v.y = (pos.y - m.Pos.y);
		v.z = (pos.z - m.Pos.z);
		VertList[m.Verts[i]] = v;
	}
	m.Pos.x = pos.x;
	m.Pos.y = pos.y;
	m.Pos.z = pos.z;
}
function rotMesh(m, rot) { //rotate mesh
	for (let i = 0; i < m.Verts.length; i++) {
		var v = VertList[m.Verts[i]];
		v = rotateVert(v, rot, m.Pos);
		VertList[m.Verts[i]] = v;
	}
	m.Rot.x += rot.x;
	m.Rot.y += rot.y;
	m.Rot.z += rot.z;
}

// Control
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
	var zRot = 0 //(Keys["u"]>0) - (Keys["o"]>0);
	if (document.pointerLockElement == canvas) {
		yRot = Mouse.x / -20
		xRot = Mouse.y / 20
		zRot = 0
	}
	Cam.rot.y -= yRot * Cam.turn * DTime / 1000;
	Cam.rot.x -= xRot * Cam.turn * DTime / 1000;
	Cam.rot.z -= zRot * Cam.turn * DTime / 1000;
	if (Cam.rot.x > pi / 2) { Cam.rot.x = pi / 2 };
	if (Cam.rot.x < pi / -2) { Cam.rot.x = pi / -2 };
	var xMove = (Keys["a"] > 0) - (Keys["d"] > 0);
	var yMove = (Keys["e"] > 0) - (Keys["q"] > 0);
	var zMove = (Keys["s"] > 0) - (Keys["w"] > 0);
	var move = rotateVert(new Vert(xMove, 0, zMove), Cam.rot.neg())
	move.y = yMove
	Cam.pos.x -= move.x * Cam.move;
	Cam.pos.y -= move.y * Cam.move;
	Cam.pos.z -= move.z * Cam.move;
	Mouse.x = 0
	Mouse.y = 0
}

/*var Keys = {}
function checkControls() {
	var yRot = (Keys["ArrowLeft"] > 0) - (Keys["ArrowRight"] > 0);
	var xRot = (Keys["ArrowDown"] > 0) - (Keys["ArrowUp"] > 0);
	var zRot = 0 //(Keys["u"]>0) - (Keys["o"]>0);
	Cam.rot.y -= yRot * Cam.turn;
	Cam.rot.x -= xRot * Cam.turn;
	Cam.rot.z -= zRot * Cam.turn;
	if (Cam.rot.x > pi / 2) { Cam.rot.x = pi / 2 };
	if (Cam.rot.x < pi / -2) { Cam.rot.x = pi / -2 };
	var xMove = (Keys["a"] > 0) - (Keys["d"] > 0);
	var yMove = (Keys["e"] > 0) - (Keys["q"] > 0);
	var zMove = (Keys["s"] > 0) - (Keys["w"] > 0);
	var move = rotateVert(new Vert(xMove, 0, zMove), Cam.rot.neg())
	move.y = yMove
	Cam.pos.x -= move.x * Cam.move;
	Cam.pos.y -= move.y * Cam.move;
	Cam.pos.z -= move.z * Cam.move;
}
document.addEventListener('keydown', (event) => {
	if (Keys[event.key]) {
		Keys[event.key] += 1
	} else {
		Keys[event.key] = 1
	}
}, false);
document.addEventListener('keyup', (event) => {
	Keys[event.key] = 0
}, false);*/

// File Import
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
					const item = new Vert(
						parseFloat(dataChunk[0]),
						parseFloat(dataChunk[1]),
						parseFloat(dataChunk[2])
					);
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
	newMesh.DPos.z = .01;
	newMesh.DRot.z = (2 * pi) / 120;
	console.log(newMesh);
	MeshList.push(newMesh);
}

// Gameloop
function MainLoop(timestamp) {
	var DTime = timestamp - lastRender;
	checkControls(DTime);
	pen.fillStyle = "black"
	pen.fillRect(0, 0, winWidth, winHeight)
	drawVerts();
	drawPolys();
	lastRender = timestamp;
	window.requestAnimationFrame(MainLoop);
	if (MeshList[1]) {
		movMesh(MeshList[1], MeshList[1].DPos);
		rotMesh(MeshList[1], MeshList[1].DRot);
	}
};
var lastRender = 0;
window.requestAnimationFrame(MainLoop);