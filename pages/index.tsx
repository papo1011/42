import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Planet from "../lib/planet"; // Assuming Planet is typed correctly

const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);
const scalingFactor = 0.8;

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );

    camera.position.set(0, 100, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener("resize", handleResize);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.minDistance = 50;
    controls.maxDistance = 300;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    const sunGeometry = new THREE.SphereGeometry(
      Math.log(696.34) * scalingFactor,
    );
    const sunTexture = new THREE.TextureLoader().load("sun.jpeg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    const solarSystem = new THREE.Group();

    solarSystem.add(sunMesh);

    const planetsData = [
      {
        name: "Mercury",
        size: Math.log(2.4405) * scalingFactor,
        texture: "mercury.png",
        semiMajorAxis: 20,
        semiMinorAxis: 15,
        speed: EARTH_YEAR * 4,
        rotationSpeed: 0.06, // Custom rotation speed for Mercury
      },
      {
        name: "Venus",
        size: Math.log(6.0518) * scalingFactor,
        texture: "venus.jpeg",
        semiMajorAxis: 35,
        semiMinorAxis: 25,
        speed: EARTH_YEAR * 2,
        rotationSpeed: 0.003, // Custom rotation speed for Venus
      },
      {
        name: "Earth",
        size: Math.log(6.3781) * scalingFactor,
        texture: "earth.jpeg",
        semiMajorAxis: 50,
        semiMinorAxis: 40,
        speed: EARTH_YEAR,
        rotationSpeed: 0.03, // Custom rotation speed for Earth
      },
      {
        name: "Mars",
        size: Math.log(3.389) * scalingFactor,
        texture: "mars.jpeg",
        semiMajorAxis: 70,
        semiMinorAxis: 55,
        speed: EARTH_YEAR * 0.5,
        rotationSpeed: 0.024, // Custom rotation speed for Mars
      },
      {
        name: "Jupiter",
        size: Math.log(71.492) * scalingFactor,
        texture: "jupiter.jpeg",
        semiMajorAxis: 100,
        semiMinorAxis: 80,
        speed: EARTH_YEAR * 0.1,
        rotationSpeed: 0.09, // Custom rotation speed for Jupiter
      },
      {
        name: "Saturn",
        size: Math.log(60.268) * scalingFactor,
        texture: "saturn.jpeg",
        semiMajorAxis: 130,
        semiMinorAxis: 105,
        speed: EARTH_YEAR * 0.05,
        rotationSpeed: 0.075, // Custom rotation speed for Saturn
      },
      {
        name: "Uranus",
        size: Math.log(25.559) * scalingFactor,
        texture: "uranus.jpeg",
        semiMajorAxis: 160,
        semiMinorAxis: 130,
        speed: EARTH_YEAR * 0.025,
        rotationSpeed: 0.066, // Custom rotation speed for Uranus
      },
      {
        name: "Neptune",
        size: Math.log(24.764) * scalingFactor,
        texture: "neptune.jpg",
        semiMajorAxis: 190,
        semiMinorAxis: 155,
        speed: EARTH_YEAR * 0.0125,
        rotationSpeed: 0.054, // Custom rotation speed for Neptune
      },
    ];

    const planetMeshes: {
      mesh: THREE.Mesh;
      semiMajorAxis: number;
      semiMinorAxis: number;
      speed: number;
      angle: number;
      rotationSpeed: number;
    }[] = [];

    planetsData.forEach((planetData) => {
      const planet = new Planet(planetData.size, 32, planetData.texture); // Ensure Planet class is properly typed
      const planetMesh = planet.getMesh();

      planetMeshes.push({
        mesh: planetMesh,
        semiMajorAxis: planetData.semiMajorAxis,
        semiMinorAxis: planetData.semiMinorAxis,
        speed: planetData.speed,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: planetData.rotationSpeed, // Store the planet's rotation speed
      });
      solarSystem.add(planetMesh);
    });

    scene.add(solarSystem);

    const animate = () => {
      requestAnimationFrame(animate);

      sunMesh.rotation.y += 0.001;

      planetMeshes.forEach((planet) => {
        planet.angle += planet.speed;
        planet.mesh.position.x = planet.semiMajorAxis * Math.cos(planet.angle);
        planet.mesh.position.z = planet.semiMinorAxis * Math.sin(planet.angle);
        planet.mesh.rotation.y += planet.rotationSpeed; // Apply custom rotation speed
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center"
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
