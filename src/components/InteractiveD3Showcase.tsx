import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Activity, Cpu, Sparkles, Plus, Eye } from 'lucide-react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  cluster: number;
  activity: number;
}

interface Edge {
  source: number;
  target: number;
  strength: number;
}

export const InteractiveD3Showcase: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [nodeCount, setNodeCount] = useState(36);
  const [fps, setFps] = useState(60);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [streamActive, setStreamActive] = useState(true);
  const [mode, setMode] = useState<'topology' | 'mesh'>('topology');

  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Initialize nodes and edges
  const initSimulation = (count: number) => {
    const width = 800;
    const height = 400;
    const clusters = ['Ingestion', 'Kafka Ring', 'Tokio Async', 'Web Worker', 'D3 Canvas', 'K8s Pod'];

    const newNodes: Node[] = [];
    for (let i = 0; i < count; i++) {
      const clusterIdx = i % clusters.length;
      newNodes.push({
        id: i,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: i < 6 ? 11 : 6.5 + Math.random() * 3,
        label: i < 6 ? clusters[i] : `Node-${i}`,
        cluster: clusterIdx,
        activity: Math.random(),
      });
    }

    const newEdges: Edge[] = [];
    for (let i = 0; i < newNodes.length; i++) {
      const connections = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < connections; c++) {
        const target = (i + 1 + Math.floor(Math.random() * (newNodes.length - 1))) % newNodes.length;
        if (target !== i) {
          newEdges.push({ source: i, target, strength: 0.3 + Math.random() * 0.7 });
        }
      }
    }

    nodesRef.current = newNodes;
    edgesRef.current = newEdges;
  };

  useEffect(() => {
    initSimulation(nodeCount);
  }, [nodeCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 360;
      }
    };
    window.addEventListener('resize', handleResize);

    const clusterColors = ['#004c22', '#006d3e', '#166534', '#22482e', '#064e3b', '#284f33'];

    const render = (time: number) => {
      // FPS calculation
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (time - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      if (isRunning) {
        // Physics update loop
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          // Damping & speed
          node.x += node.vx;
          node.y += node.vy;

          // Boundary bouncing
          if (node.x < node.radius) {
            node.x = node.radius;
            node.vx *= -1;
          } else if (node.x > width - node.radius) {
            node.x = width - node.radius;
            node.vx *= -1;
          }

          if (node.y < node.radius) {
            node.y = node.radius;
            node.vy *= -1;
          } else if (node.y > height - node.radius) {
            node.y = height - node.radius;
            node.vy *= -1;
          }

          // Pulsing activity simulation
          if (streamActive) {
            node.activity += (Math.random() - 0.49) * 0.1;
            if (node.activity > 1) node.activity = 1;
            if (node.activity < 0.2) node.activity = 0.2;
          }
        }
      }

      // 1. Draw Edges
      ctx.lineWidth = 1;
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const s = nodes[edge.source];
        const t = nodes[edge.target];
        if (!s || !t) continue;

        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dy + dy * dy);

        ctx.strokeStyle = `rgba(0, 76, 34, ${Math.max(0.08, 0.35 - dist / 600)})`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();

        // Traveling telemetry pulse packet
        if (streamActive && isRunning && (i % 3 === 0)) {
          const progress = ((time / 1400) + (i * 0.2)) % 1;
          const px = s.x + dx * progress;
          const py = s.y + dy * progress;

          ctx.fillStyle = '#86efac';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const color = clusterColors[node.cluster % clusterColors.length];
        const isHovered = hoveredNode?.id === node.id;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isHovered ? 6 : 2), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? 'rgba(134, 239, 172, 0.4)' : 'rgba(0, 76, 34, 0.08)';
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#006d3e' : color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node label for key clusters
        if (node.radius > 8 || isHovered) {
          ctx.fillStyle = '#161d19';
          ctx.font = '500 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.radius + 14);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, streamActive, hoveredNode]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: Node | null = null;
    for (const node of nodesRef.current) {
      const dx = mx - node.x;
      const dy = my - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleAddNode = () => {
    if (nodesRef.current.length >= 70) return;
    setNodeCount(prev => prev + 6);
  };

  const handleResetSimulation = () => {
    initSimulation(nodeCount);
  };

  return (
    <section id="visualizer" className="scroll-mt-24 space-y-6">
      <div className="border-b border-[#004c22]/15 pb-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
            Interactive D3 Engine
          </h2>
          <p className="text-sm text-[#404940] mt-1">
            Real-time topology stream demonstration running at sustained 60 FPS.
          </p>
        </div>

        {/* Live Status Telemetry Indicator */}
        <div className="flex items-center gap-3 bg-[#eef5ee] px-3.5 py-1.5 rounded-full border border-[#004c22]/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-3.5" />
            <span className="text-xs font-mono font-medium text-[#004c22]">
              {fps} FPS
            </span>
          </div>
          <span className="text-[#004c22]/20">|</span>
          <span className="text-xs font-mono text-[#404940]">
            {nodesRef.current.length} Nodes
          </span>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="emerald-card rounded-xl p-4 md:p-6 relative overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
          className="w-full h-[360px] cursor-crosshair rounded-lg bg-[#f4fbf4]/40"
        />

        {/* Floating Canvas Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#004c22]/10 mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#004c22] text-white text-xs font-medium hover:bg-[#166534] transition-colors"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Engine' : 'Resume Engine'}</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eef5ee] text-[#004c22] text-xs font-medium hover:bg-[#dde4de] transition-colors"
              title="Re-seed topology"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scatter</span>
            </button>

            <button
              onClick={handleAddNode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eef5ee] text-[#004c22] text-xs font-medium hover:bg-[#dde4de] transition-colors"
              title="Spawn 6 nodes"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Nodes</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#707a6f]">
            <Activity className="w-3.5 h-3.5 text-[#006d3e]" />
            <span>Hover nodes to inspect cluster telemetry</span>
          </div>
        </div>
      </div>
    </section>
  );
};
