"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

export default function OrganicBlob({
  color = 0xff6b6b,
  size = 1, // sphere radius
  speed = 0.005, // animation speed
  noiseStrength = 0.23, // displacement amount
}: {
  color?: number;
  size?: number;
  speed?: number;
  noiseStrength?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  function createCircleTexture() {
    const canvasSize = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(
      canvasSize / 2,
      canvasSize / 2,
      canvasSize / 8,
      canvasSize / 2,
      canvasSize / 2,
      canvasSize / 2,
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  useEffect(() => {
    const mountEl = mountRef.current; // capture once for safe cleanup
    if (!mountEl) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountEl.appendChild(renderer.domElement);

    // Geometry (dense sphere -> many points)
    const sphereGeometry = new THREE.SphereGeometry(size, 128, 128);
    const vertices = sphereGeometry.getAttribute("position")
      .array as Float32Array;

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3),
    );

    // Material (soft circular sprite per point)
    const circleTexture = createCircleTexture();
    const pointsMaterial = new THREE.PointsMaterial({
      color,
      size: 0.015,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      map: circleTexture,
      alphaTest: 0.01,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    // Noise + animation
    const noise3D = createNoise3D();
    const originalPositions = Float32Array.from(vertices);

    let rafId = 0;
    let time = 0;

    const animate = () => {
      time += speed;

      const positions = pointsGeometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const y = originalPositions[i + 1];
        const z = originalPositions[i + 2];

        const noise = noise3D(x * 1.5, y * 1.5, z * 1.5 + time);
        const factor = 1 + noiseStrength * noise;

        positions[i] = x * factor;
        positions[i + 1] = y * factor;
        positions[i + 2] = z * factor;
      }
      pointsGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

    // Resize handling
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      // Dispose resources
      circleTexture.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      sphereGeometry.dispose();
      renderer.dispose();
    };
  }, [color, size, speed, noiseStrength]);

  return <div ref={mountRef} />;
}
