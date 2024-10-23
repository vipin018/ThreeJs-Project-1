// Import Three.js and OrbitControls
import "./style.css";
import * as THREE from 'three';
// import { linearDepth } from 'three/webgpu';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PMREMGenerator } from 'three';
import { log } from "three/webgpu";

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

// Set up the camera
const camera = new THREE.PerspectiveCamera(
	25, // Field of view
	window.innerWidth / window.innerHeight, // Aspect ratio
	0.1, // Near clipping plane
	100 // Far clipping plane
);
camera.position.z = 9; // Move the camera away from the origin



// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Handle device pixel ratio
document.body.appendChild(renderer.domElement);



// Create a basic cube (just for visuals)


// Handle window resizing
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
});
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
	// .setPath('path/to/your/hdri/') // Path to your HDRI file
	.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonlit_golf_2k.hdr', function (texture) {
		const envMap = pmremGenerator.fromEquirectangular(texture).texture;
		scene.environment = envMap; // Apply environment map for reflections
		// scene.background = envMap; // Optionally, set the HDRI as the background
		texture.dispose(); // Free memory
		pmremGenerator.dispose();
	});


const radius = 1.3;
const segments = 64;
const colors = [0xff0000, 0x097969, 0x0ff, 0xffff00];
const textures = [
	"./csilla/color.png",
	"./earth/map.jpg",
	"./venus/map.jpg",
	"./volcanic/color.png"
];
const orbitRadius = 4.5;
const spheres = new THREE.Group();

const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load('./stars.jpg'); // Your star texture here
starTexture.colorSpace = THREE.SRGBColorSpace; //to enhance the colors

const starGeometry = new THREE.SphereGeometry(50, 64, 64); // Large sphere with radius 50
const starMaterial = new THREE.MeshBasicMaterial({
	map: starTexture,
	opacity: 0.5,
	side: THREE.BackSide // Render the inside of the sphere
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere); // Add the large starry sphere to the scene

const spheresMesh = [];

for (let i = 0; i < 4; i++) {
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load(textures[i]);
	texture.colorSpace = THREE.SRGBColorSpace; //to enhance the colors

	const geometry = new THREE.SphereGeometry(radius, segments, segments); // Radius: 1, Width/Height Segments: 32
	const material = new THREE.MeshStandardMaterial({ map: texture });
	const sphere = new THREE.Mesh(geometry, material);

	spheresMesh.push(sphere);

	// sphere.position.set(i * 2 - 3, 0, 0);
	material.map = texture;



	const angle = (i / 4) * (Math.PI * 2);
	sphere.position.x = orbitRadius * Math.cos(angle);
	sphere.position.z = orbitRadius * Math.sin(angle);

	spheres.add(sphere);
	spheres.rotation.x = 0.1;
	spheres.position.y = -0.9;
	scene.add(spheres);

}

// gsap code

// setInterval(() => {
// 	gsap.to(spheres.rotation, {
// 		y: `+=${Math.PI/2}`,
// 		duration:2,
// 		ease:"expo.easeInOut"
// 	})
// }, 2500);

// // Add Studio Lighting

// // 1. Ambient Light: Provides a base level of light across the entire scene
// const ambientLight = new THREE.AmbientLight(0x404040, 1.2); // Slightly bright ambient light
// scene.add(ambientLight);

// // 2. Directional Light: Mimics sunlight, casting strong shadows
// const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
// directionalLight1.position.set(5, 10, 7.5); // Positioned above and to the side
// scene.add(directionalLight1);

// // 3. Second Directional Light for fill lighting
// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
// directionalLight2.position.set(-5, 7, -5); // Positioned opposite to fill shadows
// scene.add(directionalLight2);

// // 4. Spotlight: Adds strong, focused light
// const spotlight = new THREE.SpotLight(0xffffff, 1.5);
// spotlight.position.set(0, 10, 10);
// spotlight.angle = Math.PI / 6; // Narrow spotlight angle
// spotlight.penumbra = 0.2; // Slight falloff on the edges
// spotlight.castShadow = true; // Enable shadow casting
// scene.add(spotlight);

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollcoutn = 0;

function throttleWheelHandler(event) {
	const currentTime = Date.now();
	if (currentTime - lastWheelTime >= throttleDelay) {


		lastWheelTime = currentTime;
		const direction = event.deltaY > 0 ? "down" : "up";

		scrollcoutn = (scrollcoutn + 1) % 4;
		console.log(scrollcoutn);

		const headings = document.querySelectorAll(".heading");
		gsap.to(headings, {
			duration: 1,
			y: `-=${100}%`,
			ease: "power2.inOut",
		});

		gsap.to(spheres.rotation, {
			duration: 1,
			y: `-=${Math.PI / 2}%`,
			ease: "power2.inOut",
		})

		if (scrollcoutn === 0) {
			gsap.to(headings, {
				duration: 1,
				y: `0`,
				ease: "power2.inOut",
			});
		}
	}
}

window.addEventListener("wheel", throttleWheelHandler);

const clock = new THREE.Clock();
// Animation loop
function animate() {
	requestAnimationFrame(animate);
	for (let i = 0; i < spheresMesh.length; i++) {
		const sphere = spheresMesh[i];
		sphere.rotation.y = clock.getElapsedTime()*0.05;
	}
	// Render the scene
	renderer.render(scene, camera);
}
// Start the animation loop
animate();
