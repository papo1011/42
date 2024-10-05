import * as THREE from "three";
import { useEffect } from "react";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Scene from "../lib/scene";
import Planet from "../lib/planet";
import Revolution from "../lib/revolution";

// NOTE: Animate solar system at 60fps.
const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);

export default function Home() {
  
  useEffect(() => {

    const sunGeometry = new THREE.SphereGeometry(8);
    const sunTexture = new THREE.TextureLoader().load("sun.jpeg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    const solarSystem = new THREE.Group();
    solarSystem.add(sunMesh);

    const mercury = new Planet(2, 16, "mercury.png");
    const mercuryMesh = mercury.getMesh();
    let mercurySystem = new THREE.Group();
    mercurySystem.add(mercuryMesh);

    const venus = new Planet(3, 32, "venus.jpeg");
    const venusMesh = venus.getMesh();
    let venusSystem = new THREE.Group();
    venusSystem.add(venusMesh);

    const earth = new Planet(4, 48, "earth.jpeg");
    const earthMesh = earth.getMesh();
    let earthSystem = new THREE.Group();
    earthSystem.add(earthMesh);

    const mars = new Planet(3, 64, "mars.jpeg");
    const marsMesh = mars.getMesh();
    let marsSystem = new THREE.Group();
    marsSystem.add(marsMesh);

    solarSystem.add(mercurySystem, venusSystem, earthSystem, marsSystem);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);


    const scene = new Scene(36, new THREE.PerspectiveCamera(), new THREE.Scene(), new Stats(), controls, new THREE.WebGLRenderer());
    scene.init();
    scene.scene.add(solarSystem);

    const mercuryRevolution = new Revolution(mercuryMesh);
    scene.scene.add(mercuryRevolution.getMesh());

    const venusRevolution = new Revolution(venusMesh);
    scene.scene.add(venusRevolution.getMesh());

    const earthRevolution = new Revolution(earthMesh);
    scene.scene.add(earthRevolution.getMesh());

    const marsRevolution = new Revolution(marsMesh);
    scene.scene.add(marsRevolution.getMesh());

    const animate = () => {

    requestAnimationFrame(animate);
    // Rotate each planet on its own axis (self-rotation)
    mercuryMesh.rotation.y += 0.01;
    venusMesh.rotation.y += 0.01;
    earthMesh.rotation.y += 0.01;
    marsMesh.rotation.y += 0.01;

    // Rotate each planet around the sun (revolution)
    sunMesh.rotation.y += 0.001;
    mercurySystem.rotation.y += EARTH_YEAR * 4;
    venusSystem.rotation.y += EARTH_YEAR * 2;
    earthSystem.rotation.y += EARTH_YEAR;
    marsSystem.rotation.y += EARTH_YEAR * 0.5;

    scene.controls.update();
    scene.renderer.render(scene.scene, scene.camera);
    scene.stats.update();

    scene.controls.update();
    scene.renderer.render(scene.scene, scene.camera);
    scene.stats.update();
    }

    animate();
  }

  , []);

    

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas id="orrery" />
    </div>
  );
}