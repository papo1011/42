import axios from "axios";
import { useRouter } from "next/router"; // Import the router for navigation
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Planet from "../lib/planet";

// Constants for orbit calculations
const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60); // Orbital speed of Earth
const MOON_ORBIT_SPEED = EARTH_YEAR * 3; // Speed of the Moon's orbit around Earth

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null); // Reference to the DOM container for the Three.js canvas
  const [showButton, setShowButton] = useState(false); // State to show or hide the button
  const [showMissionPrompt, setShowMissionPrompt] = useState(false); // State to show the mission prompt
  const [restart, setRestart] = useState(false); // State to manage scene restart
  const router = useRouter(); // Use router for navigation

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000,
    );

    camera.position.set(0, 100, 150); // Camera position

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high-density screens
    containerRef.current.appendChild(renderer.domElement); // Add the renderer to the DOM

    // Handle window resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Camera controls to allow mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true;
    controls.enableRotate = true;
    controls.minDistance = 50;
    controls.maxDistance = 1000;
    controls.enableDamping = true; // Adds damping effect to the controls
    controls.dampingFactor = 0.1;

    // Create the Sun
    const sunGeometry = new THREE.SphereGeometry(Math.log(696.34));
    const sunTexture = new THREE.TextureLoader().load("sun.jpeg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial); // Sun mesh
    const solarSystem = new THREE.Group(); // Group to represent the entire solar system

    solarSystem.add(sunMesh); // Add the Sun to the solar system

    // Starry background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
    });
    const starVertices = [];

    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);

      if (Math.abs(x) > 50 && Math.abs(y) > 50 && Math.abs(z) > 50) {
        starVertices.push(x, y, z);
      }
    }
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3),
    );
    const stars = new THREE.Points(starGeometry, starMaterial);

    scene.add(stars); // Add stars to the scene

    // Data for the planets
    const planetsData = [
      {
        name: "Mercury",
        size: Math.log(2.4405),
        texture: "mercury.png",
        semiMajorAxis: 20,
        semiMinorAxis: 15,
        speed: EARTH_YEAR * 4,
        rotationSpeed: 0.06,
      },
      {
        name: "Venus",
        size: Math.log(6.0518),
        texture: "venus.jpeg",
        semiMajorAxis: 35,
        semiMinorAxis: 25,
        speed: EARTH_YEAR * 2,
        rotationSpeed: 0.003,
      },
      {
        name: "Earth",
        size: Math.log(6.3781),
        texture: "earth.jpeg",
        semiMajorAxis: 50,
        semiMinorAxis: 40,
        speed: EARTH_YEAR,
        rotationSpeed: 0.03,
      },
      {
        name: "Mars",
        size: Math.log(3.389),
        texture: "mars.jpeg",
        semiMajorAxis: 70,
        semiMinorAxis: 55,
        speed: EARTH_YEAR * 0.5,
        rotationSpeed: 0.024,
      },
      {
        name: "Jupiter",
        size: Math.log(71.492),
        texture: "jupiter.jpeg",
        semiMajorAxis: 100,
        semiMinorAxis: 80,
        speed: EARTH_YEAR * 0.1,
        rotationSpeed: 0.09,
      },
      {
        name: "Saturn",
        size: Math.log(60.268),
        texture: "saturn.jpeg",
        semiMajorAxis: 130,
        semiMinorAxis: 105,
        speed: EARTH_YEAR * 0.05,
        rotationSpeed: 0.075,
      },
      {
        name: "Uranus",
        size: Math.log(25.559),
        texture: "uranus.jpeg",
        semiMajorAxis: 160,
        semiMinorAxis: 130,
        speed: EARTH_YEAR * 0.025,
        rotationSpeed: 0.066,
      },
      {
        name: "Neptune",
        size: Math.log(24.764),
        texture: "neptune.jpg",
        semiMajorAxis: 190,
        semiMinorAxis: 155,
        speed: EARTH_YEAR * 0.0125,
        rotationSpeed: 0.054,
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
    let moonAngle = 0; // Angle for the Moon's orbit

    // Create the planets
    planetsData.forEach((planetData) => {
      const planet = new Planet(planetData.size, 32, planetData.texture);
      const planetMesh = planet.getMesh(); // Get the planet's mesh

      planetMeshes.push({
        mesh: planetMesh,
        semiMajorAxis: planetData.semiMajorAxis,
        semiMinorAxis: planetData.semiMinorAxis,
        speed: planetData.speed,
        angle: Math.random() * Math.PI * 2, // Random angle to start the orbit
        rotationSpeed: planetData.rotationSpeed,
      });
      solarSystem.add(planetMesh); // Add the planet to the solar system
      if (planetData.name === "Earth") earthMesh = planetMesh;

      // Add rings to Saturn
      if (planetData.name === "Saturn") {
        const ringGeometry1 = new THREE.RingGeometry(
          Math.log(92) * 1.1,
          Math.log(117.5) * 1.1,
          64,
        );
        const ringGeometry2 = new THREE.RingGeometry(
          Math.log(122) * 1.12,
          Math.log(137) * 1.3,
          64,
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xd1c27d, // Color of the rings, similar to the real color
          side: THREE.DoubleSide,
        });
        const ringMesh1 = new THREE.Mesh(ringGeometry1, ringMaterial);
        const ringMesh2 = new THREE.Mesh(ringGeometry2, ringMaterial);

        ringMesh1.position.set(0, 0, 0);
        ringMesh2.position.set(0, 0, 0);

        // Rotate the rings so they are aligned with Saturn's axis
        ringMesh1.rotation.x = Math.PI / 2; // Adjust this depending on the orientation
        ringMesh2.rotation.x = Math.PI / 2; // Adjust this depending on the orientation
        planetMesh.add(ringMesh1, ringMesh2);
      }
    });

    // Add the solar system to the scene
    scene.add(solarSystem);

    // Creation of the Moon around the Earth
    if (earthMesh) {
      const moonGeometry = new THREE.SphereGeometry(Math.log(1.737));
      const moonTexture = new THREE.TextureLoader().load("moon.png");
      const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

      moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const earthMoonGroup = new THREE.Group();

      earthMoonGroup.add(earthMesh); // Earth-Moon group
      earthMoonGroup.add(moonMesh);
      solarSystem.add(earthMoonGroup);
      moonMesh.position.set(6, 0, 0); // Initial position of the Moon
    }

    // Load and create asteroids with NASA API data
    const asteroidMeshes: {
      mesh: THREE.Mesh;
      semiMajorAxis: number;
      semiMinorAxis: number;
      speed: number;
      angle: number;
    }[] = [];

    axios
      .get("https://api.nasa.gov/neo/rest/v1/feed?api_key=DEMO_KEY") // API call to get Near-Earth objects
      .then((response) => {
        const asteroids = response.data.near_earth_objects;

        Object.keys(asteroids).forEach((date) => {
          asteroids[date].forEach(() => {
            // Define the orbital parameters of the asteroid
            const semiMajorAxis = THREE.MathUtils.randFloat(200, 300); // Major axis of the orbit
            const semiMinorAxis =
              semiMajorAxis * THREE.MathUtils.randFloat(0.8, 1.2); // Minor axis of the orbit
            const speed = EARTH_YEAR * THREE.MathUtils.randFloat(0.1, 0.5); // Orbital speed
            const angle = Math.random() * Math.PI * 2; // Random initial angle

            // Creation of the asteroid mesh
            const asteroidGeometry = new THREE.SphereGeometry(0.5, 12, 12); // Asteroids are much smaller
            const asteroidMaterial = new THREE.MeshBasicMaterial({
              color: 0xaaaaaa,
            });
            const asteroidMesh = new THREE.Mesh(
              asteroidGeometry,
              asteroidMaterial,
            );

            asteroidMeshes.push({
              mesh: asteroidMesh,
              semiMajorAxis,
              semiMinorAxis,
              speed,
              angle,
            });
            scene.add(asteroidMesh); // Add the asteroid to the scene
          });
        });
      })
      .catch((error) => console.error("Error retrieving asteroids:", error));

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotation of the Sun
      sunMesh.rotation.y += 0.001;

      // Update the orbits of the planets
      planetMeshes.forEach((planet) => {
        planet.angle += planet.speed; // Update the orbital angle
        planet.mesh.position.x = planet.semiMajorAxis * Math.cos(planet.angle);
        planet.mesh.position.z = planet.semiMinorAxis * Math.sin(planet.angle);
        planet.mesh.rotation.y += planet.rotationSpeed; // Rotation of the planet
      });

      // Update the orbit of the Moon around the Earth
      if (moonMesh && earthMesh) {
        moonAngle += MOON_ORBIT_SPEED;
        const moonDistance = 6; // Distance of the Moon from the Earth

        moonMesh.position.x =
          earthMesh.position.x + moonDistance * Math.cos(moonAngle);
        moonMesh.position.z =
          earthMesh.position.z + moonDistance * Math.sin(moonAngle);
      }

      // Update the orbits of the asteroids
      asteroidMeshes.forEach((asteroid) => {
        asteroid.angle += asteroid.speed;
        asteroid.mesh.position.x =
          asteroid.semiMajorAxis * Math.cos(asteroid.angle);
        asteroid.mesh.position.z =
          asteroid.semiMinorAxis * Math.sin(asteroid.angle);
      });

      controls.update(); // Update the camera controls
      renderer.render(scene, camera); // Render the scene
    };

    animate(); // Start the animation

    // Cleanup when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [restart]); // Added restart to restart the scene in case of rejection

  // Show the button after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 20000);

    return () => clearTimeout(timer); // Clears the timer
  }, []);

  // Function to handle the user's response
  const handleUserResponse = (response: string) => {
    if (response === "yes") {
      router.push("/game"); // Redirect to the /game page
    } else if (response === "no") {
      setShowMissionPrompt(false); // Hide the prompt
      setShowButton(false); // Hide the button
      setRestart(true); // Restart the scene
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center"
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(to bottom, #000428, #004e92)", // Space gradient background
      }}
    >
      {showButton && !showMissionPrompt && (
        <button
          style={{
            position: "absolute",
            padding: "20px 40px",
            backgroundColor: "#ff6347",
            color: "white",
            border: "3px solid #ffffff",
            borderRadius: "15px",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.8)", // Space glow effect
            animation: "pulse 2s infinite", // Added animation for a pulsing effect
            transition: "transform 0.3s ease-in-out",
          }}
          onClick={() => setShowMissionPrompt(true)} // Show the mission prompt
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")} // Hover effect
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          HELP, THE EARTH IS IN DANGER!
        </button>
      )}

      {showMissionPrompt && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            textAlign: "center",
            backgroundColor: "white", // White background for the message
            padding: "40px", // Increased padding for a larger appearance
            borderRadius: "15px", // Rounded corners
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.7)", // Shadow to make the message stand out
            animation: "zoomIn 1s ease-in-out", // Zoom animation
            transform: "scale(1)", // Added scale for a smoother effect
            color: "black",
          }}
        >
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            Do you want to join the mission?
          </h1>{" "}
          {/* Larger font size */}
          <div style={{ marginTop: "20px" }}>
            <button
              style={{
                padding: "15px 30px", // Increased padding for buttons
                backgroundColor: "#32cd32",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "20px",
                marginRight: "10px",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(50, 205, 50, 0.8)",
                animation: "pulseGreen 2s infinite",
              }}
              onClick={() => handleUserResponse("yes")}
            >
              YES
            </button>
            <button
              style={{
                padding: "15px 30px", // Increased padding for buttons
                backgroundColor: "#ff4500",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "20px",
                marginLeft: "10px",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(255, 69, 0, 0.8)",
              }}
              onClick={() => handleUserResponse("no")}
            >
              NO
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
          }
          50% {
            box-shadow: 0 0 60px rgba(255, 255, 255, 1);
          }
          100% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
          }
        }

        @keyframes pulseGreen {
          0% {
            box-shadow: 0 0 30px rgba(50, 205, 50, 0.8);
          }
          50% {
            box-shadow: 0 0 60px rgba(50, 205, 50, 1);
          }
          100% {
            box-shadow: 0 0 30px rgba(50, 205, 50, 0.8);
          }
        }

        @keyframes zoomIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
