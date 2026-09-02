import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Activity,
  Plus,
  Zap,
  Sliders,
  Layers,
  X,
  MousePointer,
  Network,
  RotateCcw,
  Server
} from 'lucide-react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  cluster: number;
  clusterName: string;
  activity: number;
  throughput: number; // in MB/s
  latency: number; // in ms
  status: 'optimal' | 'busy' | 'idle';
  pinned?: boolean;
}

interface Edge {
  source: number;
  target: number;
  strength: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const CLUSTERS = [
  { name: 'Ingestion Core', color: '#004c22', highlight: '#4ade80' },
  { name: 'Kafka Ring', color: '#006d3e', highlight: '#86efac' },
  { name: 'Tokio Async', color: '#166534', highlight: '#34d399' },
  { name: 'Web Worker', color: '#047857', highlight: '#6ee7b7' },
  { name: 'Canvas Core', color: '#065f46', highlight: '#a7f3d0' },
  { name: 'K8s Cluster', color: '#14532d', highlight: '#bbf7d0' },
];

export const InteractiveD3Showcase: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Control States
  const [isRunning, setIsRunning] = useState(true);
  const [nodeCount, setNodeCount] = useState(36);
  const [fps, setFps] = useState(60);
  const [simSpeed, setSimSpeed] = useState(1);
  const [mode, setMode] = useState<'topology' | 'mesh' | 'cluster'>('topology');
  const [activeClusterFilter, setActiveClusterFilter] = useState<number | null>(null);
  
  // Interactive States
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [telemetryPulsesCount, setTelemetryPulsesCount] = useState(0);

  // Animation & Physics Refs
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const draggedNodeRef = useRef<Node | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Topology Physics Data
  const initSimulation = useCallback((count: number) => {
    const width = canvasContainerRef.current?.clientWidth || 800;
    const height = 400;

    const newNodes: Node[] = [];
    for (let i = 0; i < count; i++) {
      const clusterIdx = i % CLUSTERS.length;
      const isHub = i < CLUSTERS.length;

      newNodes.push({
        id: i,
        x: Math.random() * (width - 120) + 60,
        y: Math.random() * (height - 120) + 60,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        radius: isHub ? 12 : 6.5 + Math.random() * 3.5,
        label: isHub ? CLUSTERS[i].name : `Node-${i.toString().padStart(2, '0')}`,
        cluster: clusterIdx,
        clusterName: CLUSTERS[clusterIdx].name,
        activity: 0.3 + Math.random() * 0.7,
        throughput: Math.round(120 + Math.random() * 850),
        latency: Math.round(1.2 + Math.random() * 8.5),
        status: Math.random() > 0.3 ? 'optimal' : Math.random() > 0.5 ? 'busy' : 'idle',
      });
    }

    const newEdges: Edge[] = [];
    for (let i = 0; i < newNodes.length; i++) {
      // Connect hub nodes to each other
      if (i < CLUSTERS.length) {
        const nextHub = (i + 1) % CLUSTERS.length;
        newEdges.push({ source: i, target: nextHub, strength: 0.8 });
      }

      // Connect regular nodes to their cluster hub and random peers
      const connections = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < connections; c++) {
        const clusterHub = newNodes[i].cluster;
        const randomTarget = (i + 1 + Math.floor(Math.random() * (newNodes.length - 1))) % newNodes.length;
        const target = Math.random() > 0.4 ? clusterHub : randomTarget;
        
        if (target !== i && !newEdges.some(e => (e.source === i && e.target === target) || (e.source === target && e.target === i))) {
          newEdges.push({ source: i, target, strength: 0.3 + Math.random() * 0.6 });
        }
      }
    }

    nodesRef.current = newNodes;
    edgesRef.current = newEdges;
    setTelemetryPulsesCount(newEdges.length);
  }, []);

  useEffect(() => {
    initSimulation(nodeCount);
  }, [nodeCount, initSimulation]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = window.innerWidth < 640 ? 320 : 420;

    const setupCanvasScale = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = window.innerWidth < 640 ? 320 : 420;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    setupCanvasScale();

    const resizeObserver = new ResizeObserver(() => {
      setupCanvasScale();
    });
    resizeObserver.observe(container);

    const render = (time: number) => {
      // FPS counter update
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (time - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const shockwaves = shockwavesRef.current;

      // -------------------------------------------------------------
      // 1. Physics Calculations (Force, Mesh, or Cluster layout)
      // -------------------------------------------------------------
      if (isRunning) {
        const speed = simSpeed;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (node.pinned) continue; // Pinned node being dragged by user

          // Base velocity damping
          node.vx *= 0.94;
          node.vy *= 0.94;

          if (mode === 'topology') {
            // N-body Repulsion Force between nodes
            for (let j = i + 1; j < nodes.length; j++) {
              const other = nodes[j];
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const distSq = dx * dx + dy * dy || 1;
              const dist = Math.sqrt(distSq);

              if (dist < 130) {
                const force = (130 - dist) / 130;
                const fx = (dx / dist) * force * 0.35 * speed;
                const fy = (dy / dist) * force * 0.35 * speed;

                node.vx -= fx;
                node.vy -= fy;
                if (!other.pinned) {
                  other.vx += fx;
                  other.vy += fy;
                }
              }
            }

            // Central Soft Gravity Force
            const gdx = centerX - node.x;
            const gdy = centerY - node.y;
            node.vx += gdx * 0.0003 * speed;
            node.vy += gdy * 0.0003 * speed;

          } else if (mode === 'mesh') {
            // Orbital Ring layout physics
            const clusterIdx = node.cluster;
            const radius = 90 + clusterIdx * 24;
            const angleSpeed = (0.005 + (clusterIdx % 3) * 0.003) * speed;
            const currentAngle = Math.atan2(node.y - centerY, node.x - centerX) + angleSpeed;

            const targetX = centerX + Math.cos(currentAngle) * radius;
            const targetY = centerY + Math.sin(currentAngle) * radius;

            node.vx += (targetX - node.x) * 0.06 * speed;
            node.vy += (targetY - node.y) * 0.06 * speed;

          } else if (mode === 'cluster') {
            // Constellation Cluster Layout around Hub nodes
            const hubX = centerX + Math.cos((node.cluster / CLUSTERS.length) * Math.PI * 2) * (width * 0.28);
            const hubY = centerY + Math.sin((node.cluster / CLUSTERS.length) * Math.PI * 2) * (height * 0.25);

            node.vx += (hubX - node.x) * 0.04 * speed;
            node.vy += (hubY - node.y) * 0.04 * speed;
          }

          // Edge Spring Attraction forces
          for (let e = 0; e < edges.length; e++) {
            const edge = edges[e];
            if (edge.source === i || edge.target === i) {
              const otherIdx = edge.source === i ? edge.target : edge.source;
              const other = nodes[otherIdx];
              if (!other) continue;

              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const targetDist = mode === 'topology' ? 90 : 70;
              const springForce = (dist - targetDist) * 0.005 * edge.strength * speed;

              node.vx += (dx / dist) * springForce;
              node.vy += (dy / dist) * springForce;
            }
          }

          // Apply position change
          node.x += node.vx * speed;
          node.y += node.vy * speed;

          // Boundary bouncing with dampening
          const padding = node.radius + 6;
          if (node.x < padding) {
            node.x = padding;
            node.vx *= -0.7;
          } else if (node.x > width - padding) {
            node.x = width - padding;
            node.vx *= -0.7;
          }

          if (node.y < padding) {
            node.y = padding;
            node.vy *= -0.7;
          } else if (node.y > height - padding) {
            node.y = height - padding;
            node.vy *= -0.7;
          }

          // Pulsing activity dynamic simulation
          node.activity += (Math.random() - 0.49) * 0.04;
          if (node.activity > 1) node.activity = 1;
          if (node.activity < 0.25) node.activity = 0.25;
        }
      }

      // -------------------------------------------------------------
      // 2. Render Shockwaves / Canvas Ripples
      // -------------------------------------------------------------
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const wave = shockwaves[i];
        wave.radius += 2.5;
        wave.alpha -= 0.025;

        if (wave.alpha <= 0 || wave.radius >= wave.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color.replace(')', `, ${wave.alpha})`).replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Determine active focus selections
      const focusedNode = hoveredNode || selectedNode;
      const connectedNodeIds = new Set<number>();
      if (focusedNode) {
        connectedNodeIds.add(focusedNode.id);
        edges.forEach(e => {
          if (e.source === focusedNode.id) connectedNodeIds.add(e.target);
          if (e.target === focusedNode.id) connectedNodeIds.add(e.source);
        });
      }

      // -------------------------------------------------------------
      // 3. Render Edges (Links) & Telemetry Particles
      // -------------------------------------------------------------
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const s = nodes[edge.source];
        const t = nodes[edge.target];
        if (!s || !t) continue;

        const isFiltered = activeClusterFilter !== null &&
          (s.cluster !== activeClusterFilter && t.cluster !== activeClusterFilter);

        const isConnected = focusedNode ? (s.id === focusedNode.id || t.id === focusedNode.id) : true;
        const opacity = isFiltered ? 0.04 : (focusedNode ? (isConnected ? 0.75 : 0.07) : 0.22);

        const dx = t.x - s.x;
        const dy = t.y - s.y;

        // Gradient line for links
        const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
        const sColor = CLUSTERS[s.cluster % CLUSTERS.length].color;
        const tColor = CLUSTERS[t.cluster % CLUSTERS.length].color;
        grad.addColorStop(0, sColor);
        grad.addColorStop(1, tColor);

        ctx.lineWidth = isConnected && focusedNode ? 2.2 : 1.2;
        ctx.strokeStyle = opacity > 0.1 ? grad : `rgba(0, 76, 34, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();

        // Traveling telemetry data packet pulses along links
        if (!isFiltered && isRunning && (i % 2 === 0 || isConnected)) {
          const speedMultiplier = (0.0006 + (edge.strength * 0.0004)) * simSpeed;
          const progress = ((time * speedMultiplier) + (i * 0.18)) % 1;
          const px = s.x + dx * progress;
          const py = s.y + dy * progress;

          const packetColor = CLUSTERS[s.cluster % CLUSTERS.length].highlight;

          ctx.shadowColor = packetColor;
          ctx.shadowBlur = 6;
          ctx.fillStyle = packetColor;
          ctx.beginPath();
          ctx.arc(px, py, isConnected && focusedNode ? 3.2 : 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // -------------------------------------------------------------
      // 4. Render Nodes
      // -------------------------------------------------------------
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const clusterMeta = CLUSTERS[node.cluster % CLUSTERS.length];
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const isFocused = isHovered || isSelected;
        const isConnectedPeer = focusedNode && connectedNodeIds.has(node.id);
        const isClusterFiltered = activeClusterFilter !== null && node.cluster !== activeClusterFilter;

        const baseAlpha = isClusterFiltered ? 0.2 : (focusedNode ? (isConnectedPeer ? 1 : 0.25) : 1);

        // Outer Aura Ring & Ping animation
        if (isFocused || node.radius > 10) {
          const pulseRadius = node.radius + 6 + Math.sin(time * 0.005 + node.id) * 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = isFocused ? 'rgba(74, 222, 128, 0.25)' : 'rgba(0, 76, 34, 0.06)';
          ctx.fill();
        }

        // Main Node Circle
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isFocused ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? clusterMeta.highlight : clusterMeta.color;
        ctx.fill();

        // Node border stroke
        ctx.strokeStyle = isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = isFocused ? 2.5 : 1.5;
        ctx.stroke();
        ctx.restore();

        // Node Label (for Hubs, selected, or hovered nodes)
        if (node.radius > 9 || isFocused || (width > 600 && i % 4 === 0 && !isClusterFiltered)) {
          ctx.save();
          ctx.globalAlpha = baseAlpha;
          ctx.fillStyle = isFocused ? '#004c22' : '#161d19';
          ctx.font = `${isFocused ? '600' : '500'} ${isFocused ? '12px' : '10px'} Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.radius + 14);
          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, simSpeed, mode, activeClusterFilter, hoveredNode, selectedNode]);

  // -------------------------------------------------------------
  // Pointer / Touch Coordinates Calculation
  // -------------------------------------------------------------
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Find node under mouse/touch cursor
  const findNodeAtCoords = (x: number, y: number): Node | null => {
    for (const node of nodesRef.current) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 8) {
        return node;
      }
    }
    return null;
  };

  // Interactive Mouse / Touch Handlers
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const node = findNodeAtCoords(coords.x, coords.y);

    if (node) {
      draggedNodeRef.current = node;
      node.pinned = true;
      dragOffsetRef.current = { x: coords.x - node.x, y: coords.y - node.y };
      setSelectedNode(node);
      setShowInspector(true);
    } else {
      // Click shockwave ripple on background
      shockwavesRef.current.push({
        x: coords.x,
        y: coords.y,
        radius: 4,
        maxRadius: 75,
        alpha: 0.8,
        color: 'rgb(74, 222, 128)',
      });
      setSelectedNode(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = coords.x - dragOffsetRef.current.x;
      draggedNodeRef.current.y = coords.y - dragOffsetRef.current.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else {
      const hovered = findNodeAtCoords(coords.x, coords.y);
      setHoveredNode(hovered);
    }
  };

  const handlePointerUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.pinned = false;
      draggedNodeRef.current = null;
    }
  };

  // Control Actions
  const handleAddNodes = () => {
    if (nodesRef.current.length >= 75) return;
    setNodeCount(prev => prev + 6);
  };

  const handleScatter = () => {
    initSimulation(nodeCount);
  };

  const triggerPulseSurge = () => {
    if (!selectedNode) return;
    shockwavesRef.current.push({
      x: selectedNode.x,
      y: selectedNode.y,
      radius: selectedNode.radius,
      maxRadius: 120,
      alpha: 1.0,
      color: CLUSTERS[selectedNode.cluster % CLUSTERS.length].highlight,
    });
    // Boost connected node activities
    nodesRef.current.forEach(n => {
      if (n.cluster === selectedNode.cluster) {
        n.activity = 1.0;
        n.vx += (Math.random() - 0.5) * 5;
        n.vy += (Math.random() - 0.5) * 5;
      }
    });
  };

  return (
    <section id="visualizer" className="scroll-mt-24 space-y-6">
      {/* Section Header */}
      <div className="border-b border-[#004c22]/15 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
              Real-Time Telemetry Engine
            </h2>
            <span className="bg-[#004c22]/10 text-[#004c22] text-xs font-mono px-2 py-0.5 rounded-full font-medium">
              v2.4 Live
            </span>
          </div>
          <p className="text-sm text-[#404940] mt-1">
            Real-time topology force-graph canvas with drag-and-drop physics, node telemetry, and mesh controls.
          </p>
        </div>

        {/* Live Telemetry Badge */}
        <div className="flex items-center gap-3 bg-[#eef5ee] px-3.5 py-1.5 rounded-full border border-[#004c22]/10 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 -ml-4" />
            <span className="text-xs font-mono font-medium text-[#004c22]">
              {fps} FPS
            </span>
          </div>
          <span className="text-[#004c22]/20">|</span>
          <span className="text-xs font-mono text-[#404940]">
            {nodesRef.current.length} Nodes
          </span>
          <span className="text-[#004c22]/20">|</span>
          <span className="text-xs font-mono text-[#404940]">
            {telemetryPulsesCount} Links
          </span>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="emerald-card rounded-xl p-4 md:p-6 relative overflow-hidden bg-white shadow-sm border border-[#004c22]/10">
        
        {/* Top Control Bar: Mode Switching & Cluster Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#f4fbf4] p-1 rounded-lg border border-[#004c22]/10">
            <button
              onClick={() => setMode('topology')}
              className={`flex items-center gap-1.5 px-3 py-1.2 rounded-md text-xs font-medium transition-all ${
                mode === 'topology'
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Topology Force</span>
            </button>
            <button
              onClick={() => setMode('mesh')}
              className={`flex items-center gap-1.5 px-3 py-1.2 rounded-md text-xs font-medium transition-all ${
                mode === 'mesh'
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ring Mesh</span>
            </button>
            <button
              onClick={() => setMode('cluster')}
              className={`flex items-center gap-1.5 px-3 py-1.2 rounded-md text-xs font-medium transition-all ${
                mode === 'cluster'
                  ? 'bg-[#004c22] text-white shadow-xs'
                  : 'text-[#404940] hover:text-[#004c22]'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Constellations</span>
            </button>
          </div>

          {/* Cluster Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setActiveClusterFilter(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeClusterFilter === null
                  ? 'bg-[#004c22] text-white border-[#004c22]'
                  : 'bg-[#eef5ee] text-[#404940] border-[#004c22]/10 hover:border-[#004c22]/30'
              }`}
            >
              All Clusters
            </button>
            {CLUSTERS.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => setActiveClusterFilter(activeClusterFilter === idx ? null : idx)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  activeClusterFilter === idx
                    ? 'bg-[#006d3e] text-white border-[#006d3e]'
                    : 'bg-[#eef5ee]/80 text-[#404940] border-[#004c22]/10 hover:border-[#004c22]/30'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div ref={canvasContainerRef} className="relative w-full rounded-lg overflow-hidden border border-[#004c22]/10 bg-[#f4fbf4]/40">
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={() => {
              handlePointerUp();
              setHoveredNode(null);
            }}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="w-full cursor-grab active:cursor-grabbing touch-none select-none"
          />

          {/* Canvas Interactive Overlay Hint */}
          <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#004c22]/10 text-[11px] text-[#404940]">
            <MousePointer className="w-3 h-3 text-[#006d3e]" />
            <span>Drag nodes or click to create ripple shockwaves</span>
          </div>

          {/* Selected Node Telemetry Inspector Card */}
          {selectedNode && showInspector && (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#004c22]/20 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 z-10">
              <div className="flex items-center justify-between border-b border-[#004c22]/10 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CLUSTERS[selectedNode.cluster % CLUSTERS.length].color }}
                  />
                  <h4 className="font-semibold text-sm text-[#004c22]">{selectedNode.label}</h4>
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  className="text-[#404940] hover:text-[#004c22] p-1 rounded-md hover:bg-[#eef5ee]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-[#404940]">
                <div className="flex justify-between items-center">
                  <span className="text-[#707a6f]">Cluster Hub:</span>
                  <span className="font-medium text-[#161d19]">{selectedNode.clusterName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#707a6f]">Status:</span>
                  <span className="inline-flex items-center gap-1 font-medium capitalize text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {selectedNode.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#707a6f]">Throughput:</span>
                  <span className="font-mono font-medium text-[#004c22]">{selectedNode.throughput} MB/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#707a6f]">Latency:</span>
                  <span className="font-mono font-medium text-[#004c22]">{selectedNode.latency} ms</span>
                </div>

                {/* Activity Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#707a6f]">Live Telemetry Activity:</span>
                    <span className="font-mono font-medium text-[#004c22]">{Math.round(selectedNode.activity * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#eef5ee] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#004c22] transition-all duration-300"
                      style={{ width: `${selectedNode.activity * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#004c22]/10">
                <button
                  onClick={triggerPulseSurge}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#004c22] text-white text-xs font-medium rounded-md hover:bg-[#166534] transition-colors shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pulse Surge</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Canvas Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#004c22]/10 mt-4">
          
          {/* Main Simulation Play/Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#004c22] text-white text-xs font-medium hover:bg-[#166534] transition-all shadow-xs"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Simulation' : 'Resume Simulation'}</span>
            </button>

            <button
              onClick={handleScatter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eef5ee] text-[#004c22] text-xs font-medium hover:bg-[#dde4de] transition-colors border border-[#004c22]/10"
              title="Re-seed topology positions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scatter</span>
            </button>

            <button
              onClick={handleAddNodes}
              disabled={nodesRef.current.length >= 75}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eef5ee] text-[#004c22] text-xs font-medium hover:bg-[#dde4de] disabled:opacity-50 transition-colors border border-[#004c22]/10"
              title="Spawn 6 nodes"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Nodes</span>
            </button>
          </div>

          {/* Speed & Interactivity Options */}
          <div className="flex items-center gap-4 text-xs text-[#404940]">
            <div className="flex items-center gap-2 bg-[#f4fbf4] px-3 py-1 rounded-lg border border-[#004c22]/10">
              <Sliders className="w-3.5 h-3.5 text-[#006d3e]" />
              <span className="text-[#707a6f]">Speed:</span>
              {[0.5, 1, 2].map(spd => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-medium transition-colors ${
                    simSpeed === spd
                      ? 'bg-[#004c22] text-white'
                      : 'text-[#404940] hover:text-[#004c22]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[#707a6f]">
              <Activity className="w-3.5 h-3.5 text-[#006d3e]" />
              <span>Drag nodes to pin position</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
