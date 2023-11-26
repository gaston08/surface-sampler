import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3.5, 1.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 300, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(75, 300, -75);
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);

const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// createSamplerCubeFromSpheres();
// createTorusKnot();
createSamplerFromModel();

function render() {

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(render);

function createSamplerCubeFromSpheres() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    wireframe: true
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const sphereGeometry = new THREE.SphereGeometry(0.05, 6, 6);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa0e6
  });
  const spheres = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, 500);
  scene.add(spheres);

  const sampler = new MeshSurfaceSampler(cube).build();
  const tempPosition = new THREE.Vector3();
  const tempObject = new THREE.Object3D();
  for (let i = 0; i < 500; i++) {
    sampler.sample(tempPosition);
    tempObject.position.set(tempPosition.x, tempPosition.y, tempPosition.z);
    tempObject.scale.setScalar(Math.random() * 0.5);
    tempObject.updateMatrix();
    spheres.setMatrixAt(i, tempObject.matrix);
  }
}

function createTorusKnot() {
  const geometry = new THREE.TorusKnotGeometry(0.5, 0.2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    wireframe: true
  });
  const torusKnot = new THREE.Mesh(geometry, material);
  const sampler = new MeshSurfaceSampler(torusKnot).build();
  const tempPosition = new THREE.Vector3();

  const vertices = [];

  for (let i = 0; i < 10000; i++) {
    sampler.sample(tempPosition);
    vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xff61d5,
    size: 0.01
  });

  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);
}

function createSamplerFromModel() {
  const loader = new GLTFLoader();
  loader.load(
    '/man.glb',
    function (gltf) {
      const model = gltf.scene.children[0];
      model.position.set(0, 0, 0);
      model.matrix.makeScale(10, 10, 10);
      model.geometry.applyMatrix4(model.matrix);

      const sampler = new MeshSurfaceSampler(model).build();
      const tempPosition = new THREE.Vector3();

      const vertices = [];

      for (let i = 0; i < 20000; i++) {
        sampler.sample(tempPosition);
        vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
      }

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const pointsMaterial = new THREE.PointsMaterial({
        color: 0xff61d5,
        size: 0.005
      });

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(points);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.log('An error happened');
      console.log(error);
    }
  );
}