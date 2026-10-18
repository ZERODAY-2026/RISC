import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeGlassVaultCanvas
 * 100% Local Pure Three.js WebGL 3D Centerpiece
 * Strict Engineering Safeguards:
 * - Pure `THREE.WebGLRenderer` via useRef + useEffect (Zero @react-three/fiber crashes)
 * - Physically correct warm porcelain & refractive glass shaders
 * - 3 Interlocking glowing orbital rings (Emerald, Amber Gold, Indigo)
 * - Tilted Ceramic Contract Monograph with frosted verification panes
 * - 14 Orbiting micro-particles & responsive mouse parallax
 */
export default function ThreeGlassVaultCanvas({ className = '', scale = 0.86 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera with Generous Frustum
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 100);

    const updateCameraFraming = (aspect) => {
      // Dynamic zoom: gives generous breathing room so orbital rings never touch viewport edges
      const baseDistance = 8.5;
      const targetZ = aspect < 1 ? baseDistance / Math.max(aspect, 0.75) : baseDistance;
      camera.position.set(0, 0.08, targetZ);
      camera.lookAt(0, 0, 0);
    };

    updateCameraFraming(width / height);

    // 2. Pure WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting (Warm Porcelain Aesthetic)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    warmKeyLight.position.set(6, 8, 7);
    scene.add(warmKeyLight);

    const coolRimLight = new THREE.DirectionalLight(0xe0f2fe, 1.8);
    coolRimLight.position.set(-6, -3, -5);
    scene.add(coolRimLight);

    const softFillLight = new THREE.PointLight(0xe0e7ff, 1.2, 20);
    softFillLight.position.set(0, 4, -3);
    scene.add(softFillLight);

    // 4. Central Group for Mouse Parallax
    const centralGroup = new THREE.Group();
    centralGroup.scale.set(scale, scale, scale);
    scene.add(centralGroup);

    // ─── 4A. Outer Refractive Translucent Glass Sphere ───
    const glassSphereGeo = new THREE.SphereGeometry(2.3, 64, 64);
    const glassSphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1.0,
      transparent: true,
      roughness: 0.08,
      ior: 1.45,
      thickness: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });
    const glassSphere = new THREE.Mesh(glassSphereGeo, glassSphereMat);
    centralGroup.add(glassSphere);

    // ─── 4B. Inner Ceramic Contract Monograph (Legal Book / Slab) ───
    const contractGroup = new THREE.Group();
    contractGroup.rotation.set(0.18, -0.25, -0.18);

    // Matte warm porcelain contract slab
    const bookGeo = new THREE.BoxGeometry(1.6, 2.1, 0.28);
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfaf8f5,
      roughness: 0.32,
      metalness: 0.05,
    });
    const bookMesh = new THREE.Mesh(bookGeo, ceramicMat);
    contractGroup.add(bookMesh);

    // Golden verification seal disc at top
    const sealGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
    });
    const sealMesh = new THREE.Mesh(sealGeo, goldMat);
    sealMesh.rotation.x = Math.PI / 2;
    sealMesh.position.set(0, 0.68, 0.15);
    contractGroup.add(sealMesh);

    // Embossed clause lines on contract face
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const linePositions = [0.38, 0.18, -0.02, -0.22, -0.42, -0.62, -0.82];
    linePositions.forEach((y, idx) => {
      const lineWidth = idx % 2 === 0 ? 1.15 : 0.85;
      const lineGeo = new THREE.BoxGeometry(lineWidth, 0.04, 0.02);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(idx % 2 === 0 ? 0 : -0.15, y, 0.15);
      contractGroup.add(lineMesh);
    });

    // Front Frosted Verification Glass Sheet
    const frontPaneGeo = new THREE.BoxGeometry(1.4, 0.75, 0.04);
    const frontPaneMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      transmission: 0.88,
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      thickness: 0.6,
      ior: 1.4,
    });
    const frontPaneMesh = new THREE.Mesh(frontPaneGeo, frontPaneMat);
    frontPaneMesh.position.set(0.1, -0.2, 0.22);
    frontPaneMesh.rotation.z = -0.05;
    contractGroup.add(frontPaneMesh);

    // Back Frosted Verification Glass Sheet
    const backPaneGeo = new THREE.BoxGeometry(1.3, 0.6, 0.04);
    const backPaneMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.85,
      roughness: 0.12,
      thickness: 0.5,
      ior: 1.4,
    });
    const backPaneMesh = new THREE.Mesh(backPaneGeo, backPaneMat);
    backPaneMesh.position.set(-0.15, 0.3, -0.2);
    backPaneMesh.rotation.z = 0.08;
    contractGroup.add(backPaneMesh);

    centralGroup.add(contractGroup);

    // ─── 4C. 3 Interlocking Glowing Glass Orbital Rings ───
    // Ring 1: Emerald (Verbatim Quote Grounding)
    const ring1Geo = new THREE.TorusGeometry(2.55, 0.065, 32, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.45,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.set(Math.PI / 3, 0.3, 0);
    centralGroup.add(ring1);

    // Ring 2: Amber Gold (Clause Risk & Penalty Spotting)
    const ring2Geo = new THREE.TorusGeometry(2.42, 0.055, 32, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.set(Math.PI / 4, Math.PI / 4, 0.5); // 45 deg tilt
    centralGroup.add(ring2);

    // Ring 3: Indigo (Safe Statutory Escalation)
    const ring3Geo = new THREE.TorusGeometry(2.70, 0.05, 32, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.45,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.set(-0.61, -0.6, Math.PI / 3); // -35 deg tilt
    centralGroup.add(ring3);

    // ─── 4D. 14 Orbiting Micro-Cubes & Particles ───
    const particleGroup = new THREE.Group();
    const particleCount = 14;
    const particleMeshes = [];
    const cubeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

    for (let i = 0; i < particleCount; i++) {
      const isGold = i % 3 === 0;
      const isEmerald = i % 3 === 1;
      const pMat = new THREE.MeshStandardMaterial({
        color: isGold ? 0xf59e0b : isEmerald ? 0x10b981 : 0x6366f1,
        metalness: 0.8,
        roughness: 0.2,
      });
      const pMesh = new THREE.Mesh(cubeGeo, pMat);
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.4 + (i % 3) * 0.35;
      pMesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.8 + Math.sin(i) * 0.4,
        Math.sin(angle) * radius
      );
      pMesh.rotation.set(Math.random(), Math.random(), Math.random());
      particleMeshes.push({ mesh: pMesh, speed: 0.008 + (i % 4) * 0.004, angle, radius });
      particleGroup.add(pMesh);
    }
    centralGroup.add(particleGroup);

    // ─── 4E. Soft Physical Studio Shadow Floor ───
    const shadowGeo = new THREE.PlaneGeometry(6.6, 6.6);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    grad.addColorStop(0, 'rgba(40, 30, 20, 0.24)');
    grad.addColorStop(0.5, 'rgba(40, 30, 20, 0.08)');
    grad.addColorStop(1, 'rgba(40, 30, 20, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.50;
    scene.add(shadowPlane);

    // ─── 5. Mouse Parallax & Dynamic Hover ───
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.6;
      mouseY = y * 0.6;
    };

    window.addEventListener('mousemove', onMouseMove);

    // ─── 6. Animation Loop (60 FPS Physical Motion) ───
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / group parallax with tactile damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      centralGroup.rotation.y = targetX * 1.2 + Math.sin(elapsedTime * 0.25) * 0.12;
      centralGroup.rotation.x = -targetY * 0.8 + Math.cos(elapsedTime * 0.3) * 0.08;

      // Gentle floating levitation on contract monograph
      contractGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08;
      contractGroup.rotation.y = -0.25 + Math.sin(elapsedTime * 0.5) * 0.05;

      // Orbital rotations for the 3 distinct rings
      ring1.rotation.z += 0.007;
      ring1.rotation.x += 0.004;

      ring2.rotation.y -= 0.006;
      ring2.rotation.z += 0.005;

      ring3.rotation.x -= 0.005;
      ring3.rotation.y += 0.008;

      // Orbiting micro-particles
      particleMeshes.forEach((p, idx) => {
        p.angle += p.speed;
        p.mesh.position.x = Math.cos(p.angle) * p.radius;
        p.mesh.position.z = Math.sin(p.angle) * p.radius;
        p.mesh.position.y += Math.sin(elapsedTime * 2 + idx) * 0.002;
        p.mesh.rotation.x += 0.02;
        p.mesh.rotation.y += 0.02;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ─── 7. Responsive Resize Observer ───
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (!newWidth || !newHeight) return;
      camera.aspect = newWidth / newHeight;
      updateCameraFraming(newWidth / newHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ─── 8. Cleanup on Unmount ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [scale]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none overflow-visible ${className}`}
    />
  );
}
