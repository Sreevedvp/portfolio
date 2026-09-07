import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Orbit, Zap } from 'lucide-react';

interface ThreeEmeraldGemProps {
  className?: string;
}

/**
 * Creates a custom octagonal crystal geometry with crown, girdle, and pavilion.
 */
function createCrystalGeometry(): THREE.BufferGeometry {
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const numSides = 8;
  const rTable = 0.45;
  const rCrown = 0.85;
  const rGirdle = 1.0;
  const rPavilion = 0.4;

  const hTable = 0.65;
  const hCrown = 0.4;
  const hGirdleUpper = 0.1;
  const hGirdleLower = -0.1;
  const hPavilion = -0.7;
  const hCulet = -1.05;

  const rings: THREE.Vector3[][] = [];

  const tableRing: THREE.Vector3[] = [];
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2 + Math.PI / 8;
    tableRing.push(new THREE.Vector3(Math.cos(angle) * rTable, hTable, Math.sin(angle) * rTable));
  }
  rings.push(tableRing);

  const crownRing: THREE.Vector3[] = [];
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2;
    crownRing.push(new THREE.Vector3(Math.cos(angle) * rCrown, hCrown, Math.sin(angle) * rCrown));
  }
  rings.push(crownRing);

  const upperGirdleRing: THREE.Vector3[] = [];
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2 + Math.PI / 8;
    upperGirdleRing.push(new THREE.Vector3(Math.cos(angle) * rGirdle, hGirdleUpper, Math.sin(angle) * rGirdle));
  }
  rings.push(upperGirdleRing);

  const lowerGirdleRing: THREE.Vector3[] = [];
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2 + Math.PI / 8;
    lowerGirdleRing.push(new THREE.Vector3(Math.cos(angle) * rGirdle, hGirdleLower, Math.sin(angle) * rGirdle));
  }
  rings.push(lowerGirdleRing);

  const pavilionRing: THREE.Vector3[] = [];
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2;
    pavilionRing.push(new THREE.Vector3(Math.cos(angle) * rPavilion, hPavilion, Math.sin(angle) * rPavilion));
  }
  rings.push(pavilionRing);

  const culet = new THREE.Vector3(0, hCulet, 0);

  const addTriangle = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    const ab = new THREE.Vector3().subVectors(b, a);
    const ac = new THREE.Vector3().subVectors(c, a);
    const n = new THREE.Vector3().crossVectors(ab, ac).normalize();
    const idx = vertices.length / 3;
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    normals.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);
    indices.push(idx, idx + 1, idx + 2);
  };

  const addQuad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
    addTriangle(a, b, c);
    addTriangle(a, c, d);
  };

  // Table
  const tableCenter = new THREE.Vector3(0, hTable, 0);
  for (let i = 0; i < numSides; i++) {
    addTriangle(tableCenter, tableRing[i], tableRing[(i + 1) % numSides]);
  }

  // Crown
  for (let i = 0; i < numSides; i++) {
    const ni = (i + 1) % numSides;
    addTriangle(tableRing[i], tableRing[ni], crownRing[i]);
    addQuad(tableRing[ni], crownRing[ni], upperGirdleRing[i], crownRing[i]);
  }

  // Girdle
  for (let i = 0; i < numSides; i++) {
    const ni = (i + 1) % numSides;
    addQuad(upperGirdleRing[i], upperGirdleRing[ni], lowerGirdleRing[ni], lowerGirdleRing[i]);
  }

  // Upper pavilion
  for (let i = 0; i < numSides; i++) {
    addTriangle(lowerGirdleRing[i], lowerGirdleRing[(i + 1) % numSides], pavilionRing[i]);
  }

  // Lower pavilion to culet
  for (let i = 0; i < numSides; i++) {
    addTriangle(pavilionRing[i], pavilionRing[(i + 1) % numSides], culet);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates electric arc lightning lines between random facet points.
 */
function createElectricArcs(scene: THREE.Scene): THREE.Line[] {
  const arcs: THREE.Line[] = [];
  const arcCount = 6;

  for (let i = 0; i < arcCount; i++) {
    const points: THREE.Vector3[] = [];
    const segCount = 8;
    for (let j = 0; j <= segCount; j++) {
      points.push(new THREE.Vector3(0, 0, 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? 0xff1744 : 0xb388ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geometry, material);
    line.visible = false;
    scene.add(line);
    arcs.push(line);
  }

  return arcs;
}

/**
 * Floating energy spark particles around the crystal.
 */
function createSparkParticles(scene: THREE.Scene): THREE.Points {
  const count = 150;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorPalette = [
    new THREE.Color(0xff1744),
    new THREE.Color(0xb388ff),
    new THREE.Color(0xff2d7a),
    new THREE.Color(0x00e5ff),
    new THREE.Color(0x7c4dff),
  ];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.8 + Math.random() * 2.2;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = colorPalette[i % colorPalette.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    vertexColors: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

export const ThreeEmeraldGem: React.FC<ThreeEmeraldGemProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gemMeshRef = useRef<THREE.Mesh | null>(null);
  const arcsRef = useRef<THREE.Line[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelRef = useRef({ x: 0, y: 0.006 });
  const targetRotRef = useRef({ x: 0.3, y: 0 });

  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === LIGHTING — RED/PURPLE ENERGY ===
    const ambientLight = new THREE.AmbientLight(0xff8a80, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(-3, 5, 4);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xff1744, 1.0);
    rimLight.position.set(3, -2, -3);
    scene.add(rimLight);

    const pointLight1 = new THREE.PointLight(0xff1744, 2.5, 15);
    pointLight1.position.set(-2, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xb388ff, 2.0, 12);
    pointLight2.position.set(2, -1, 3);
    scene.add(pointLight2);

    const topLight = new THREE.PointLight(0xff2d7a, 1.5, 10);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    const bottomLight = new THREE.PointLight(0x7c4dff, 1.0, 8);
    bottomLight.position.set(0, -3, 2);
    scene.add(bottomLight);

    // === CRYSTAL MESH — RED/PURPLE ENERGY ===
    const gemGeometry = createCrystalGeometry();

    const gemMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcc1133,
      metalness: 0.15,
      roughness: 0.06,
      transmission: 0.8,
      thickness: 2.5,
      ior: 2.42,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.5,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
      attenuationColor: new THREE.Color(0x4a0030),
      attenuationDistance: 2.5,
      sheen: 0.5,
      sheenRoughness: 0.15,
      sheenColor: new THREE.Color(0xb388ff),
      emissive: new THREE.Color(0x330011),
      emissiveIntensity: 0.3,
    });

    const gemMesh = new THREE.Mesh(gemGeometry, gemMaterial);
    gemMesh.rotation.x = 0.3;
    scene.add(gemMesh);
    gemMeshRef.current = gemMesh;

    // Wireframe overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const wireframeMesh = new THREE.Mesh(gemGeometry.clone(), wireframeMat);
    wireframeMesh.scale.set(1.003, 1.003, 1.003);
    gemMesh.add(wireframeMesh);

    // === ORBITAL RINGS ===
    const ringGeom1 = new THREE.RingGeometry(2.0, 2.02, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ringGeom2 = new THREE.RingGeometry(1.6, 1.615, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xb388ff,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
    });
    const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    // === ELECTRIC ARCS ===
    const arcs = createElectricArcs(scene);
    arcsRef.current = arcs;

    // === SPARK PARTICLES ===
    const sparkParticles = createSparkParticles(scene);

    // === ANIMATION LOOP ===
    let time = 0;
    let arcTimer = 0;

    const animate = () => {
      time += 0.01;
      arcTimer += 0.01;

      // Rotation physics
      if (!isDraggingRef.current) {
        rotationVelRef.current.y *= 0.97;
        rotationVelRef.current.x *= 0.97;
        if (Math.abs(rotationVelRef.current.y) < 0.005) {
          rotationVelRef.current.y = 0.005;
        }
        targetRotRef.current.y += rotationVelRef.current.y;
        targetRotRef.current.x += rotationVelRef.current.x;
      }

      gemMesh.rotation.y += (targetRotRef.current.y - gemMesh.rotation.y) * 0.06;
      gemMesh.rotation.x += (targetRotRef.current.x - gemMesh.rotation.x) * 0.06;

      // Floating bob
      gemMesh.position.y = Math.sin(time * 1.5) * 0.12;

      // Rings
      ring1.rotation.z = time * 0.15;
      ring2.rotation.z = -time * 0.1;

      // Pulsing lights — electric energy feel
      pointLight1.intensity = 2.5 + Math.sin(time * 3) * 1.0;
      pointLight2.intensity = 2.0 + Math.cos(time * 2.5) * 0.8;
      topLight.intensity = 1.5 + Math.sin(time * 4) * 0.5;
      bottomLight.intensity = 1.0 + Math.cos(time * 3.5) * 0.4;

      // Emissive pulse
      (gemMesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity =
        0.3 + Math.sin(time * 2) * 0.15;

      // Electric arcs — randomly flash
      if (arcTimer > 0.08) {
        arcTimer = 0;
        arcs.forEach((arc, arcIdx) => {
          if (Math.random() > 0.7) {
            arc.visible = true;
            const posArr = arc.geometry.attributes.position.array as Float32Array;
            const startAngle = Math.random() * Math.PI * 2;
            const endAngle = startAngle + Math.PI * (0.5 + Math.random());
            const startR = 0.8 + Math.random() * 0.3;
            const endR = 0.8 + Math.random() * 0.3;
            const segments = posArr.length / 3;

            for (let j = 0; j < segments; j++) {
              const t = j / (segments - 1);
              const angle = startAngle + (endAngle - startAngle) * t;
              const r = startR + (endR - startR) * t;
              const jitter = (Math.random() - 0.5) * 0.15;

              posArr[j * 3] = Math.cos(angle) * r + jitter;
              posArr[j * 3 + 1] = (Math.random() - 0.5) * 1.2;
              posArr[j * 3 + 2] = Math.sin(angle) * r + jitter;
            }
            arc.geometry.attributes.position.needsUpdate = true;
            (arc.material as THREE.LineBasicMaterial).opacity = 0.5 + Math.random() * 0.5;

            // Auto-hide after flash
            setTimeout(() => { arc.visible = false; }, 80 + Math.random() * 120);
          }
        });
      }

      // Animate particles
      if (sparkParticles.geometry.attributes.position) {
        const positions = sparkParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 3; i++) {
          const idx = i * 3;
          const angle = time * 0.3 + i * 0.52;
          positions[idx] += Math.sin(angle) * 0.002;
          positions[idx + 1] += Math.cos(angle * 0.7) * 0.002;
          positions[idx + 2] += Math.sin(angle * 1.3) * 0.001;
        }
        sparkParticles.geometry.attributes.position.needsUpdate = true;
      }
      sparkParticles.rotation.y = time * 0.08;

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Entrance animation
    gsap.fromTo(gemMesh.scale, { x: 0, y: 0, z: 0 }, {
      x: 1, y: 1, z: 1,
      duration: 1.4,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.3,
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
      gemGeometry.dispose();
      gemMaterial.dispose();
      wireframeMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      rotationVelRef.current.y = dx * 0.01;
      rotationVelRef.current.x = -dy * 0.008;
      targetRotRef.current.y += dx * 0.01;
      targetRotRef.current.x -= dy * 0.008;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const relY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      targetRotRef.current.x = 0.3 - relY * 0.35;
      targetRotRef.current.y += relX * 0.006;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const trigger360Spin = useCallback(() => {
    rotationVelRef.current.y = 0.12;
  }, []);

  const handleGemClick = useCallback(() => {
    setClickCount(prev => prev + 1);
    trigger360Spin();

    // Electric flash
    if (sceneRef.current) {
      const flash = new THREE.PointLight(0xffffff, 8, 15);
      flash.position.set(0, 2, 3);
      sceneRef.current.add(flash);
      gsap.to(flash, {
        intensity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          sceneRef.current?.remove(flash);
          flash.dispose();
        },
      });
    }

    // Scale pulse
    if (gemMeshRef.current) {
      gsap.fromTo(gemMeshRef.current.scale,
        { x: 1.18, y: 1.18, z: 1.18 },
        { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
      );
    }

    // Confetti burst — Miles colors
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 45,
        spread: 90,
        origin: { x: originX, y: originY },
        colors: ['#ff1744', '#b388ff', '#ff2d7a', '#00e5ff', '#7c4dff', '#ff6eb4'],
        disableForReducedMotion: true,
        scalar: 0.9,
        ticks: 120,
        shapes: ['circle', 'square'],
      });
    }
  }, [trigger360Spin]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing group three-canvas-container ${className}`}
      style={{ minHeight: '340px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleGemClick}
    >
      {/* Ambient glow — red/purple energy */}
      <div
        className="absolute w-[260px] h-[260px] md:w-[360px] md:h-[360px] rounded-full pointer-events-none animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, var(--glow-primary) 0%, var(--glow-secondary) 40%, transparent 70%)',
        }}
      />

      {/* Micro-interaction controls */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2 glass px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); trigger360Spin(); }}
          className="flex items-center gap-1 text-[11px] font-medium hover:opacity-80 px-2 py-0.5 rounded transition-colors"
          style={{ color: 'var(--accent-primary)' }}
          title="Spin 360"
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>Spin 360°</span>
        </button>
        <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>•</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleGemClick(); }}
          className="flex items-center gap-1 text-[11px] font-medium hover:opacity-80 px-2 py-0.5 rounded transition-colors"
          style={{ color: 'var(--accent-secondary)' }}
          title="Electric Shock"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Shock {clickCount > 0 && `(${clickCount})`}</span>
        </button>
      </div>
    </div>
  );
};
