import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Planet from "../lib/planet";

const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);
const MOON_ORBIT_SPEED = EARTH_YEAR * 3; // Velocità dell'orbita della Luna attorno alla Terra

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null); // Riferimento per il contenitore DOM

  useEffect(() => {
    if (!containerRef.current) return;

    // Crea la scena, la camera e il renderer
    const scene = new THREE.Scene(); // Creazione della scena
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000,
    );

    camera.position.set(0, 100, 150); // Imposta la posizione della telecamera

    const renderer = new THREE.WebGLRenderer({ antialias: true }); // Creazione del renderer con antialias per una migliore qualità dell'immagine

    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio); // Imposta il rapporto dei pixel per una migliore risoluzione
    containerRef.current.appendChild(renderer.domElement); // Aggiunge il canvas del renderer al contenitore

    // Gestisci il ridimensionamento della finestra
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      renderer.setSize(width, height); // Aggiorna la dimensione del renderer
      camera.aspect = width / height; // Aggiorna il rapporto d'aspetto della telecamera
      camera.updateProjectionMatrix(); // Aggiorna la matrice di proiezione della telecamera
    };

    window.addEventListener("resize", handleResize);

    // Controlli di orbitazione della telecamera
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true; // Abilita il movimento della camera tramite pan
    controls.enableRotate = true; // Abilita la rotazione della camera
    controls.minDistance = 50; // Limita la distanza minima di zoom della telecamera
    controls.maxDistance = 1000; // Limita la distanza massima di zoom della telecamera
    controls.enableDamping = true; // Abilita lo smorzamento per controlli più fluidi
    controls.dampingFactor = 0.1; // Fattore di smorzamento per controllare l'inerzia
    controls.screenSpacePanning = false; // Abilita il movimento dello schermo senza mantenere il Sole al centro
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN, // Rendi il tasto sinistro del mouse utile per il pan
      MIDDLE: THREE.MOUSE.DOLLY, // Tasto centrale per zoommare
      RIGHT: THREE.MOUSE.ROTATE, // Tasto destro per la rotazione
    };

    // Creazione del Sole
    const sunGeometry = new THREE.SphereGeometry(Math.log(696.34));
    const sunTexture = new THREE.TextureLoader().load("sun.jpeg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    const solarSystem = new THREE.Group(); // Creazione del gruppo del sistema solare

    solarSystem.add(sunMesh);

    // Aggiungi lo sfondo stellato
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
    }); // Riduzione della dimensione dei punti per evitare che appaiano troppo grandi vicino ai pianeti
    const starVertices = [];

    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);

      if (Math.abs(x) > 50 && Math.abs(y) > 50 && Math.abs(z) > 50) {
        // Evita di creare stelle troppo vicine al centro
        starVertices.push(x, y, z);
      }
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3),
    );

    const stars = new THREE.Points(starGeometry, starMaterial);

    scene.add(stars);

    // Dati per i pianeti
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

    // Creazione dei pianeti
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

      // Aggiunta degli anelli a Saturno
      if (planetData.name === "Saturn") {
        const ringGeometry1 = new THREE.RingGeometry(
          Math.log(92) * 1.1,
          Math.log(117.5) * 1.1,
          64,
        );
        const RingGeometry2 = new THREE.RingGeometry(
          Math.log(122) * 1.12,
          Math.log(137) * 1.3,
          64,
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xd1c27d, // Colore degli anelli, simile al colore reale
          side: THREE.DoubleSide,
        });
        const ringMesh1 = new THREE.Mesh(ringGeometry1, ringMaterial);
        const ringMesh2 = new THREE.Mesh(RingGeometry2, ringMaterial);

        ringMesh1.position.set(0, 0, 0);
        ringMesh2.position.set(0, 0, 0);

        // Rotate the rings so they are aligned with Saturn's axis
        ringMesh1.rotation.x = Math.PI / 2; // Adjust this depending on the orientation
        ringMesh2.rotation.x = Math.PI / 2; // Adjust this depending on the orientation
        planetMesh.add(ringMesh1, ringMesh2);
      }
    });

    // Aggiungi il sistema solare alla scena
    scene.add(solarSystem);

    // Creazione della Luna
    if (earthMesh) {
      const moonGeometry = new THREE.SphereGeometry(Math.log(1.737));
      const moonTexture = new THREE.TextureLoader().load("moon.png");
      const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

      moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

      // Gruppo Terra-Luna
      const earthMoonGroup = new THREE.Group();

      earthMoonGroup.add(earthMesh);
      earthMoonGroup.add(moonMesh);
      solarSystem.add(earthMoonGroup);

      moonMesh.position.set(6, 0, 0); // Posizione iniziale della Luna rispetto alla Terra
    }

    // Funzione di animazione
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotazione del Sole
      sunMesh.rotation.y += 0.001;

      // Aggiorna le orbite dei pianeti
      planetMeshes.forEach((planet) => {
        planet.angle += planet.speed;
        planet.mesh.position.x = planet.semiMajorAxis * Math.cos(planet.angle);
        planet.mesh.position.z = planet.semiMinorAxis * Math.sin(planet.angle);
        planet.mesh.rotation.y += planet.rotationSpeed;
      });

      // Variabile per l'angolo della Luna
      let moonAngle = 0;

      // Aggiorna l'orbita della Luna attorno alla Terra
      if (moonMesh && earthMesh) {
        moonAngle += MOON_ORBIT_SPEED; // Incrementa l'angolo della Luna utilizzando la velocità dell'orbita
        const moonDistance = 6; // Distanza della Luna dalla Terra

        moonMesh.position.x =
          earthMesh.position.x + moonDistance * Math.cos(moonAngle);
        moonMesh.position.z =
          earthMesh.position.z + moonDistance * Math.sin(moonAngle);
        // Sincronizza la rotazione della Luna con la sua orbita attorno alla Terra
        moonMesh.rotation.y = -moonAngle;
      }

      // Renderizza la scena
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
      style={{ width: "100%", height: "100vh", position: "relative" }}
    />
  );
}
