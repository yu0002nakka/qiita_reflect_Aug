import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as lil from 'lil-gui';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 5);
camera.lookAt(0, 0, 0);

const canvasEl = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: canvasEl,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const orbit = new OrbitControls(camera, canvasEl);
orbit.enableDamping = true;
orbit.dampingFactor = 0.2;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({
  color: 0xb3424a,
  metalness: 1.0,
  roughness: 0.4,
});

const MAX_COUNT = 500;
const instanced = new THREE.InstancedMesh(geometry, material, MAX_COUNT);

const params = {
  range: 20,
};
const dummy = new THREE.Object3D();

const basePosition = [];
const baseRotation = [];

for (let i = 0; i < MAX_COUNT; i++) {
  basePosition.push(new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(1),
      THREE.MathUtils.randFloatSpread(1),
      THREE.MathUtils.randFloatSpread(1)
    )
  );

  baseRotation.push(new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )  
  );
}

function updateRange() {
  for (let i=0; i < MAX_COUNT; i++) {
    dummy.position.copy(basePosition[i]).multiplyScalar(params.range);

    dummy.rotation.copy(baseRotation[i]);

    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
  }

  instanced.instanceMatrix.needsUpdate = true;
  instanced.computeBoundingBox();
}

updateRange();
instanced.count = 100

scene.add(instanced);

const direcrionalLight = new THREE.DirectionalLight(0xffffff);
direcrionalLight.position.set(1,1,1);
scene.add(direcrionalLight);

const pointLight = new THREE.PointLight(0xffffff, 200, 300);
scene.add(pointLight);

// GUI ---------------------------------------------------------
const gui = new lil.GUI();

const buttons = {
  seed: () => {
    for (let i = 0; i < MAX_COUNT; i++) {
      basePosition[i].set(
        THREE.MathUtils.randFloatSpread(1),
        THREE.MathUtils.randFloatSpread(1),
        THREE.MathUtils.randFloatSpread(1)
      );

      baseRotation[i].set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      updateRange();
    }
  },

  resetOrbit: () => {
    orbit.reset();
  },
}

gui.add(instanced, 'count', 100, 500, 10).name("count").onChange(() => {
    instanced.computeBoundingBox();
    instanced.computeBoundingSphere();
  });
gui.add(params, 'range', 10, 30, 1).name("range").onChange(updateRange);
gui.add(buttons, 'resetOrbit').name("Reset orbit");
gui.add(buttons, 'seed').name("Change seed");

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

function tick() {
  orbit.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(tick);
