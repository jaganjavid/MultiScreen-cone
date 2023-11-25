import WindowManager from './WindowManager.js'



const t = THREE;
let camera, scene, renderer, world;
let near, far;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let cones = [];
let sceneOffsetTarget = {x: 0, y: 0};
let sceneOffset = {x: 0, y: 0};

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

// get time in seconds since beginning of the day (so that all windows use the same time)
function getTime ()
{
	return (new Date().getTime() - today) / 1000.0;
}


if (new URLSearchParams(window.location.search).get("clear"))
{
	localStorage.clear();
}
else
{	
	// this code is essential to circumvent that some browsers preload the content of some pages before you actually hit the url
	document.addEventListener("visibilitychange", () => 
	{
		if (document.visibilityState != 'hidden' && !initialized)
		{
			init();
		}
	});

	window.onload = () => {
		if (document.visibilityState != 'hidden')
		{
			init();
		}
	};

	function init ()
	{
		initialized = true;

		// add a short timeout because window.offsetX reports wrong values before a short period 
		setTimeout(() => {
			setupScene();
			setupWindowManager();
			resize();
			updateWindowShape(false);
			render();
			window.addEventListener('resize', resize);
		}, 500)	
	}

	function setupScene ()
	{
		camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
		
		camera.position.z = 2.5;
		near = camera.position.z - .5;
		far = camera.position.z + 0.5;

		scene = new t.Scene();
		scene.background = new t.Color(0.0);
		scene.add( camera );

		renderer = new t.WebGLRenderer({antialias: true, depthBuffer: true});
		renderer.setPixelRatio(pixR);
	    
	  	world = new t.Object3D();
		scene.add(world);

		renderer.domElement.setAttribute("id", "scene");
		document.body.appendChild( renderer.domElement );
	}

	function setupWindowManager ()
	{
		windowManager = new WindowManager();
		windowManager.setWinShapeChangeCallback(updateWindowShape);
		windowManager.setWinChangeCallback(windowsUpdated);

		// here you can add your custom metadata to each windows instance
		let metaData = {foo: "bar"};

		// this will init the windowmanager and add this window to the centralised pool of windows
		windowManager.init(metaData);

		// call update windows initially (it will later be called by the win change callback)
		windowsUpdated();
	}

	function windowsUpdated ()
	{
		updateNumberOfCones();
	}

	// function updateNumberOfcones ()
	// {
	// 	let wins = windowManager.getWindows();

	// 	// remove all cones
	// 	cones.forEach((c) => {
	// 		world.remove(c);
	// 	})

	// 	cones = [];

	// 	// add new cones based on the current window setup
	// 	for (let i = 0; i < wins.length; i++)
	// 	{
	// 		let win = wins[i];

	// 		let c = new t.Color();
	// 		c.setHSL(i * .1, 1.0, .5);

	// 		let s = 100 + i * 50;
	// 		let cube = new t.Mesh(new t.BoxGeometry(s, s, s), new t.MeshBasicMaterial({color: c , wireframe: true}));
	// 		cube.position.x = win.shape.x + (win.shape.w * .5);
	// 		cube.position.y = win.shape.y + (win.shape.h * .5);

	// 		world.add(cube);
	// 		cones.push(cube);
	// 	}
	// }

	// function updateNumberOfCones() {
	// 	let wins = windowManager.getWindows();
	
	// 	cones.forEach((cone) => {
	// 		world.remove(cone);
	// 	});
	
	// 	cones = [];
	
	// 	for (let i = 0; i < wins.length; i++) {
	// 		let win = wins[i];
	
	// 		let c = new t.Color();
	// 		c.setHSL(i * 0.1, 1.0, 0.5);
	
	// 		let radius = 25 + i * 10; // Adjust the radius based on the window index
	// 		let height = radius * 2;
	// 		let coneGeometry = new t.ConeGeometry(radius, height, 32);
	// 		let coneMaterial = new t.MeshBasicMaterial({ color: c, wireframe: true });
	// 		let cone = new t.Mesh(coneGeometry, coneMaterial);
	
	// 		cone.position.x = win.shape.x + win.shape.w * 0.5;
	// 		cone.position.y = win.shape.y + win.shape.h * 0.5;
	// 		cone.position.z = height * 0.5; // Adjust the z-position to center the cone vertically
	
	// 		world.add(cone);
	// 		cones.push(cone);
	// 	}
	// }

	function updateNumberOfCones() {
		let wins = windowManager.getWindows();
	
		cones.forEach((cone) => {
			world.remove(cone);
		});
	
		cones = [];
	
		for (let i = 0; i < wins.length; i++) {
			let win = wins[i];
	
			let c = new t.Color();
			c.setHSL(i * 0.1, 1.0, 0.5);
	
			let radius = 25 + i * 10;
			let height = radius * 2;
			let coneGeometry = new t.ConeGeometry(radius, height, 32);
			let coneMaterial = new t.MeshBasicMaterial({ color: c, wireframe: true });
			let cone = new t.Mesh(coneGeometry, coneMaterial);
	
			cone.position.x = win.shape.x + win.shape.w * 0.5;
			cone.position.y = win.shape.y + win.shape.h * 0.5;
			cone.position.z = height * 0.5;
	
			// Add event listeners for mouseover and mouseout
			cone.userData = { originalText: "Jagan is super", hoverText: "Javid is super good" };
			cone.onmouseover = function () {
				cone.material.color.setHex(0xff0000); // Change color on hover
				cone.material.wireframe = false; // Disable wireframe on hover
				cone.material.transparent = true;
				cone.material.opacity = 0.8;
				document.getElementById("info").innerText = cone.userData.hoverText;
			};
			cone.onmouseout = function () {
				cone.material.color.set(c);
				cone.material.wireframe = true;
				cone.material.transparent = false;
				document.getElementById("info").innerText = cone.userData.originalText;
			};
	
			world.add(cone);
			cones.push(cone);
		}
	}
	
	

	function updateWindowShape (easing = true)
	{
		// storing the actual offset in a proxy that we update against in the render function
		sceneOffsetTarget = {x: -window.screenX, y: -window.screenY};
		if (!easing) sceneOffset = sceneOffsetTarget;
	}


	function render ()
	{
		let t = getTime();

		windowManager.update();


		// calculate the new position based on the delta between current offset and new offset times a falloff value (to create the nice smoothing effect)
		let falloff = .05;
		sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
		sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);

		// set the world position to the offset
		world.position.x = sceneOffset.x;
		world.position.y = sceneOffset.y;

		let wins = windowManager.getWindows();


		// loop through all our cones and update their positions based on current window positions
		for (let i = 0; i < cones.length; i++)
		{
			let cube = cones[i];
			let win = wins[i];
			let _t = t;// + i * .2;

			let posTarget = {x: win.shape.x + (win.shape.w * .5), y: win.shape.y + (win.shape.h * .5)}

			cube.position.x = cube.position.x + (posTarget.x - cube.position.x) * falloff;
			cube.position.y = cube.position.y + (posTarget.y - cube.position.y) * falloff;
			cube.rotation.x = _t * .5;
			cube.rotation.y = _t * .3;
		};

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}


	// resize the renderer to fit the window size
	function resize ()
	{
		let width = window.innerWidth;
		let height = window.innerHeight
		
		camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	}
}