import axios from "axios";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Planet from "../lib/planet";

// Constants
const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);
const MOON_ORBIT_SPEED = EARTH_YEAR * 6; // Moon's orbit speed around Earth
const scalingFactor = 1;

// Types for API responses
interface NearEarthObject {
  id: string;
  name: string;
  // Add other relevant fields as needed from the API
}

interface FireballData {
  date: string;
  energy: number;
  impact_e: number;
  // Add other relevant fields as needed from the API
}

interface PlanetData {
  name: string;
  size: number;
  texture: string;
  semiMajorAxis: number;
  semiMinorAxis: number;
  speed: number;
  rotationSpeed: number;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null); // Reference for DOM container
  const [nearEarthObjects, setNearEarthObjects] = useState<NearEarthObject[]>(
    [],
  ); // State for Near-Earth objects
  const [fireballData, setFireballData] = useState<FireballData[]>([]); // State for Fireball data

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene, camera, and renderer
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

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Camera orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.minDistance = 50;
    controls.maxDistance = 350;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Create the Sun
    const sunGeometry = new THREE.SphereGeometry(
      Math.log(696.34) * scalingFactor,
    );
    const sunTexture = new THREE.TextureLoader().load("sun.jpeg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    const solarSystem = new THREE.Group();

    solarSystem.add(sunMesh);

    // Data for planets
    const planetsData: PlanetData[] = [
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

    let earthMesh: THREE.Mesh | null = null;
    let moonMesh: THREE.Mesh | null = null;

    // Create planets
    planetsData.forEach((planetData) => {
      const planet = new Planet(planetData.size, 32, planetData.texture);
      const planetMesh = planet.getMesh();

      planetMeshes.push({
        mesh: planetMesh,
        semiMajorAxis: planetData.semiMajorAxis,
        semiMinorAxis: planetData.semiMinorAxis,
        speed: planetData.speed,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: planetData.rotationSpeed,
      });
      solarSystem.add(planetMesh);

      if (planetData.name === "Earth") {
        earthMesh = planetMesh;
      }
    });

    // Add solar system to the scene
    scene.add(solarSystem);

    // Create the Moon
    if (earthMesh) {
      const moonGeometry = new THREE.SphereGeometry(
        Math.log(1.737) * scalingFactor,
      );
      const moonTexture = new THREE.TextureLoader().load("moon.png");
      const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

      moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

      // Earth-Moon group
      const earthMoonGroup = new THREE.Group();

      earthMoonGroup.add(earthMesh);
      earthMoonGroup.add(moonMesh);
      solarSystem.add(earthMoonGroup);

      moonMesh.position.set(5.5, 0, 0);
    }

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);

      // Sun rotation
      sunMesh.rotation.y += 0.001;

      // Update planet orbits
      planetMeshes.forEach((planet) => {
        planet.angle += planet.speed;
        planet.mesh.position.x = planet.semiMajorAxis * Math.cos(planet.angle);
        planet.mesh.position.z = planet.semiMinorAxis * Math.sin(planet.angle);
        planet.mesh.rotation.y += 0.01;
      });

      // Update Moon's orbit around Earth
      if (moonMesh && earthMesh) {
        let moonAngle = MOON_ORBIT_SPEED * 0.5;

        moonMesh.position.x = earthMesh.position.x + 10 * Math.cos(moonAngle);
        moonMesh.position.z = earthMesh.position.z + 10 * Math.sin(moonAngle);
      }

      // Render scene
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

  // Fetch Near-Earth objects and Fireball data
  useEffect(() => {
    axios
      .get(
        "https://api.nasa.gov/neo/rest/v1/feed?api_key=aB5ASTBsdKFPiiDjEMAIDaTu2aSY3m67fYqOOBuT",
      )
      .then((response) => setNearEarthObjects(response.data.near_earth_objects))
      .catch((error) => console.error("Error fetching NEO data:", error));
  }, []);

  useEffect(() => {
    axios
      .get("https://ssd-api.jpl.nasa.gov/fireball.api")
      .then((response) => setFireballData(response.data.data))
      .catch((error) => console.error("Error fetching Fireball data:", error));
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center"
      style={{ width: "100%", height: "100vh", position: "relative" }}
    />
  );
}
