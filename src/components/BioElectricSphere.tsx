import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface BioElectricSphereProps {
  className?: string;
}

/**
 * Miles Morales Bio-Electric Sphere
 * A wireframe icosahedron with electric arcs crawling across its surface,
 * pulsing with red/purple energy, orbited by spark particles.
 */
export const BioElectricSphere: React.FC<BioElectricSphereProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const rotVelRef = useRef({ x: 0, y: 0.004 });
  const targetRotRef = useRef({ x: 0.2, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 4);

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setWebglFailed(true); return; }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === CORE SPHERE (inner solid) ===
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a0011,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xff1744,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // === OUTER WIREFRAME SPHERE ===
    const wireGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // === SECOND WIREFRAME (purple, counter-rotating) ===
    const wireGeo2 = new THREE.IcosahedronGeometry(1.05, 1);
    const wireMat2 = new THREE.MeshBasicMaterial({
      color: 0xb388ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh2 = new THREE.Mesh(wireGeo2, wireMat2);
    scene.add(wireMesh2);

    // === ELECTRIC ARCS ===
    const arcCount = 10;
    const arcs: THREE.Line[] = [];
    for (let i = 0; i < arcCount; i++) {
      const pts = Array.from({ length: 12 }, () => new THREE.Vector3());
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: i % 3 === 0 ? 0x00e5ff : i % 3 === 1 ? 0xff1744 : 0xb388ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        linewidth: 1,
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      arcs.push(line);
    }

    // === ORBITING PARTICLES ===
    const pCount = 200;
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const pSpeeds = new Float32Array(pCount);
    const pOrbits = new Float32Array(pCount * 2); // theta, phi

    const palette = [
      new THREE.Color(0xff1744),
      new THREE.Color(0xb388ff),
      new THREE.Color(0xff2d7a),
      new THREE.Color(0x00e5ff),
      new THREE.Color(0x7c4dff),
    ];

    for (let i = 0; i < pCount; i++) {
      pOrbits[i * 2] = Math.random() * Math.PI * 2;
      pOrbits[i * 2 + 1] = Math.acos(2 * Math.random() - 1);
      pSpeeds[i] = 0.002 + Math.random() * 0.008;
      const r = 1.5 + Math.random() * 1.5;
      const theta = pOrbits[i * 2];
      const phi = pOrbits[i * 2 + 1];
      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[i % palette.length];
      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      vertexColors: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // === LIGHTS ===
    scene.add(new THREE.AmbientLight(0x331122, 0.5));

    const redLight = new THREE.PointLight(0xff1744, 3, 12);
    redLight.position.set(-2, 2, 3);
    scene.add(redLight);

    const purpleLight = new THREE.PointLight(0xb388ff, 2, 10);
    purpleLight.position.set(2, -1, 2);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 1.5, 8);
    cyanLight.position.set(0, 3, -2);
    scene.add(cyanLight);

    const pinkLight = new THREE.PointLight(0xff2d7a, 1.5, 8);
    pinkLight.position.set(-1, -2, 3);
    scene.add(pinkLight);

    // === ANIMATION ===
    let t = 0;

    const animate = () => {
      if (document.hidden || !visible) { animationIdRef.current = requestAnimationFrame(animate); return; }
      t += 0.008;

      // Rotation
      if (!isDraggingRef.current) {
        rotVelRef.current.y *= 0.98;
        rotVelRef.current.x *= 0.98;
        if (Math.abs(rotVelRef.current.y) < 0.003) rotVelRef.current.y = 0.003;
        targetRotRef.current.y += rotVelRef.current.y;
        targetRotRef.current.x += rotVelRef.current.x;
      }

      coreMesh.rotation.y += (targetRotRef.current.y - coreMesh.rotation.y) * 0.05;
      coreMesh.rotation.x += (targetRotRef.current.x - coreMesh.rotation.x) * 0.05;

      wireMesh.rotation.y = coreMesh.rotation.y * 0.8 + t * 0.1;
      wireMesh.rotation.x = coreMesh.rotation.x * 0.6;
      wireMesh.rotation.z = t * 0.05;

      wireMesh2.rotation.y = -coreMesh.rotation.y * 0.5 + t * 0.07;
      wireMesh2.rotation.x = -coreMesh.rotation.x * 0.4;
      wireMesh2.rotation.z = -t * 0.03;

      // Core floating
      coreMesh.position.y = Math.sin(t * 1.2) * 0.08;

      // Core pulse
      coreMat.emissiveIntensity = 0.4 + Math.sin(t * 2.5) * 0.2;
      const scale = 1 + Math.sin(t * 3) * 0.02;
      coreMesh.scale.setScalar(scale);

      // Light flicker
      redLight.intensity = 3 + Math.sin(t * 4) * 1.2;
      purpleLight.intensity = 2 + Math.cos(t * 3.5) * 0.8;
      cyanLight.intensity = 1.5 + Math.sin(t * 5) * 0.5;
      pinkLight.intensity = 1.5 + Math.cos(t * 4.5) * 0.6;

      // Wireframe opacity breathing
      wireMat.opacity = 0.2 + Math.sin(t * 2) * 0.08;
      wireMat2.opacity = 0.1 + Math.cos(t * 1.8) * 0.05;

      // Electric arcs — random firing
      arcs.forEach((arc, idx) => {
        const mat = arc.material as THREE.LineBasicMaterial;
        if (mat.opacity > 0) {
          mat.opacity -= 0.03;
          if (mat.opacity < 0) mat.opacity = 0;
        }

        if (Math.random() > 0.96) {
          mat.opacity = 0.6 + Math.random() * 0.4;
          const posArr = arc.geometry.attributes.position.array as Float32Array;
          const segs = posArr.length / 3;

          // Start and end on sphere surface
          const startTheta = Math.random() * Math.PI * 2;
          const startPhi = Math.acos(2 * Math.random() - 1);
          const endTheta = startTheta + (Math.random() - 0.5) * Math.PI;
          const endPhi = startPhi + (Math.random() - 0.5) * 0.8;
          const r = 1.15;

          for (let j = 0; j < segs; j++) {
            const frac = j / (segs - 1);
            const theta = startTheta + (endTheta - startTheta) * frac;
            const phi = startPhi + (endPhi - startPhi) * frac;
            const jitter = (Math.random() - 0.5) * 0.12;
            posArr[j * 3] = r * Math.sin(phi) * Math.cos(theta) + jitter;
            posArr[j * 3 + 1] = r * Math.cos(phi) + jitter;
            posArr[j * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) + jitter;
          }
          arc.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Orbiting particles
      const pPos = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        pOrbits[i * 2] += pSpeeds[i];
        const r = 1.5 + Math.sin(t + i) * 0.3;
        const theta = pOrbits[i * 2];
        const phi = pOrbits[i * 2 + 1];
        pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = r * Math.cos(phi);
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.04;

      // Mouse parallax on camera
      camera.position.x += (mouseRef.current.x * 0.3 - camera.position.x) * 0.02;
      camera.position.y += (mouseRef.current.y * 0.2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!reducedMotion) animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Entrance
    if (!reducedMotion) gsap.fromTo([coreMesh.scale, wireMesh.scale, wireMesh2.scale],
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 1.6, ease: 'elastic.out(1, 0.5)', delay: 0.3, stagger: 0.1 }
    );

    const handleResize = () => {
      const nw = container.clientWidth || 400;
      const nh = container.clientHeight || 400;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      gsap.killTweensOf([coreMesh.scale, wireMesh.scale, wireMesh2.scale]);
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      coreGeo.dispose(); coreMat.dispose();
      wireGeo.dispose(); wireMat.dispose();
      wireGeo2.dispose(); wireMat2.dispose();
      pGeo.dispose(); pMat.dispose();
      arcs.forEach(a => { a.geometry.dispose(); (a.material as THREE.Material).dispose(); });
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      rotVelRef.current.y = dx * 0.008;
      rotVelRef.current.x = -dy * 0.006;
      targetRotRef.current.y += dx * 0.008;
      targetRotRef.current.x -= dy * 0.006;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePointerUp = useCallback(() => { isDraggingRef.current = false; }, []);

  const handleClick = useCallback(() => {
    rotVelRef.current.y = 0.15;
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing three-canvas-container ${className}`}
      style={{ minHeight: '320px', touchAction: 'pan-y' }}
      aria-label="Interactive rotating WebGL sphere"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
    >
      {webglFailed && <span className="text-sm text-[var(--text-muted)]">WebGL preview unavailable on this device.</span>}
      <span className="absolute bottom-6 text-xs font-mono text-[var(--text-muted)] pointer-events-none">DRAG TO ROTATE · CLICK TO SPIN</span>
      <div
        className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, var(--glow-primary) 0%, var(--glow-secondary) 35%, transparent 65%)',
        }}
      />
    </div>
  );
};
