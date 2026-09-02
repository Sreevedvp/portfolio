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
  Server,
  Brain,
  Code2,
  Cpu,
  Boxes,
  Compass,
  Touchpad
} from 'lucide-react';

interface KnowledgeNode {
  id: number;
  label: string;
  cluster: number;
  clusterName: string;
  isHub: boolean;
  radius: number;
  description: string;
  metric: string;
  tags: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  activity: number;
  pinned?: boolean;
}

interface Edge {
  source: number;
  target: number;
  strength: number;
  isCrossHub?: boolean;
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
  { name: 'Angular & Frontend', color: '#004c22', highlight: '#4ade80', icon: Code2 },
  { name: 'Data Visualization', color: '#006d3e', highlight: '#86efac', icon: Network },
  { name: 'Rust & Systems', color: '#166534', highlight: '#34d399', icon: Cpu },
  { name: 'React & UI Craft', color: '#047857', highlight: '#6ee7b7', icon: Boxes },
  { name: 'Cloud & DevOps', color: '#065f46', highlight: '#a7f3d0', icon: Server },
  { name: 'AI & Automation', color: '#14532d', highlight: '#bbf7d0', icon: Brain },
];

// Definition of Sreeved's Architecture Knowledge Mesh
const KNOWLEDGE_GRAPH_DATA: {
  hub: string;
  cluster: number;
  nodes: { label: string; metric: string; description: string; tags: string[] }[];
}[] = [
  {
    hub: 'Angular Ecosystem',
    cluster: 0,
    nodes: [
      {
        label: 'Memory Leaks Optimization',
        metric: '-91% Peak Heap Memory',
        description: 'Profiled long-running SPAs using V8 Heap Snapshots, eliminating detached DOM trees, uncollected subscriptions, and memory retention.',
        tags: ['Chrome DevTools', 'Heap Snapshots', 'RxJS Lifecycles', 'V8 Profiling'],
      },
      {
        label: 'Micro-Frontends (Nx)',
        metric: '72% Faster CI Builds',
        description: 'Architected modular monorepo platforms using Nx and Webpack Module Federation, enabling independent squad releases.',
        tags: ['Nx Monorepo', 'Module Federation', 'Dynamic Remotes', 'TypeScript'],
      },
      {
        label: 'Angular Signals',
        metric: 'Zoneless Reactivity',
        description: 'Migrated legacy Zone.js components to modern fine-grained Angular Signals for instant state updates.',
        tags: ['Signals', 'Computed State', 'Zoneless Architecture', 'RxJS'],
      },
      {
        label: 'Stencil.js Web Components',
        metric: '12 Integrated Apps',
        description: 'Built framework-agnostic design systems using Stencil.js compiled to W3C native Web Components with Shadow DOM.',
        tags: ['Stencil.js', 'Custom Elements', 'Shadow DOM', 'Design Systems'],
      },
      {
        label: 'AST Refactoring Tooling',
        metric: '80% Automated Migration',
        description: 'Authored custom TypeScript Compiler AST transformation scripts to automate code migrations across enterprise codebases.',
        tags: ['TypeScript Compiler API', 'ts-morph', 'AST Transformations'],
      },
    ],
  },
  {
    hub: 'Data Visualization',
    cluster: 1,
    nodes: [
      {
        label: 'D3.js Force Engines',
        metric: '50,000+ Rendered Nodes',
        description: 'Engineered complex topological force-directed layout algorithms and scale systems for high-density dataset interactions.',
        tags: ['D3-force', 'Quadtrees', 'Custom Layout Math', 'Scales'],
      },
      {
        label: 'Three.js & WebGL',
        metric: '60 FPS Instanced Meshes',
        description: 'Created 3D WebGL scenes using InstancedMesh, GLSL shaders, and spatial raycasting for 3D topology visuals.',
        tags: ['Three.js', 'WebGL 2.0', 'GLSL Shaders', 'InstancedMesh'],
      },
      {
        label: 'Canvas 2D Buffering',
        metric: 'Sub-16ms Frame Times',
        description: 'Implemented offscreen canvas double-buffering and requestAnimationFrame loops for smooth 60fps rendering.',
        tags: ['Canvas 2D', 'requestAnimationFrame', 'DPI Scaling', 'Double Buffering'],
      },
      {
        label: 'Spatial Quadtrees',
        metric: 'O(log n) Hit Detection',
        description: 'Utilized quadtree spatial partitioning for fast cursor collision detection across thousands of dynamic data points.',
        tags: ['Quadtrees', 'Spatial Indexing', 'Algorithmic Optimization'],
      },
    ],
  },
  {
    hub: 'Systems & Backend',
    cluster: 2,
    nodes: [
      {
        label: 'Rust Async (Tokio)',
        metric: '<1ms P99 Latency',
        description: 'Built high-throughput, memory-safe backend services in Rust leveraging multi-threaded Tokio async runtimes.',
        tags: ['Rust', 'Tokio', 'Memory Safety', 'Concurrency'],
      },
      {
        label: 'Axum REST Services',
        metric: '100k req/s Throughput',
        description: 'Constructed low-latency microservices with Axum router, zero-copy deserialization, and lock-free data structures.',
        tags: ['Axum', 'Serde', 'Zero-Copy', 'DashMap'],
      },
      {
        label: 'WebSocket Real-time',
        metric: '500+ Ticks/sec Stream',
        description: 'Engineered bi-directional streaming protocols over WebSockets with Protobuf serialization and event debouncing.',
        tags: ['WebSockets', 'Protobuf', 'Bi-directional Streams', 'Ring Buffers'],
      },
      {
        label: 'FastAPI Python',
        metric: 'Async AI Endpoints',
        description: 'Served machine learning model pipelines via asynchronous FastAPI Python services connected to vector databases.',
        tags: ['FastAPI', 'Python 3.11', 'AsyncIO', 'Uvicorn'],
      },
    ],
  },
  {
    hub: 'React & UI Craft',
    cluster: 3,
    nodes: [
      {
        label: 'React 19 & Next.js',
        metric: 'Modern Frontend Stack',
        description: 'Developed modern web applications leveraging React 19 hooks, concurrent rendering, and server-side optimization.',
        tags: ['React 19', 'Next.js', 'Vite', 'JSX/TSX'],
      },
      {
        label: 'Tailwind CSS',
        metric: 'Precision Design Tokens',
        description: 'Crafted sleek, responsive, accessible design systems with custom Tailwind tokens, dark mode, and glassmorphism.',
        tags: ['Tailwind CSS v4', 'Responsive Layouts', 'Glassmorphism'],
      },
      {
        label: 'GSAP & Motion',
        metric: 'Fluid Micro-Animations',
        description: 'Orchestrated interactive timeline sequences and scroll-driven animations with GSAP and Motion.',
        tags: ['GSAP', 'Motion', 'ScrollTrigger', 'Physics Easing'],
      },
    ],
  },
  {
    hub: 'Cloud Infra & K8s',
    cluster: 4,
    nodes: [
      {
        label: 'Kubernetes (K8s)',
        metric: '99.99% Uptime Production',
        description: 'Managed production container pods, ingress controllers, and intra-cluster security policies.',
        tags: ['Kubernetes', 'Pods', 'NetworkPolicies', 'Cloud Native'],
      },
      {
        label: 'Helm Charts',
        metric: 'Declarative Releases',
        description: 'Parameterized environment deployments with Helm charts and HashiCorp Vault automated secrets injection.',
        tags: ['Helm 3', 'HashiCorp Vault', 'Secrets Management'],
      },
      {
        label: 'GitLab CI Approval Gates',
        metric: '100% Audit Compliance',
        description: 'Designed automated CI/CD approval gates enforcing security scans, AST quality rules, and canary rollbacks.',
        tags: ['GitLab CI', 'Automated Gates', 'Docker', 'Canary Rollouts'],
      },
    ],
  },
  {
    hub: 'AI & Automation',
    cluster: 5,
    nodes: [
      {
        label: 'Qdrant Vector DB',
        metric: '<15ms Vector Search',
        description: 'Integrated high-performance vector similarity search for contextual retrieval and semantic embeddings.',
        tags: ['Qdrant', 'Vector Search', 'Embeddings', 'AI Context'],
      },
      {
        label: 'ONNX Runtime',
        metric: 'Hardware-Accelerated Inference',
        description: 'Optimized cross-platform machine learning model execution using ONNX Runtime.',
        tags: ['ONNX', 'Machine Learning', 'Inference Acceleration'],
      },
      {
        label: 'LLM Vision QA',
        metric: '95% Visual Bug Catch Rate',
        description: 'Combined multimodal LLMs with Playwright pipelines to detect visual layout shifts and graphic collisions.',
        tags: ['Playwright', 'Multimodal Vision', 'Automated Testing'],
      },
    ],
  },
];

export const InteractiveD3Showcase: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Control States
  const [isRunning, setIsRunning] = useState(true);
  const [fps, setFps] = useState(60);
  const [simSpeed, setSimSpeed] = useState(1);
  const [mode, setMode] = useState<'topology' | 'mesh' | 'cluster'>('topology');
  const [activeClusterFilter, setActiveClusterFilter] = useState<number | null>(null);

  // Interactive States
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [activeConnectionsCount, setActiveConnectionsCount] = useState(0);

  // Animation & Physics Refs
  const nodesRef = useRef<KnowledgeNode[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const draggedNodeRef = useRef<KnowledgeNode | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Knowledge Graph Data
  const initKnowledgeGraph = useCallback(() => {
    const width = canvasContainerRef.current?.clientWidth || 800;
    const height = window.innerWidth < 640 ? 320 : 420;

    const newNodes: KnowledgeNode[] = [];
    const newEdges: Edge[] = [];

    let nodeIdCounter = 0;
    const hubNodeIds: number[] = [];

    // Create Hub Nodes & Child Nodes
    KNOWLEDGE_GRAPH_DATA.forEach(group => {
      const hubId = nodeIdCounter++;
      hubNodeIds.push(hubId);

      const clusterMeta = CLUSTERS[group.cluster % CLUSTERS.length];

      // Central Hub Node (BIGGEST BUBBLE)
      newNodes.push({
        id: hubId,
        label: group.hub,
        cluster: group.cluster,
        clusterName: clusterMeta.name,
        isHub: true,
        radius: group.cluster === 0 ? 20 : 17, // Angular is biggest
        description: `Core architecture domain encompassing ${group.nodes.length} specialized technical disciplines.`,
        metric: `${group.nodes.length} Specialized Topics`,
        tags: [clusterMeta.name, 'Architecture Domain'],
        x: Math.random() * (width - 160) + 80,
        y: Math.random() * (height - 160) + 80,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        activity: 0.85,
      });

      // Child Knowledge Nodes
      group.nodes.forEach(child => {
        const childId = nodeIdCounter++;
        newNodes.push({
          id: childId,
          label: child.label,
          cluster: group.cluster,
          clusterName: clusterMeta.name,
          isHub: false,
          radius: 8.5 + Math.random() * 2.5,
          description: child.description,
          metric: child.metric,
          tags: child.tags,
          x: Math.random() * (width - 160) + 80,
          y: Math.random() * (height - 160) + 80,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          activity: 0.4 + Math.random() * 0.5,
        });

        // Link child node to its main domain hub
        newEdges.push({
          source: hubId,
          target: childId,
          strength: 0.85,
        });
      });
    });

    // Inter-hub Cross Links (Synapses connecting domain hubs)
    for (let i = 0; i < hubNodeIds.length; i++) {
      const sourceHub = hubNodeIds[i];
      const targetHub = hubNodeIds[(i + 1) % hubNodeIds.length];
      newEdges.push({
        source: sourceHub,
        target: targetHub,
        strength: 0.6,
        isCrossHub: true,
      });
    }

    // Special Cross Domain Connections (e.g. Memory Leaks <-> Canvas 2D)
    const angularLeakNode = newNodes.find(n => n.label === 'Memory Leaks Optimization');
    const canvasNode = newNodes.find(n => n.label === 'Canvas 2D Buffering');
    const d3Node = newNodes.find(n => n.label === 'D3.js Force Engines');
    const rustNode = newNodes.find(n => n.label === 'Rust Async (Tokio)');
    const wsNode = newNodes.find(n => n.label === 'WebSocket Real-time');

    if (angularLeakNode && canvasNode) newEdges.push({ source: angularLeakNode.id, target: canvasNode.id, strength: 0.4, isCrossHub: true });
    if (angularLeakNode && d3Node) newEdges.push({ source: angularLeakNode.id, target: d3Node.id, strength: 0.4, isCrossHub: true });
    if (rustNode && wsNode) newEdges.push({ source: rustNode.id, target: wsNode.id, strength: 0.5, isCrossHub: true });

    nodesRef.current = newNodes;
    edgesRef.current = newEdges;
    setActiveConnectionsCount(newEdges.length);
  }, []);

  useEffect(() => {
    initKnowledgeGraph();
  }, [initKnowledgeGraph]);

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
      // 1. Physics Calculations
      // -------------------------------------------------------------
      if (isRunning) {
        const speed = simSpeed;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (node.pinned) continue;

          node.vx *= 0.93;
          node.vy *= 0.93;

          if (mode === 'topology') {
            // N-body Repulsion Force between nodes
            for (let j = i + 1; j < nodes.length; j++) {
              const other = nodes[j];
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const distSq = dx * dx + dy * dy || 1;
              const dist = Math.sqrt(distSq);

              const minDist = (node.radius + other.radius) * 3.5;
              if (dist < minDist) {
                const force = (minDist - dist) / minDist;
                const fx = (dx / dist) * force * 0.45 * speed;
                const fy = (dy / dist) * force * 0.45 * speed;

                node.vx -= fx;
                node.vy -= fy;
                if (!other.pinned) {
                  other.vx += fx;
                  other.vy += fy;
                }
              }
            }

            // Soft Central Gravity Force
            const gdx = centerX - node.x;
            const gdy = centerY - node.y;
            node.vx += gdx * 0.00035 * speed;
            node.vy += gdy * 0.00035 * speed;

          } else if (mode === 'mesh') {
            // Ring Mesh Layout
            const clusterIdx = node.cluster;
            const radius = 80 + clusterIdx * 25;
            const angleSpeed = (0.004 + (clusterIdx % 3) * 0.002) * speed;
            const currentAngle = Math.atan2(node.y - centerY, node.x - centerX) + angleSpeed;

            const targetX = centerX + Math.cos(currentAngle) * radius;
            const targetY = centerY + Math.sin(currentAngle) * radius;

            node.vx += (targetX - node.x) * 0.05 * speed;
            node.vy += (targetY - node.y) * 0.05 * speed;

          } else if (mode === 'cluster') {
            // Constellation Cluster Layout around Domain Hubs
            const hubX = centerX + Math.cos((node.cluster / CLUSTERS.length) * Math.PI * 2) * (width * 0.28);
            const hubY = centerY + Math.sin((node.cluster / CLUSTERS.length) * Math.PI * 2) * (height * 0.25);

            node.vx += (hubX - node.x) * 0.045 * speed;
            node.vy += (hubY - node.y) * 0.045 * speed;
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
              const targetDist = node.isHub || other.isHub ? 80 : 55;
              const springForce = (dist - targetDist) * 0.006 * edge.strength * speed;

              node.vx += (dx / dist) * springForce;
              node.vy += (dy / dist) * springForce;
            }
          }

          // Apply position change
          node.x += node.vx * speed;
          node.y += node.vy * speed;

          // Boundary bouncing with dampening
          const padding = node.radius + 8;
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

          // Activity pulse simulation
          node.activity += (Math.random() - 0.49) * 0.03;
          if (node.activity > 1) node.activity = 1;
          if (node.activity < 0.3) node.activity = 0.3;
        }
      }

      // -------------------------------------------------------------
      // 2. Render Shockwaves / Ripples
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
      // 3. Render Edges (Links & Telemetry Synapses)
      // -------------------------------------------------------------
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const s = nodes[edge.source];
        const t = nodes[edge.target];
        if (!s || !t) continue;

        const isFiltered = activeClusterFilter !== null &&
          (s.cluster !== activeClusterFilter && t.cluster !== activeClusterFilter);

        const isConnected = focusedNode ? (s.id === focusedNode.id || t.id === focusedNode.id) : true;
        const opacity = isFiltered ? 0.03 : (focusedNode ? (isConnected ? 0.85 : 0.06) : (edge.isCrossHub ? 0.18 : 0.35));

        const dx = t.x - s.x;
        const dy = t.y - s.y;

        // Gradient line for links
        const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
        const sColor = CLUSTERS[s.cluster % CLUSTERS.length].color;
        const tColor = CLUSTERS[t.cluster % CLUSTERS.length].color;
        grad.addColorStop(0, sColor);
        grad.addColorStop(1, tColor);

        ctx.lineWidth = isConnected && focusedNode ? 2.5 : (edge.isCrossHub ? 1.0 : 1.5);
        if (edge.isCrossHub) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.strokeStyle = opacity > 0.1 ? grad : `rgba(0, 76, 34, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Traveling pulse particles along links
        if (!isFiltered && isRunning && (i % 2 === 0 || isConnected)) {
          const speedMultiplier = (0.0006 + (edge.strength * 0.0005)) * simSpeed;
          const progress = ((time * speedMultiplier) + (i * 0.15)) % 1;
          const px = s.x + dx * progress;
          const py = s.y + dy * progress;

          const packetColor = CLUSTERS[s.cluster % CLUSTERS.length].highlight;

          ctx.shadowColor = packetColor;
          ctx.shadowBlur = 6;
          ctx.fillStyle = packetColor;
          ctx.beginPath();
          ctx.arc(px, py, isConnected && focusedNode ? 3.5 : 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // -------------------------------------------------------------
      // 4. Render Nodes (Domain Hubs & Knowledge Bubbles)
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

        // Outer Glowing Aura & Ping Animation for Hubs or Selected Nodes
        if (isFocused || node.isHub) {
          const pulseRadius = node.radius + (node.isHub ? 7 : 5) + Math.sin(time * 0.006 + node.id) * 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = isFocused ? 'rgba(74, 222, 128, 0.3)' : 'rgba(0, 76, 34, 0.08)';
          ctx.fill();
        }

        // Main Node Circle
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isFocused ? 3.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? clusterMeta.highlight : clusterMeta.color;
        ctx.fill();

        // Node Border Stroke (Thicker for Main Hubs)
        ctx.strokeStyle = isFocused ? '#ffffff' : (node.isHub ? clusterMeta.highlight : 'rgba(255, 255, 255, 0.9)');
        ctx.lineWidth = node.isHub ? 2.5 : (isFocused ? 2.0 : 1.2);
        ctx.stroke();
        ctx.restore();

        // Label Rendering
        if (node.isHub || isFocused || (width > 600 && !isClusterFiltered)) {
          ctx.save();
          ctx.globalAlpha = baseAlpha;
          ctx.fillStyle = isFocused ? '#004c22' : (node.isHub ? '#004c22' : '#161d19');
          ctx.font = `${node.isHub || isFocused ? '600' : '500'} ${node.isHub ? '12px' : '10px'} Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.radius + (node.isHub ? 16 : 13));
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
  // Pointer / Touch Coordinates & Collision Logic
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
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const findNodeAtCoords = (x: number, y: number): KnowledgeNode | null => {
    for (const node of nodesRef.current) {
      const dx = x - node.x;
      const dy = y - node.y;
      // Increased hit radius for touch friendliness (minimum 20px hit target)
      const hitThreshold = Math.max(22, node.radius + 10);
      if (Math.sqrt(dx * dx + dy * dy) <= hitThreshold) {
        return node;
      }
    }
    return null;
  };

  // Interactive Touch & Mouse Event Handlers
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default on touch to stop window scrolling during graph interaction
    if ('touches' in e) {
      e.preventDefault();
    }

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
        maxRadius: 80,
        alpha: 0.8,
        color: 'rgb(74, 222, 128)',
      });
      setSelectedNode(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && draggedNodeRef.current) {
      e.preventDefault();
    }

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

  const handlePointerUp = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.pinned = false;
      draggedNodeRef.current = null;
    }
  };

  // Control Actions
  const handleScatter = () => {
    initKnowledgeGraph();
  };

  const triggerPulseSurge = () => {
    if (!selectedNode) return;
    shockwavesRef.current.push({
      x: selectedNode.x,
      y: selectedNode.y,
      radius: selectedNode.radius,
      maxRadius: 130,
      alpha: 1.0,
      color: CLUSTERS[selectedNode.cluster % CLUSTERS.length].highlight,
    });
    // Boost connected node activities & physics speed
    nodesRef.current.forEach(n => {
      if (n.cluster === selectedNode.cluster) {
        n.activity = 1.0;
        n.vx += (Math.random() - 0.5) * 6;
        n.vy += (Math.random() - 0.5) * 6;
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
              Interactive Architecture & Skill Graph
            </h2>
            <span className="bg-[#004c22]/10 text-[#004c22] text-xs font-mono px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Live Mesh
            </span>
          </div>
          <p className="text-sm text-[#404940] mt-1">
            Tap or drag any node (e.g. <strong>Angular</strong>, <strong>Data Visualization</strong>, <strong>Rust</strong>) to inspect specialized engineering topics, metrics, and architecture patterns.
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
            {nodesRef.current.length} Knowledge Nodes
          </span>
          <span className="text-[#004c22]/20">|</span>
          <span className="text-xs font-mono text-[#404940]">
            {activeConnectionsCount} Links
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
              <span>Orbital Mesh</span>
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
              All Domains
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
            style={{ touchAction: 'none' }}
            className="w-full cursor-grab active:cursor-grabbing select-none"
          />

          {/* Canvas Interactive Overlay Hint */}
          <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#004c22]/10 text-[11px] text-[#404940] shadow-2xs">
            <Touchpad className="w-3.5 h-3.5 text-[#006d3e]" />
            <span>Tap or drag bubbles to inspect knowledge topics</span>
          </div>

          {/* Selected Knowledge Node Telemetry Inspector Card */}
          {selectedNode && showInspector && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-88 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#004c22]/20 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 z-20">
              <div className="flex items-center justify-between border-b border-[#004c22]/10 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: CLUSTERS[selectedNode.cluster % CLUSTERS.length].color }}
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-[#004c22] leading-tight">{selectedNode.label}</h4>
                    <span className="text-[11px] text-[#707a6f] font-mono">{selectedNode.clusterName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  className="text-[#404940] hover:text-[#004c22] p-1 rounded-md hover:bg-[#eef5ee] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#404940]">
                {/* Metric Highlight Badge */}
                <div className="flex items-center justify-between bg-[#eef5ee] px-3 py-1.5 rounded-lg border border-[#004c22]/10">
                  <span className="text-[#707a6f] font-medium">Key Achievement:</span>
                  <span className="font-mono font-semibold text-[#004c22]">{selectedNode.metric}</span>
                </div>

                {/* Description */}
                <p className="text-[#161d19] leading-relaxed">
                  {selectedNode.description}
                </p>

                {/* Skill Tags */}
                <div className="space-y-1">
                  <span className="text-[11px] text-[#707a6f] font-medium uppercase tracking-wider block">Connected Tech:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-[#f4fbf4] text-[#004c22] border border-[#004c22]/15 text-[11px] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
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
                  <span>Pulse Knowledge Surge</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Canvas Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#004c22]/10 mt-4">
          
          {/* Main Simulation Play/Pause & Scatter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#004c22] text-white text-xs font-medium hover:bg-[#166534] transition-all shadow-xs"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Engine' : 'Resume Engine'}</span>
            </button>

            <button
              onClick={handleScatter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eef5ee] text-[#004c22] text-xs font-medium hover:bg-[#dde4de] transition-colors border border-[#004c22]/10"
              title="Re-seed knowledge graph"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scatter Mesh</span>
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
              <Touchpad className="w-3.5 h-3.5 text-[#006d3e]" />
              <span>Mobile & Desktop Touch Ready</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
