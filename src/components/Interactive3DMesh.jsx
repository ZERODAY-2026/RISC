import React, { useEffect, useRef } from 'react';

/**
 * Interactive 3D Spatial Canvas
 * Renders an interactive 3D perspective geometric lattice and particle mesh
 * with true 3D matrix rotation and mouse cursor parallax.
 * 100% self-contained, zero external libraries, air-gapped safe.
 */
export default function Interactive3DMesh({ is3DActive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 600);

    // Mouse coordinates and rotational targets
    let mouseX = 0;
    let mouseY = 0;
    let rotX = 0.2;
    let rotY = -0.3;
    let targetRotX = 0.2;
    let targetRotY = -0.3;

    // Generate 3D vertices for a legal security polyhedron & orbital dust
    const nodes = [];
    const nodeCount = 42;
    const radius = Math.min(width, height) * 0.28;

    // Golden ratio polyhedron / Fibonacci sphere distribution
    const phi = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < nodeCount; i++) {
      const theta = 2 * Math.PI * i / phi;
      const phiAngle = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
      const r = radius * (0.75 + (i % 3) * 0.15);
      nodes.push({
        x: r * Math.sin(phiAngle) * Math.cos(theta),
        y: r * Math.sin(phiAngle) * Math.sin(theta),
        z: r * Math.cos(phiAngle),
        origR: r,
        size: (i % 4 === 0) ? 3.5 : 2.2,
        isAnchor: i % 5 === 0,
      });
    }

    // Add floating ambient particle field
    const ambientParticles = [];
    for (let i = 0; i < 60; i++) {
      ambientParticles.push({
        x: (Math.random() - 0.5) * width * 0.9,
        y: (Math.random() - 0.5) * height * 0.9,
        z: (Math.random() - 0.5) * 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseX = x;
      mouseY = y;
      targetRotY = (x / width) * 1.2;
      targetRotX = -(y / height) * 0.9;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 600;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Projection Engine
    const focalLength = 480;

    const render = () => {
      // Smooth rotational inertia
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      // Base gentle continuous rotation
      if (is3DActive) {
        targetRotY += 0.0015;
      }

      ctx.clearRect(0, 0, width, height);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const cx = width / 2;
      const cy = height / 2 - 20;

      // 1. Project & Render Polyhedron Nodes
      const projected = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // 3D rotation (Yaw around Y, then Pitch around X)
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        // Perspective projection
        const pz = z2 + focalLength;
        if (pz > 10) {
          const scale = focalLength / pz;
          projected.push({
            px: cx + x1 * scale,
            py: cy + y2 * scale,
            scale,
            z: z2,
            size: n.size * scale,
            isAnchor: n.isAnchor,
            index: i,
          });
        }
      }

      // Sort by Z for proper depth ordering
      projected.sort((a, b) => a.z - b.z);

      // Draw connecting edges
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 95 * ((p1.scale + p2.scale) / 2);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.min(1, Math.max(0.15, (p.z + radius) / (radius * 2)));

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1.2, p.size), 0, Math.PI * 2);

        if (p.isAnchor) {
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.9})`; // Emerald anchor node
          ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(30, 41, 59, ${alpha * 0.6})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Render Floating Ambient Particles
      for (let i = 0; i < ambientParticles.length; i++) {
        const ap = ambientParticles[i];
        ap.x += ap.vx;
        ap.y += ap.vy;
        ap.z += ap.vz;

        if (ap.x < -width / 2) ap.x = width / 2;
        if (ap.x > width / 2) ap.x = -width / 2;
        if (ap.y < -height / 2) ap.y = height / 2;
        if (ap.y > height / 2) ap.y = -height / 2;
        if (ap.z < -250) ap.z = 250;
        if (ap.z > 250) ap.z = -250;

        const x1 = ap.x * cosY + ap.z * sinY;
        const z1 = -ap.x * sinY + ap.z * cosY;
        const y2 = ap.y * cosX - z1 * sinX;
        const z2 = ap.y * sinX + z1 * cosX;

        const pz = z2 + focalLength;
        if (pz > 10) {
          const scale = focalLength / pz;
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;
          const alpha = Math.max(0.05, Math.min(0.3, (z2 + 250) / 500));

          ctx.beginPath();
          ctx.arc(px, py, ap.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 116, 139, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [is3DActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-65 z-0"
    />
  );
}
