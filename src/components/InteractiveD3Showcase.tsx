import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Zap, Layers, X, Network, RotateCcw, Server, Brain, Code2, Cpu, Boxes, Touchpad } from 'lucide-react';
import { nearestNode, constrainPoint } from '../utils/graphInteraction';

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
  { name: 'Angular & Frontend', color: '#ffd600', highlight: '#fff09b', icon: Code2 },
  { name: 'Data Visualization', color: '#00c4dd', highlight: '#8eeeff', icon: Network },
  { name: 'Rust & Systems', color: '#b388ff', highlight: '#ddcaff', icon: Cpu },
  { name: 'React & UI Craft', color: '#ff668e', highlight: '#ffb4ca', icon: Boxes },
  { name: 'Cloud & DevOps', color: '#69dca9', highlight: '#b4f4d4', icon: Server },
  { name: 'AI & Automation', color: '#ffb86c', highlight: '#ffdab4', icon: Brain },
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

export const InteractiveD3Showcase: React.FC<{ motionEnabled?: boolean }> = ({ motionEnabled = true }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Control States
  const [isRunning, setIsRunning] = useState(() => document.documentElement.dataset.motion !== 'off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fps, setFps] = useState(0);
  const [touchDrag, setTouchDrag] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [mode, setMode] = useState<'topology' | 'mesh' | 'cluster'>('topology');
  const [activeClusterFilter, setActiveClusterFilter] = useState<number | null>(null);

  // Interactive States
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
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

  const pointerRef = useRef<{ id: number; x: number; y: number; moved: boolean; node: KnowledgeNode | null } | null>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Initialize Knowledge Graph Data
  const initKnowledgeGraph = useCallback(() => {
    const width = canvasContainerRef.current?.clientWidth || 800;
    const height = width < 560 ? 380 : 460;

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

  useEffect(() => { if (!motionEnabled) setIsRunning(false); }, [motionEnabled]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = width < 560 ? 380 : 460;

    const setupCanvasScale = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = width < 560 ? 380 : 460;
      const previous = dimensionsRef.current;
      for (const node of nodesRef.current) {
        const x = previous.width ? node.x * width / previous.width : node.x;
        const y = previous.height ? node.y * height / previous.height : node.y;
        Object.assign(node, constrainPoint(x, y, node.radius, width, height));
      }
      dimensionsRef.current = { width, height };

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

    let visible = false;
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibilityObserver.observe(container);
    const render = (time: number) => {
      if (!visible || document.hidden) { animationFrameRef.current = requestAnimationFrame(render); return; }
      const light = document.documentElement.dataset.theme === 'light';
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
      if (isRunning && motionEnabled) {
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
            const radius = Math.min(width, height) * (0.15 + clusterIdx * 0.04);
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
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.alpha;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
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
          (s.cluster !== activeClusterFilter || t.cluster !== activeClusterFilter);

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

        ctx.strokeStyle = grad;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Traveling pulse particles along links
        if (!isFiltered && isRunning && motionEnabled && (i % 2 === 0 || isConnected)) {
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

        const baseAlpha = isClusterFiltered ? 0.08 : (focusedNode ? (isConnectedPeer ? 1 : 0.25) : 1);

        // Outer Glowing Aura & Ping Animation for Hubs or Selected Nodes
        if (!isClusterFiltered && (isFocused || node.isHub)) {
          const pulseRadius = node.radius + (node.isHub ? 7 : 5) + (isRunning && motionEnabled && !reducedMotion.current ? Math.sin(time * 0.006 + node.id) * 3 : 0);
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = clusterMeta.color + (isFocused ? '30' : '12');
          ctx.fill();
        }

        // Main Node Circle
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isFocused ? 3.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? clusterMeta.color : (light ? '#ffffff' : '#171720');
        ctx.fill();

        // Node Border Stroke (Thicker for Main Hubs)
        ctx.strokeStyle = clusterMeta.color;
        ctx.lineWidth = node.isHub ? 2.5 : (isFocused ? 2.0 : 1.2);
        ctx.stroke();
        ctx.restore();

        // Label Rendering
        if (!isClusterFiltered && (node.isHub || isFocused)) {
          ctx.save();
          ctx.globalAlpha = baseAlpha;
          ctx.fillStyle = light ? '#24242c' : '#d7d7e2';
          ctx.font = `${node.isHub || isFocused ? '600' : '500'} ${node.isHub ? '13px' : '12px'} Inter, sans-serif`;
          ctx.textAlign = 'center';
          const label = width < 560 && node.isHub ? CLUSTERS[node.cluster].name.split(' & ')[0] : node.label;
          const labelWidth = ctx.measureText(label).width;
          const labelX = Math.max(labelWidth / 2 + 6, Math.min(width - labelWidth / 2 - 6, node.x));
          const labelY = Math.min(height - 10, node.y + node.radius + 19);
          ctx.fillStyle = light ? '#f5f3ee' : '#0a0a0f';
          ctx.fillRect(labelX - labelWidth / 2 - 4, labelY - 13, labelWidth + 8, 18);
          ctx.fillStyle = light ? '#24242c' : '#d7d7e2';
          ctx.fillText(label, labelX, labelY);
          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, motionEnabled, simSpeed, mode, activeClusterFilter, hoveredNode, selectedNode]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { width, height } = dimensionsRef.current;
    return { x: (e.clientX - rect.left) * width / rect.width, y: (e.clientY - rect.top) * height / rect.height };
  };

  const endDrag = () => {
    if (draggedNodeRef.current) draggedNodeRef.current.pinned = false;
    draggedNodeRef.current = null;
    pointerRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.isPrimary || e.button !== 0 || pointerRef.current) return;
    const coords = getCanvasCoords(e);
    const node = nearestNode<KnowledgeNode>(nodesRef.current, coords.x, coords.y, activeClusterFilter, e.pointerType !== 'mouse');
    pointerRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, node };
    if (node && (e.pointerType === 'mouse' || touchDrag)) {
      e.currentTarget.setPointerCapture(e.pointerId);
      draggedNodeRef.current = node;
      node.pinned = true;
      dragOffsetRef.current = { x: coords.x - node.x, y: coords.y - node.y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointer = pointerRef.current;
    if (pointer && pointer.id !== e.pointerId) return;
    const coords = getCanvasCoords(e);
    if (pointer && Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 8) pointer.moved = true;
    const node = draggedNodeRef.current;
    if (node) {
      const { width, height } = dimensionsRef.current;
      Object.assign(node, constrainPoint(coords.x - dragOffsetRef.current.x, coords.y - dragOffsetRef.current.y, node.radius, width, height), { vx: 0, vy: 0 });
    } else if (e.pointerType === 'mouse') {
      setHoveredNode(nearestNode<KnowledgeNode>(nodesRef.current, coords.x, coords.y, activeClusterFilter, false));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== e.pointerId) return;
    if (!pointer.moved || draggedNodeRef.current) setSelectedNode(pointer.node);
    setHoveredNode(null);
    endDrag();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const selectCluster = (cluster: number | null) => {
    endDrag();
    setActiveClusterFilter(cluster);
    setSelectedNode(null);
    setHoveredNode(null);
  };

  // Control Actions
  const handleScatter = () => {
    endDrag();
    setSelectedNode(null);
    setHoveredNode(null);
    shockwavesRef.current = [];
    initKnowledgeGraph();
  };

  const triggerPulseSurge = () => {
    if (!selectedNode || reducedMotion.current || !motionEnabled) return;
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

  const visibleNodes = nodesRef.current.filter(node => activeClusterFilter === null || node.cluster === activeClusterFilter);
  const layouts = [{ id: 'topology', label: 'Topology', icon: Network }, { id: 'mesh', label: 'Orbit', icon: Layers }, { id: 'cluster', label: 'Clusters', icon: Server }] as const;

  return (
    <section id="visualizer" className="skill-graph space-y-6">
      <div className="graph-heading">
        <div><p className="hero-kicker mb-3">04 / Interactive playground</p><h2 className="comic-heading chromatic">CONNECT <em>THE DOTS.</em></h2><p className="text-base text-[var(--text-secondary)] mt-3">Explore the technologies behind my work. Select a node to go deeper.</p></div>
        <div className="graph-telemetry" aria-label="Graph status"><span className="graph-status-dot" /><span>{isRunning ? `${fps} FPS` : 'PAUSED'}</span><span>{nodesRef.current.length} nodes</span><span>{activeConnectionsCount} links</span></div>
      </div>

      <div className="graph-panel">
        <div className="graph-toolbar">
          <div className="graph-segments" role="group" aria-label="Graph layout">
            {layouts.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}><Icon size={16} /><span>{label}</span></button>)}
          </div>
          <span className="graph-toolbar-caption">ENGINEERING, INTERCONNECTED</span>
        </div>

        <div className="graph-domains" role="group" aria-label="Filter by domain">
          <button type="button" aria-pressed={activeClusterFilter === null} onClick={() => selectCluster(null)}>All domains</button>
          {CLUSTERS.map((cluster, index) => <button type="button" key={cluster.name} aria-pressed={activeClusterFilter === index} onClick={() => selectCluster(activeClusterFilter === index ? null : index)}><span style={{ background: cluster.color }} />{cluster.name}</button>)}
        </div>
        <div className="graph-selectors">
          <label className="graph-domain-select">Domain<select value={activeClusterFilter ?? 'all'} onChange={e => selectCluster(e.target.value === 'all' ? null : Number(e.target.value))}><option value="all">All domains</option>{CLUSTERS.map((cluster, index) => <option key={cluster.name} value={index}>{cluster.name}</option>)}</select></label>
          <label>Explore a topic<select value={selectedNode?.id ?? ''} onChange={e => { setHoveredNode(null); setSelectedNode(nodesRef.current.find(node => node.id === Number(e.target.value)) ?? null); }}><option value="" disabled>Select a node or choose here</option>{visibleNodes.map(node => <option key={node.id} value={node.id}>{node.label}</option>)}</select></label>
        </div>

        <div className="graph-canvas" ref={canvasContainerRef}>
          <canvas ref={canvasRef} aria-label="Interactive skill graph. Choose a topic from the selector above for keyboard access." onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={() => setHoveredNode(null)} style={{ touchAction: touchDrag ? 'none' : 'pan-y pinch-zoom' }} />
          <span className="graph-canvas-label" aria-hidden="true">{activeClusterFilter === null ? 'THE KNOWLEDGE NETWORK' : CLUSTERS[activeClusterFilter].name.toUpperCase()}</span>
        </div>
        <div className="graph-gesture-bar">
          <p id="graph-gesture-help"><Touchpad size={16} /><span>{touchDrag ? 'Drag a node to move it. Turn off to scroll the page.' : 'Tap a node to inspect. Swipe to scroll the page.'}</span></p>
          <button type="button" aria-pressed={touchDrag} aria-describedby="graph-gesture-help" onClick={() => { endDrag(); setTouchDrag(value => !value); }}>Drag nodes <span className="graph-toggle" /></button>
        </div>

        {selectedNode && <div className="graph-inspector" role="region" aria-label="Selected topic" aria-live="polite">
          <div className="graph-inspector-header"><div><p className="hero-kicker mb-2">{selectedNode.clusterName}</p><h3 className="!font-sans text-xl font-semibold tracking-tight">{selectedNode.label}</h3></div><button type="button" className="graph-icon-button" aria-label="Close topic details" onClick={() => { setSelectedNode(null); setHoveredNode(null); }}><X size={18} /></button></div>
          <p className="graph-inspector-metric">{selectedNode.metric}</p>
          <p className="text-base leading-relaxed text-[var(--text-secondary)]">{selectedNode.description}</p>
          <div className="graph-tags">{selectedNode.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          {motionEnabled && !reducedMotion.current && <button type="button" className="graph-pulse" onClick={triggerPulseSurge}><Zap size={16} />Pulse connections</button>}
        </div>}

        <div className="graph-controls">
          <div className="graph-playback"><button type="button" className="graph-play" disabled={!motionEnabled} title={!motionEnabled ? "Enable animations in navigation to resume" : undefined} aria-pressed={isRunning} onClick={() => setIsRunning(value => !value)}>{isRunning ? <Pause size={16} /> : <Play size={16} />}{!motionEnabled ? 'Motion paused' : isRunning ? 'Pause' : 'Resume'}</button><button type="button" className="graph-reset" onClick={handleScatter}><RotateCcw size={16} />Reset</button></div>
          <div className="graph-speed"><span>Speed</span><div className="graph-segments" role="group" aria-label="Animation speed">{[0.5, 1, 2].map(speed => <button type="button" key={speed} aria-pressed={simSpeed === speed} onClick={() => setSimSpeed(speed)}>{speed}×</button>)}</div></div>
        </div>
      </div>
    </section>
  );
};
