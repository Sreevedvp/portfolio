import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Wand2, Orbit } from 'lucide-react';

interface EmeraldGemProps {
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  indices: number[];
  baseColor: string;
  highlightColor: string;
  isTable?: boolean;
}

export const EmeraldGem: React.FC<EmeraldGemProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const [clickCount, setClickCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 3D Physics & Rotation State Refs
  const rotXRef = useRef<number>(0.2);
  const rotYRef = useRef<number>(0.4);
  const rotZRef = useRef<number>(0);
  const targetRotXRef = useRef<number>(0.2);
  const targetRotYRef = useRef<number>(0.4);
  
  const velXRef = useRef<number>(0);
  const velYRef = useRef<number>(0.008); // continuous auto rotation speed

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // Construct 3D Octagonal Emerald Gemstone Geometry
  // -------------------------------------------------------------
  const getGemGeometry = useCallback(() => {
    const vertices: Point3D[] = [];
    const rTable = 45;   // Top flat table radius
    const rCrown = 85;   // Crown shoulder radius
    const rGirdle = 100; // Middle girdle radius
    const rPavilion = 40; // Lower pavilion radius
    
    const hTable = 65;
    const hCrown = 40;
    const hGirdleUpper = 10;
    const hGirdleLower = -10;
    const hPavilion = -70;
    const hCulet = -105;  // Bottom tip point

    const numSides = 8; // 8-sided octagonal cut

    // Ring 0: Top Table Vertices (0 - 7)
    for (let i = 0; i < numSides; i++) {
      const angle = (i / numSides) * Math.PI * 2 + Math.PI / 8;
      vertices.push({
        x: Math.cos(angle) * rTable,
        y: Math.sin(angle) * rTable,
        z: hTable,
      });
    }

    // Ring 1: Crown Shoulder Vertices (8 - 15)
    for (let i = 0; i < numSides; i++) {
      const angle = (i / numSides) * Math.PI * 2;
      vertices.push({
        x: Math.cos(angle) * rCrown,
        y: Math.sin(angle) * rCrown,
        z: hCrown,
      });
    }

    // Ring 2: Upper Girdle Vertices (16 - 23)
    for (let i = 0; i < numSides; i++) {
      const angle = (i / numSides) * Math.PI * 2 + Math.PI / 8;
      vertices.push({
        x: Math.cos(angle) * rGirdle,
        y: Math.sin(angle) * rGirdle,
        z: hGirdleUpper,
      });
    }

    // Ring 3: Lower Girdle Vertices (24 - 31)
    for (let i = 0; i < numSides; i++) {
      const angle = (i / numSides) * Math.PI * 2 + Math.PI / 8;
      vertices.push({
        x: Math.cos(angle) * rGirdle,
        y: Math.sin(angle) * rGirdle,
        z: hGirdleLower,
      });
    }

    // Ring 4: Pavilion Vertices (32 - 39)
    for (let i = 0; i < numSides; i++) {
      const angle = (i / numSides) * Math.PI * 2;
      vertices.push({
        x: Math.cos(angle) * rPavilion,
        y: Math.sin(angle) * rPavilion,
        z: hPavilion,
      });
    }

    // Point 40: Culet (Bottom tip)
    vertices.push({ x: 0, y: 0, z: hCulet });

    // Define Polyhedral Facets (Polygons)
    const faces: Face3D[] = [];

    // 1. Top Table Facet (Octagon)
    faces.push({
      indices: [0, 1, 2, 3, 4, 5, 6, 7],
      baseColor: '#34d399',
      highlightColor: '#a7f3d0',
      isTable: true,
    });

    // 2. Crown Facets (Triangles & Quadrilaterals connecting Table to Girdle)
    for (let i = 0; i < numSides; i++) {
      const nextI = (i + 1) % numSides;
      
      // Upper Crown Triangles
      faces.push({
        indices: [i, nextI, i + 8],
        baseColor: '#10b981',
        highlightColor: '#6ee7b7',
      });

      // Lower Crown Quadrilaterals
      faces.push({
        indices: [nextI, (nextI + 8) % 16 + 8, i + 16, i + 8],
        baseColor: '#059669',
        highlightColor: '#34d399',
      });
    }

    // 3. Girdle Facets (Vertical facets along middle edge)
    for (let i = 0; i < numSides; i++) {
      const nextI = (i + 1) % numSides;
      faces.push({
        indices: [i + 16, nextI + 16, nextI + 24, i + 24],
        baseColor: '#047857',
        highlightColor: '#10b981',
      });
    }

    // 4. Upper Pavilion Facets (Connecting Girdle to Pavilion Ring)
    for (let i = 0; i < numSides; i++) {
      const nextI = (i + 1) % numSides;
      faces.push({
        indices: [i + 24, nextI + 24, i + 32],
        baseColor: '#065f46',
        highlightColor: '#059669',
      });
    }

    // 5. Lower Pavilion Facets (Connecting Pavilion Ring to Culet Tip)
    for (let i = 0; i < numSides; i++) {
      const nextI = (i + 1) % numSides;
      faces.push({
        indices: [i + 32, nextI + 32, 40],
        baseColor: '#022c22',
        highlightColor: '#047857',
      });
    }

    return { vertices, faces };
  }, []);

  // -------------------------------------------------------------
  // Real-Time 3D Rendering Canvas Engine
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { vertices, faces } = getGemGeometry();

    const setupScale = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(container.clientWidth || 360, 360);

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    setupScale();
    window.addEventListener('resize', setupScale);

    // Initial Entrance Timeline via GSAP
    if (containerRef.current) {
      gsap.fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 0.75, scale: 1, duration: 1.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        shadowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.35, scale: 1, duration: 1.4, ease: 'power3.out' }
      );
    }

    // Light Source Direction Vector (Top-Left-Front normalized)
    const lightDir = { x: -0.45, y: -0.55, z: 0.7 };
    const lightLen = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z);
    lightDir.x /= lightLen;
    lightDir.y /= lightLen;
    lightDir.z /= lightLen;

    let time = 0;

    const render3DGem = () => {
      time += 0.015;

      const size = Math.min(container.clientWidth || 360, 360);
      const centerX = size / 2;
      const centerY = size / 2;

      ctx.clearRect(0, 0, size, size);

      // Smooth Rotation Angle Interpolation (Lerp for silky smooth motion)
      if (!isDraggingRef.current) {
        // Continuous auto rotY + momentum decay
        velYRef.current *= 0.95;
        if (Math.abs(velYRef.current) < 0.006) {
          velYRef.current = 0.007; // Base gentle drift
        }
        velXRef.current *= 0.95;

        targetRotYRef.current += velYRef.current;
        targetRotXRef.current += velXRef.current;
      }

      // Lerp rotX & rotY towards target for zero jittering
      rotXRef.current += (targetRotXRef.current - rotXRef.current) * 0.08;
      rotYRef.current += (targetRotYRef.current - rotYRef.current) * 0.08;

      // Gentle floating Y bounce
      const floatY = Math.sin(time * 1.8) * 8;

      // Update Ground Shadow scale/opacity inversely
      if (shadowRef.current) {
        const shadowScale = 1 - Math.sin(time * 1.8) * 0.08;
        const shadowOpacity = 0.3 - Math.sin(time * 1.8) * 0.05;
        shadowRef.current.style.transform = `scale(${shadowScale})`;
        shadowRef.current.style.opacity = `${shadowOpacity}`;
      }

      const rx = rotXRef.current;
      const ry = rotYRef.current;
      const rz = rotZRef.current;

      // Rotation Matrix Coefficients
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosZ = Math.cos(rz), sinZ = Math.sin(rz);

      // 1. Transform Vertices
      const transformedVerts: Point3D[] = vertices.map(v => {
        // Yaw (Y)
        let x1 = v.x * cosY + v.z * sinY;
        let y1 = v.y;
        let z1 = -v.x * sinY + v.z * cosY;

        // Pitch (X)
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Roll (Z)
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        return { x: x3, y: y3 + floatY, z: z3 };
      });

      // 2. Process & Depth-Sort Facets (Painter's Algorithm)
      const processedFaces = faces.map(face => {
        const polyVerts = face.indices.map(idx => transformedVerts[idx]);

        // Calculate average Z for depth sorting
        const avgZ = polyVerts.reduce((acc, v) => acc + v.z, 0) / polyVerts.length;

        // Calculate Normal Vector via Cross Product (v1 - v0) x (v2 - v0)
        const v0 = polyVerts[0];
        const v1 = polyVerts[1];
        const v2 = polyVerts[2];

        const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
        const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;

        let nx = ay * bz - az * by;
        let ny = az * bx - ax * bz;
        let nz = ax * by - ay * bx;

        const normLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= normLen;
        ny /= normLen;
        nz /= normLen;

        // Diffuse Shading Intensity (dot product with light vector)
        const dotLight = Math.max(0.12, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);

        // Specular Highlight (blended reflection)
        const rx = 2 * dotLight * nx - lightDir.x;
        const ry = 2 * dotLight * ny - lightDir.y;
        const rz = 2 * dotLight * nz - lightDir.z;
        const spec = Math.pow(Math.max(0, rz), 16);

        return {
          face,
          polyVerts,
          avgZ,
          nz,
          dotLight,
          spec,
        };
      });

      // Sort faces back-to-front
      processedFaces.sort((a, b) => a.avgZ - b.avgZ);

      // Perspective Projection Factor
      const fov = 380;

      // 3. Draw Facets
      processedFaces.forEach(({ face, polyVerts, nz, dotLight, spec }) => {
        // Backface Culling (only draw faces angled towards camera)
        if (nz < -0.15) return;

        ctx.beginPath();
        polyVerts.forEach((v, i) => {
          const scale = fov / (fov - v.z);
          const px = centerX + v.x * scale;
          const py = centerY + v.y * scale;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        // Facet Shading & Dynamic Color Blending
        const baseHue = 158; // Emerald Green
        const lightness = Math.min(85, Math.max(12, Math.round(18 + dotLight * 48 + spec * 35)));
        const saturation = Math.round(75 + dotLight * 20);

        ctx.fillStyle = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
        ctx.fill();

        // Inner Facet Refraction Wireframe / Highlight Stroke
        ctx.lineWidth = face.isTable ? 1.8 : 1.0;
        const strokeAlpha = Math.min(0.7, 0.2 + spec * 0.5 + dotLight * 0.3);
        ctx.strokeStyle = `rgba(209, 250, 229, ${strokeAlpha})`;
        ctx.stroke();

        // Specular Reflection Glint Flare on front-facing facets
        if (spec > 0.4) {
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.85, spec * 0.9)})`;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameRef.current = requestAnimationFrame(render3DGem);
    };

    animationFrameRef.current = requestAnimationFrame(render3DGem);

    return () => {
      window.removeEventListener('resize', setupScale);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [getGemGeometry]);

  // -------------------------------------------------------------
  // Mouse & Touch Dragging Handlers for Real 3D Orbiting
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isDraggingRef.current) {
      const dx = clientX - lastMousePosRef.current.x;
      const dy = clientY - lastMousePosRef.current.y;

      velYRef.current = dx * 0.012;
      velXRef.current = -dy * 0.012;

      targetRotYRef.current += dx * 0.012;
      targetRotXRef.current -= dy * 0.012;

      lastMousePosRef.current = { x: clientX, y: clientY };
    } else if (containerRef.current) {
      // Mouse Parallax Tilt when hovering over container
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const relY = (clientY - rect.top - rect.height / 2) / (rect.height / 2);

      targetRotXRef.current = 0.2 - relY * 0.45;
      targetRotYRef.current += relX * 0.008;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Micro Interactions
  const trigger360Orbit = () => {
    velYRef.current = 0.12; // Boost angular velocity for a smooth 360 spin
  };

  const handleGemClick = (e: React.MouseEvent) => {
    setClickCount(prev => prev + 1);
    trigger360Orbit();

    if (glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { scale: 1.4, opacity: 1 },
        { scale: 1, opacity: 0.75, duration: 1.2, ease: 'power2.out' }
      );
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 28,
        spread: 70,
        origin: { x: originX, y: originY },
        colors: ['#86efac', '#166534', '#a6f4b5', '#004c22', '#eef5ee'],
        disableForReducedMotion: true,
        scalar: 0.85,
        ticks: 110,
        shapes: ['circle', 'square'],
      });
    }
  };

  return (
    <div
      ref={containerRef}
      id="emerald-gem-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
      }}
      onMouseMove={handlePointerMove}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing group ${className}`}
    >
      {/* Background Soft Emerald Caustics & Glow */}
      <div
        ref={glowRef}
        id="emerald-ambient-glow"
        className="absolute w-[260px] h-[260px] md:w-[360px] md:h-[360px] rounded-full bg-radial from-[#86efac]/40 via-[#166534]/15 to-transparent blur-3xl pointer-events-none transform transition-all duration-700"
      />

      {/* Decorative Emerald Geometry Rings */}
      <div
        className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-[#004c22]/10 border-dashed pointer-events-none opacity-40 animate-spin"
        style={{ animationDuration: '65s' }}
      />
      <div
        className="absolute w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full border border-[#86efac]/20 pointer-events-none opacity-30 animate-spin"
        style={{ animationDuration: '48s', animationDirection: 'reverse' }}
      />

      {/* Real 3D Polyhedral Gemstone Canvas */}
      <div
        onClick={handleGemClick}
        className="relative z-10 p-2 flex items-center justify-center"
        title="Click or drag to rotate 3D Emerald Gemstone"
      >
        <canvas
          ref={canvasRef}
          className="w-[260px] h-[260px] md:w-[360px] md:h-[360px] drop-shadow-[0_22px_32px_rgba(0,76,34,0.32)] transition-transform duration-300"
        />

        {/* Floating Sparkle Refraction Indicator */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#004c22]/15 shadow-xs flex items-center gap-1.5 pointer-events-none z-20">
          <Sparkles className="w-3.5 h-3.5 text-[#004c22] animate-pulse" />
        </div>
      </div>

      {/* Dynamic Ground Ambient Drop Shadow */}
      <div
        ref={shadowRef}
        id="emerald-ground-shadow"
        className="absolute bottom-4 md:bottom-2 w-[160px] md:w-[240px] h-[26px] rounded-[100%] bg-[#064e3b]/35 blur-md pointer-events-none transition-all duration-300"
      />

      {/* Micro-interaction control bar underneath on hover/focus */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#004c22]/10 shadow-xs opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); trigger360Orbit(); }}
          className="flex items-center gap-1 text-[11px] font-medium text-[#004c22] hover:text-[#166534] px-2 py-0.5 rounded hover:bg-[#eef5ee] transition-colors"
          title="Spin 360"
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>Spin 360°</span>
        </button>
        <span className="text-[#004c22]/20">•</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleGemClick(e); }}
          className="flex items-center gap-1 text-[11px] font-medium text-[#004c22] hover:text-[#166534] px-2 py-0.5 rounded hover:bg-[#eef5ee] transition-colors"
          title="Sparkle Refraction"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Sparkle {clickCount > 0 && `(${clickCount})`}</span>
        </button>
      </div>
    </div>
  );
};
