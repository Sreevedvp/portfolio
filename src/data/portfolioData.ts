import type { StackItem, ProjectSection, ExperienceItem, ArticleItem } from '../types.js';

export const HERO_DATA = {
  name: "Sreeved V P",
  title: "Frontend Software Engineer · Hyderabad, India.",
  shortBio: "Software Engineer based in India. Crafting precise, scalable systems and robust architectures.",
  fullBio: "With over 3.5 years of experience, I navigate the spectrum of frontend engineering—moving seamlessly from crafting precise, pixel-perfect user interfaces to orchestrating deployments with Kubernetes. My focus is on scalable architectures, performant rendering, and bridging the gap between elegant client-side code and robust infrastructure.",
  secondaryBio: "Currently, I am exploring the intersection of distributed systems and modern web technologies, aiming to create tools that empower other developers and streamline complex workflows.",
  location: "Hyderabad, India",
  email: "sreevedvp@gmail.com",
  socials: {
    github: "https://github.com/Sreevedvp",
    linkedin: "https://linkedin.com/in/sreevedvp",
    readcv: "",
    medium: "https://medium.com/@sreevedvp",
  }
};

export const CORE_STACK_LIST = [
  "Angular (up to v22), React, React Native, Rust",
  "D3.js, Three.js",
  "FastAPI, Axum, Tokio",
  "WebSocket-driven real-time systems",
  "Nx monorepos, Stencil.js (Web Components)",
  "Kubernetes, Helm, GitLab CI/CD",
  "Qdrant, ONNX, Playwright",
];

export const CORE_STACK_CATEGORIES: { title: string; subtitle: string; icon: string; items: string[] }[] = [
  {
    title: "Frameworks",
    subtitle: "Angular (v14-v22), React, React Native",
    icon: "code",
    items: ["Angular Signals", "RxJS", "React 19", "React Native", "TypeScript", "Tailwind CSS"]
  },
  {
    title: "Systems",
    subtitle: "Rust, Tokio, Axum",
    icon: "memory",
    items: ["Rust Async", "Tokio Runtime", "Axum HTTP", "Memory Safety", "FastAPI Python"]
  },
  {
    title: "Visualization",
    subtitle: "D3.js, Three.js",
    icon: "monitoring",
    items: ["D3 Force Simulations", "WebGL Shaders", "60 FPS Animation Sequencing", "Canvas Buffering"]
  },
  {
    title: "Real-time",
    subtitle: "WebSocket-driven real-time systems",
    icon: "sync_alt",
    items: ["Bi-directional Streams", "Protobuf / JSON serialization", "Event Debouncing", "Connection Resiliency"]
  },
  {
    title: "Architecture",
    subtitle: "Nx, Stencil.js (Web Components)",
    icon: "account_tree",
    items: ["Nx Monorepo Module Federation", "Cross-Framework Web Components", "AST Migrations", "Design Systems"]
  },
  {
    title: "Infra & DevOps",
    subtitle: "GitLab, Kubernetes, Helm",
    icon: "dns",
    items: ["K8s Pod Orchestration", "Helm Charts", "GitLab CI/CD Approval Gates", "Docker", "Linux Profiling"]
  }
];

export const PROJECT_SECTIONS: ProjectSection[] = [
  {
    id: "architecture",
    title: "Architecture & Micro-Frontends",
    items: [
      {
        id: "angular-mfe",
        title: "Angular Micro-Frontend Platform",
        description: "Architected a scalable micro-frontend architecture using Nx monorepos. Established decoupled domains allowing independent deployment cycles and streamlined cross-team collaboration.",
        tags: ["Angular", "Nx Monorepo", "Webpack Module Federation", "TypeScript"],
        architectureDetails: {
          challenge: "Scaling a monolithic enterprise suite across 6 engineering squads with tight coupling and long CI build times (over 45 minutes).",
          solution: "Implemented an Nx monorepo with Webpack Module Federation and dynamic remote loading. Decoupled feature domains into independent deployable micro-apps with shared contracts.",
          outcome: "Reduced build times by 72% with Nx computation caching; enabled atomic squad releases without master branch blocking.",
          technologies: ["Angular", "Nx", "Module Federation", "RxJS", "TypeScript"],
          metrics: ["-72% CI Build Duration", "6 Independent Squads", "Zero-downtime Rollouts"],
          codeSnippet: `// Remote module federated loader configuration\nexport const routes: Routes = [\n  {\n    path: 'analytics',\n    loadChildren: () =>\n      loadRemoteModule({\n        type: 'module',\n        remoteEntry: 'https://cdn.internal/analytics/remoteEntry.js',\n        exposedModule: './Module'\n      }).then(m => m.AnalyticsModule)\n  }\n];`
        }
      },
      {
        id: "pipeline-approval",
        title: "Pipeline Approval-Gate System",
        description: "Designed rigid pipeline approval gates ensuring consistent quality and compliance standards across all deployments within the monorepo structure.",
        tags: ["GitLab CI", "Bash", "Nx Affected", "Compliance"],
        architectureDetails: {
          challenge: "Ensuring regulatory compliance, linting correctness, and preventing accidental master releases without manual gatekeeper bottlenecks.",
          solution: "Constructed automated dynamic CI gates utilizing 'nx affected' analysis, enforcing security scans, AST code quality rules, and automated sign-offs.",
          outcome: "100% compliance rate with automated audits and zero unauthorized artifact promotions to production.",
          technologies: ["GitLab CI/CD", "Nx CLI", "Shell Scripting", "SonarQube"],
          metrics: ["100% Audit Compliance", "3x Faster Approval Turnaround"]
        }
      },
      {
        id: "stencil-components",
        title: "Stencil.js Component Library",
        description: "Built a unified, framework-agnostic component library using Stencil.js (Web Components), standardizing the design system across diverse product offerings and ensuring visual consistency.",
        fullWidth: true,
        tags: ["Stencil.js", "Web Components", "Custom Elements", "Shadow DOM"],
        architectureDetails: {
          challenge: "Supporting legacy Angular applications alongside new React and Vue prototypes without rewriting the design system from scratch.",
          solution: "Crafted standard W3C Custom Elements using Stencil.js that compile to native Web Components with custom CSS variables and automatic Angular/React wrapper bindings.",
          outcome: "Unified design tokens across 12 product web applications with single-source-of-truth component distribution via private npm.",
          technologies: ["Stencil.js", "Web Components API", "Storybook", "TypeScript"],
          metrics: ["12 Integrated Apps", "3 Frameworks Supported", "Single Source of Truth"]
        }
      }
    ]
  },
  {
    id: "performance",
    title: "Performance & Web Optimization",
    items: [
      {
        id: "memory-leaks",
        title: "Memory Leak Diagnosis",
        description: "Systematically profiled and resolved complex memory leaks in long-running single-page applications, significantly improving application stability.",
        tags: ["Chrome DevTools", "Heap Snapshots", "RxJS Unsubscribes", "Memory Profiling"],
        architectureDetails: {
          challenge: "SPAs experiencing browser tab crashes and sluggish performance after several hours of continuous operator monitoring in operations centers.",
          solution: "Conducted deep Chrome Heap Snapshot comparisons to identify detached DOM trees, lingering RxJS event subscriptions, and uncollected WebSocket event listeners. Implemented automated lint rules for subscription lifecycles.",
          outcome: "Flattened heap memory usage from 1.4GB after 6h to a constant ~120MB steady-state footprint.",
          technologies: ["Chrome DevTools Memory Profiler", "RxJS takeUntilDestroyed", "V8 Engine Heap Inspection"],
          metrics: ["-91% Peak Memory Usage", "0 Crash Reports", "Stable 24/7 Runtime"]
        }
      },
      {
        id: "realtime-ui-opt",
        title: "Real-time UI Optimization",
        description: "Optimized render cycles for high-frequency data updates, ensuring maintaining 60fps across complex real-time dashboards.",
        tags: ["60 FPS", "Virtual DOM", "RequestAnimationFrame", "Canvas Rendering"],
        architectureDetails: {
          challenge: "Incoming WebSocket data streams delivering 500+ tick updates/sec causing UI thread starvation, skipped frames, and input lag.",
          solution: "Decoupled state ingestion from the rendering loop via Web Workers and ring buffers. Used requestAnimationFrame batching and Canvas hardware acceleration for high-density charts.",
          outcome: "Sustained smooth 60fps animations and instant user responsiveness even under heavy packet bursts.",
          technologies: ["Web Workers", "requestAnimationFrame", "Canvas 2D Context", "Transferable ArrayBuffers"],
          metrics: ["Solid 60 FPS Target", "500+ ticks/sec Ingestion", "Sub-16ms Frame Times"]
        }
      },
      {
        id: "signals-migration",
        title: "Angular Signals Migration & Tooling",
        description: "Led the migration to Angular Signals for fine-grained reactivity. Developed custom internal migration tooling (AST transformations) to automate the refactoring process across large codebases.",
        fullWidth: true,
        tags: ["Angular Signals", "TypeScript AST", "Reactivity", "Compiler APIs"],
        architectureDetails: {
          challenge: "Migrating hundreds of legacy Zone.js components with heavy ChangeDetection cycles to modern zoneless Angular Signals without manual breakage.",
          solution: "Authored an automated AST refactoring tool using the TypeScript Compiler API that scanned getters/setters, identified reactive primitives, and transformed them into signal() and computed().",
          outcome: "Automated 80% of repetitive migration tasks; eradicated Zone.js overhead and achieved fine-grained DOM updates.",
          technologies: ["TypeScript Compiler API", "ts-morph", "Angular Signals", "AST Transformations"],
          metrics: ["80% Automated Code Transform", "Zoneless Readiness", "Instant Change Detection"]
        }
      }
    ]
  },
  {
    id: "visualization",
    title: "Real-Time & Data Visualization",
    items: [
      {
        id: "d3-three-engine",
        title: "D3.js / Three.js Engine",
        description: "Developed robust visualization engines blending D3.js and Three.js to render massive datasets. Handled complex animation sequencing and resolved interaction conflicts smoothly.",
        tags: ["D3.js", "Three.js", "WebGL", "Data Shaders", "Force Simulation"],
        architectureDetails: {
          challenge: "Visualizing complex network topology with 50,000+ interactive nodes with dynamic force clustering without WebGL/DOM thrashing.",
          solution: "Combined D3's mathematical layout algorithms with Three.js GPU-instanced mesh rendering and custom GLSL vertex shaders, allowing interactive raycasting for node inspection.",
          outcome: "Interactive 60fps graph rendering for datasets previously crashing standard SVG-based charts.",
          technologies: ["D3-force", "Three.js InstancedMesh", "GLSL Shaders", "WebGL 2.0"],
          metrics: ["50,000+ Rendered Nodes", "GPU Instancing", "60 FPS Interactive Orbit"]
        }
      },
      {
        id: "rust-retrieval",
        title: "Rust Retrieval System",
        description: "Engineered a fast, memory-safe retrieval system in Rust (using Axum and Tokio) optimized for low-latency querying to feed real-time visual interfaces.",
        tags: ["Rust", "Axum", "Tokio", "Low Latency", "Concurrency"],
        architectureDetails: {
          challenge: "Microsecond telemetry aggregation required to serve real-time dashboard subscriptions without garbage collection pauses.",
          solution: "Built an async microservice in Rust utilizing Tokio multi-threaded runtime, Axum router, zero-copy deserialization, and lock-free ring buffers.",
          outcome: "Sub-millisecond P99 response times and zero garbage collection pauses.",
          technologies: ["Rust", "Tokio", "Axum", "Serde", "DashMap"],
          metrics: ["<1ms P99 Latency", "Zero GC Pauses", "100k req/s Throughput"]
        }
      }
    ]
  },
  {
    id: "infrastructure",
    title: "Infrastructure & DevOps",
    items: [
      {
        id: "k8s-helm",
        title: "Kubernetes & Helm",
        description: "Managed K8s clusters utilizing Helm for deployments. Implemented robust secrets management and strict network policies for secure intra-cluster communication.",
        tags: ["Kubernetes", "Helm", "Calico", "Vault", "Cloud Native"],
        architectureDetails: {
          challenge: "Ensuring zero-downtime rolling upgrades and secure container networking across multi-tenant production clusters.",
          solution: "Standardized Helm charts with parameterized environment values, automated HashiCorp Vault secrets injection, and Calico egress/ingress network policies.",
          outcome: "Reliable blue-green deployments with zero configuration drift.",
          technologies: ["Kubernetes (k8s)", "Helm 3", "HashiCorp Vault", "NetworkPolicies"],
          metrics: ["99.99% Uptime", "Automated Secrets Rotation", "Declarative GitOps"]
        }
      },
      {
        id: "gitlab-pipelines",
        title: "GitLab Pipelines",
        description: "Constructed complex, multi-stage GitLab CI/CD pipelines incorporating comprehensive deployment safety tooling and automated rollback mechanisms.",
        tags: ["GitLab CI", "Docker in Docker", "Canary Deployments", "Rollbacks"],
        architectureDetails: {
          challenge: "Slow validation steps and high risk of regressions reaching production during rapid release cycles.",
          solution: "Architected a parallelized pipeline with dynamic dependency DAGs, ephemeral preview environments per merge request, and automated canary health checks.",
          outcome: "CI verification time cut from 30min to 7min; automated instantaneous rollbacks upon telemetry error spikes.",
          technologies: ["GitLab CI/CD", "Docker", "Prometheus Webhooks", "Bash"],
          metrics: ["7min Total Pipeline Run", "Instant Rollback Safety", "Ephemeral Review Envs"]
        }
      }
    ]
  },
  {
    id: "ai-tooling",
    title: "Automation & AI Tooling",
    items: [
      {
        id: "intelligent-automation",
        title: "Intelligent Automation",
        description: "Integrated LLM agents and vision-based QA processes into testing workflows, accelerating quality assurance cycles and expanding test coverage.",
        tags: ["LLM Agents", "Computer Vision", "Playwright", "Automated QA"],
        architectureDetails: {
          challenge: "Visual regressions in complex charts and canvas components going unnoticed by standard DOM unit tests.",
          solution: "Integrated multimodal LLM agents with automated Playwright screenshot pipelines to detect subtle layout shifts, typographic misalignments, and data label collisions.",
          outcome: "Caught 95% of visual regressions before staging deployment.",
          technologies: ["Playwright", "Multimodal Vision Models", "Pixelmatch", "Node.js"],
          metrics: ["95% Visual Bug Catch Rate", "Zero Manual UI Regressions", "Automated PR Reviews"]
        }
      },
      {
        id: "backend-services",
        title: "Backend Services",
        description: "Built performant FastAPI services to serve AI models (ONNX, Qdrant) and explored MCP (Model Context Protocol) for advanced contextual processing.",
        tags: ["FastAPI", "ONNX Runtime", "Qdrant", "MCP Protocol", "Python 3.11"],
        architectureDetails: {
          challenge: "Low-latency vector similarity search and model inference integration into existing frontend client flows.",
          solution: "Implemented asynchronous FastAPI endpoints utilizing ONNX Runtime for CPU/GPU acceleration and Qdrant vector database for contextual memory embeddings.",
          outcome: "Under 15ms vector retrieval time with support for structured Model Context Protocol (MCP) tooling.",
          technologies: ["FastAPI", "Qdrant Vector DB", "ONNX Runtime", "MCP SDK"],
          metrics: ["<15ms Embedding Search", "Async Concurrency", "MCP Integrated"]
        }
      }
    ]
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    company: "ATAI Labs",
    role: "FRONTEND ENGINEER",
    period: "2021 — Present",
    location: "Hyderabad, India",
    summary: "Spearheaded frontend architecture, real-time visualization engines, and micro-frontend monorepo platforms for high-throughput enterprise systems.",
    achievements: [
      "Architected and delivered scalable Micro-frontends using modern methodologies and Nx workspace tooling.",
      "Developed complex, high-performance data visualizations and animations utilizing D3.js and Three.js.",
      "Streamlined deployment pipelines via robust CI/CD integration and rigid automated approval gates.",
      "Built reusable web components using Stencil.js for cross-framework compatibility across diverse applications.",
      "Optimized application memory utilizing Chrome heap snapshots and implemented Angular signals for state management.",
      "Managed containerized deployments interacting with Kubernetes and Helm for cloud infrastructure reliability."
    ],
    skills: ["Angular", "React", "Rust", "D3.js", "Three.js", "TypeScript", "Stencil.js", "Nx", "Kubernetes", "Helm", "GitLab CI"]
  }
];

export const WRITING_DATA: ArticleItem[] = [
  {
    id: "scaling-d3",
    title: "Scaling D3.js Visualizations for Large Datasets",
    category: "Engineering",
    platform: "Medium",
    readTime: "7 min read",
    date: "Oct 2024",
    summary: "Strategies for maintaining 60fps when rendering thousands of SVG nodes, including canvas fallbacks and worker threads.",
    content: [
      "When building data-intensive interfaces, standard SVG-based D3 visualizations often hit a severe performance bottleneck when exceeding a few thousand DOM elements. The browser's layout and paint cycles quickly degrade, dropping frame rates from a smooth 60fps down to single digits.",
      "In this retrospective, we explore three architectural strategies used in production to render up to 50,000 data points seamlessly:",
      "1. Offloading Force Simulation to Web Workers: Decouple layout calculation tick calculations from the main UI thread, passing typed Float32Array coordinates through transferable memory.",
      "2. Hybrid SVG/Canvas Layering: Render static annotations, axes, and interactive tooltips with crisp SVG, while streaming dense data points via an offscreen hardware-accelerated Canvas.",
      "3. Spatial Indexing with Quadtrees: Employ quadtree partitioning to ensure O(log n) hit detection during user hovering and cursor interaction."
    ]
  },
  {
    id: "migrating-nx-monorepo",
    title: "Migrating to an Nx Monorepo: A Retrospective",
    category: "Architecture",
    platform: "Medium",
    readTime: "9 min read",
    date: "Dec 2024",
    summary: "Lessons learned from consolidating multiple disparate repositories into a unified Nx workspace, and the impact on CI speed.",
    content: [
      "Managing disparate repositories for individual frontend modules introduces friction: version skew across shared libraries, duplicated CI configurations, and disjointed release procedures.",
      "We transitioned our entire suite of micro-frontends and shared design systems into a unified Nx Monorepo. Key highlights and results include:",
      "• Computation Caching: Rebuilding and retesting only the projects affected by a given pull request cut total pipeline duration by over 70%.",
      "• Strict Domain Boundaries: Enforced module boundary lint rules (Nx eslint tags) preventing illegal cross-domain imports and maintaining pristine architectural decoupling.",
      "• Single Version Policy: Synchronized dependencies across all internal teams, eliminating subtle runtime bugs caused by duplicate library versions."
    ]
  }
];
