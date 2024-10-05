import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);
const MOON_ORBIT_SPEED = EARTH_YEAR * 3; // Adjust speed for moon orbit

export default function EarthMoonSystem() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000,
    );

    camera.position.set(0, 50, 150); // Camera closer to Earth

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

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Earth creation
    const earthGeometry = new THREE.SphereGeometry(6.3781, 64, 64);
    const earthTexture = new THREE.TextureLoader().load("earth.jpeg");
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

    scene.add(earthMesh);

    // Moon creation
    const moonGeometry = new THREE.SphereGeometry(1.737, 64, 64);
    const moonTexture = new THREE.TextureLoader().load("moon.png");
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

    scene.add(moonMesh);

    // Moon orbit distance
    const moonDistance = 384;
    let moonAngle = 0;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Earth rotation
      earthMesh.rotation.y += 0.01; // Rotate Earth around its axis

      // Moon orbit around Earth
      moonAngle += MOON_ORBIT_SPEED;
      moonMesh.position.x =
        earthMesh.position.x + moonDistance * Math.cos(moonAngle);
      moonMesh.position.z =
        earthMesh.position.z + moonDistance * Math.sin(moonAngle);

      // Sincronizza la rotazione della Luna con la sua orbita attorno alla Terra
      moonMesh.rotation.y = -moonAngle;

      // Render the scene
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
