import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import TWEEN from "@tweenjs/tween.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Load textures for Earth, Moon, Clouds, and Marker icon
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("/earth.png");
const moonTexture = textureLoader.load("/moon1.png");
const cloudTexture = textureLoader.load("/clouds4.jpg");
const markerIcon = textureLoader.load("/marker-icon.png"); // Replace with your marker icon image

// Earth geometry and material with texture
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshBasicMaterial({
  map: earthTexture,
  wireframe: false,
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Cloud layer geometry and material
const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
const cloudMaterial = new THREE.MeshBasicMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 0.3,
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Moon geometry and material with texture
const moonGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const moonMaterial = new THREE.MeshBasicMaterial({
  map: moonTexture,
  wireframe: false,
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.x = -2;
scene.add(moon);

camera.position.z = 5;

// Function to convert latitude/longitude to 3D coordinates
interface LatLonToXYZ {
  (lat: number, lon: number, radius: number): THREE.Vector3;
}

const latLonToXYZ: LatLonToXYZ = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180); // Latitude to phi (polar angle)
  const theta = (lon + 180) * (Math.PI / 180); // Longitude to theta (azimuthal angle)

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
};

// Example locations: New York City, Paris, Tokyo
const exampleLocations = [
  { name: "Bahawalpur", lat: 29.3544, lon: 71.6911 },
  { name: "New York City", lat: 40.7128, lon: -74.006 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
];

// Create markers and name labels for locations
exampleLocations.forEach((location) => {
  const { lat, lon, name } = location;
  const markerPosition = latLonToXYZ(lat, lon, 1.05); // Slightly larger radius than Earth

  // Create a sprite for the marker
  const markerMaterial = new THREE.SpriteMaterial({ map: markerIcon });
  const marker = new THREE.Sprite(markerMaterial);

  // Position the marker at the 3D coordinates
  marker.position.set(markerPosition.x, markerPosition.y, markerPosition.z);
  marker.scale.set(0.1, 0.1, 1); // Adjust size

  // Add the marker to the scene
  scene.add(marker);
  markers.push(marker);

  // Create the name label using THREE.TextGeometry or CanvasTexture
  const textCanvas = document.createElement("canvas");
  const context = textCanvas.getContext("2d");
  if (context) {
    context.font = "24px Arial";
  }
  if (context) {
    context.fillStyle = "white";
  }
  context?.fillText(name, 10, 50); // Adjust position of the name text
  const nameTexture = new THREE.CanvasTexture(textCanvas);

  const nameMaterial = new THREE.SpriteMaterial({ map: nameTexture });
  const nameSprite = new THREE.Sprite(nameMaterial);

  // Position the name label slightly above the marker
  nameSprite.position.set(
    markerPosition.x,
    markerPosition.y + 0.1,
    markerPosition.z
  );
  nameSprite.scale.set(0.5, 0.5, 1); // Adjust the scale of the name text

  // Add the name label to the scene
  scene.add(nameSprite);
  names.push(nameSprite);
});

// Handle mouse click to detect marker or name click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedLocation = null;

interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface Marker extends THREE.Sprite {
  position: THREE.Vector3;
}

interface NameSprite extends THREE.Sprite {
  position: THREE.Vector3;
}

const locations: Location[] = [
  { name: "Bahawalpur", lat: 29.3544, lon: 71.6911 },
  { name: "New York City", lat: 40.7128, lon: -74.006 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
];

const markers: Marker[] = [];
const names: NameSprite[] = [];

function onMouseClick(event: MouseEvent): void {
  // Normalize mouse coordinates to [-1, 1] range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.update();
  raycaster.setFromCamera(mouse, camera);

  // Check if any marker or name is clicked
  const intersectsMarkers = raycaster.intersectObjects(markers);
  const intersectsNames = raycaster.intersectObjects(names);

  // If any marker is clicked
  if (intersectsMarkers.length > 0) {
    selectedLocation = intersectsMarkers[0].object as Marker;
    zoomToLocation(selectedLocation.position);
  }

  // If any name is clicked
  if (intersectsNames.length > 0) {
    selectedLocation = intersectsNames[0].object as NameSprite;
    zoomToLocation(selectedLocation.position);
  }
}

interface ZoomToLocation {
  (position: THREE.Vector3): void;
}

const zoomToLocation: ZoomToLocation = (position) => {
  // Smoothly zoom to the location
  const targetPosition = new THREE.Vector3(position.x, position.y, position.z);
  const zoomSpeed = 0.05; // Adjust the speed of the zoom
  const zoomDuration = 1000; // Duration of the zoom in milliseconds

  // Move camera towards the selected location
  new TWEEN.Tween(camera.position)
    .to(
      { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z + 2 },
      zoomDuration
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
};

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.autoRotate = true;
controls.zoomSpeed = 0.5;
controls.panSpeed = 0.5;
controls.enablePan = false;
controls.screenSpacePanning = false;
controls.enableKeys = false;

function animate() {
  window.requestAnimationFrame(animate);
  renderer.render(scene, camera);

  clouds.rotation.y += 0.001; // Rotate clouds slightly slower for effect

  controls.update();
  TWEEN.update(); // Update tween animations
}
animate();

// Add event listener for mouse click
window.addEventListener("click", onMouseClick, false);
