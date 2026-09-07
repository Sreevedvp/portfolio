import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const particleCount = 180;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const origPositions = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xff1744),
      new THREE.Color(0xb388ff),
      new THREE.Color(0xff2d7a),
      new THREE.Color(0x7c4dff),
      new THREE.Color(0x00e5ff),
    ];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 8;
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      origPositions[i * 3] = x; origPositions[i * 3 + 1] = y; origPositions[i * 3 + 2] = z;
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.025,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
    });

    scene.add(new THREE.Points(pGeo, pMat));

    // Connection lines
    const maxConn = particleCount * 3;
    const linePositions = new Float32Array(maxConn * 6);
    const lineColors = new Float32Array(maxConn * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    const mouse = { x: 0, y: 0 };
    let scrollY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    let t = 0;
    const animate = () => {
      t += 0.005;
      const posArr = pGeo.attributes.position.array as Float32Array;
      const scrollOff = scrollY * 0.0003;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posArr[idx] += velocities[idx];
        posArr[idx + 1] += velocities[idx + 1];
        posArr[idx + 2] += velocities[idx + 2];

        const dx = posArr[idx] - mouse.x * 4;
        const dy = posArr[idx + 1] - mouse.y * 3;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          const force = (3 - dist) * 0.0006;
          posArr[idx] += dx * force;
          posArr[idx + 1] += dy * force;
        }

        posArr[idx + 2] = origPositions[idx + 2] - scrollOff * (i % 3 + 1);
        if (posArr[idx] > 8) posArr[idx] = -8;
        if (posArr[idx] < -8) posArr[idx] = 8;
        if (posArr[idx + 1] > 5) posArr[idx + 1] = -5;
        if (posArr[idx + 1] < -5) posArr[idx + 1] = 5;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Lines
      let lineIdx = 0;
      const connDist = 2.0;
      for (let i = 0; i < particleCount && lineIdx < maxConn; i++) {
        for (let j = i + 1; j < particleCount && lineIdx < maxConn; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < connDist) {
            const alpha = (1 - d / connDist) * 0.5;
            const lIdx = lineIdx * 6;
            linePositions[lIdx] = posArr[i * 3]; linePositions[lIdx + 1] = posArr[i * 3 + 1]; linePositions[lIdx + 2] = posArr[i * 3 + 2];
            linePositions[lIdx + 3] = posArr[j * 3]; linePositions[lIdx + 4] = posArr[j * 3 + 1]; linePositions[lIdx + 5] = posArr[j * 3 + 2];
            // Red-purple gradient lines
            lineColors[lIdx] = 1 * alpha; lineColors[lIdx + 1] = 0.09 * alpha; lineColors[lIdx + 2] = 0.27 * alpha;
            lineColors[lIdx + 3] = 0.7 * alpha; lineColors[lIdx + 4] = 0.53 * alpha; lineColors[lIdx + 5] = 1 * alpha;
            lineIdx++;
          }
        }
      }
      for (let i = lineIdx; i < maxConn; i++) {
        const lIdx = i * 6;
        for (let k = 0; k < 6; k++) { linePositions[lIdx + k] = 0; lineColors[lIdx + k] = 0; }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 0.2 - camera.position.y) * 0.02;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose(); pGeo.dispose(); pMat.dispose(); lineGeo.dispose(); lineMat.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.5 }} aria-hidden="true" />;
};
