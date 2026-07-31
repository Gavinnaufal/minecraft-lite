import * as THREE from 'three';

const canvas = document.getElementById('game') as HTMLCanvasElement;

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({ 
  canvas, 
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
scene.background = new THREE.Color('#4da6ff');
scene.fog = new THREE.FogExp2('#87ceeb', 0.012);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xb1e0ff, 0x54402a, 0.45);
scene.add(hemiLight);

const directionalLight = new THREE.DirectionalLight(0xfffaed, 1.15);
directionalLight.position.set(20, 40, 15);
scene.add(directionalLight);

export const lights = { ambient: ambientLight, directional: directionalLight, hemi: hemiLight };

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
