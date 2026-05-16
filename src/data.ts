export interface Project {
  id: string;
  index: string;
  category: string;
  title: string;
  titleLines: string[];
  description: string;
  narrative?: string; // fuller prose for Projects page / Writing section
  details?: string[];
  tags: string[];
  stats?: { value: string; label: string }[];
  links: { label: string; url?: string; placeholder?: boolean }[];
  mediaText?: string;
  mediaEmoji?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'vector db',
    index: '01',
    category: 'Systems · C++20',
    title: 'VexDB',
    titleLines: ['VexDB'],
    description:
      'High performance vector database written in C++20 from scratch. Custom HNSW graph index, SIMD accelerated distance kernels for AVX2 and NEON, two phase lock free batch construction, and a concurrent query pipeline. Not a wrapper around any existing library — every layer from the storage engine to the graph index is original code.',
    narrative:
      'The goal was to understand approximate nearest neighbour search at the implementation level, not just the API level. That meant writing the neighbour selection heuristic, the layer assignment math, and the bidirectional edge shrinking algorithm directly from the 2018 Malkov & Yashunin paper. The hardest problem was parallelisation: standard HNSW construction is sequential because inserting node N requires a graph that already contains nodes 0 through N 1. The solution was a two phase approach — Phase 1 allocates all node structs under a single brief write lock in microseconds; Phase 2 runs beam search and edge connection entirely on per node mutexes, letting all worker threads operate simultaneously with no deadlock risk. The design decision to pass embeddings via an EmbeddingFetcher callback rather than a direct store reference means the index has no compile time dependency on storage — a choice that made the test suite clean and would allow GPU buffer backends without touching index code.',
    details: [
      '24,319 vectors/sec insert throughput on Apple Silicon (M series, 14 cores, dim=384)',
      '4,678 QPS at 0.21ms p50 latency on 10k vectors — 9.5x parallel speedup over serial construction',
      'O(log n) scaling confirmed experimentally: 10x data causes only 1.6x latency increase',
      'AVX2 + NEON SIMD kernels; all 28 Catch2 tests pass clean under ThreadSanitizer',
      'Python bindings (pybind11), FastAPI REST server, Prometheus metrics, Docker + CI',
    ],
    tags: ['C++20', 'SIMD', 'HNSW', 'Systems', 'Python Bindings', 'Concurrency'],
    stats: [
      { value: '24K+', label: 'Vecs/sec' },
      { value: '0.21ms', label: 'p50 latency' },
      { value: '9.5x', label: 'Parallel speedup' },
    ],
    links: [
      { label: 'GitHub', url: 'https://github.com/FuzzDOT/vexdb' },
    ],
    mediaText: '⊗',
  },
  {
    id: 'transformer',
    index: '03',
    category: 'ML Research · Interpretability',
    title: 'Mechanistic Transformer',
    titleLines: ['Mechanistic', 'Transformer'],
    description:
      'Built a 10M+ parameter transformer language model from scratch — tokenization, positional embeddings, multi head attention, gradient based optimization — without high level model libraries. Paired with a full mechanistic interpretability toolkit: attention visualization, activation probing, and gradient attribution, used to run controlled ablation experiments isolating the contribution of depth and attention heads to validation loss.',
    narrative:
      'Building the model from scratch was a prerequisite for trusting the interpretability results. If you use a library\'s attention implementation, you do not know exactly what the attention patterns mean. Writing every component made it possible to instrument precisely: probing activations at specific layers, zeroing out individual heads, and attributing gradient signal to specific components. The 30% validation loss reduction via ablation experiments was not a lucky hyperparameter search — it was the result of understanding which architectural choices were doing real work and which were not. The toolkit produces attention heatmaps, layer by layer activation distributions, and gradient attribution maps that show where the model\'s predictions come from.',
    details: [
      '10M+ parameters built from scratch, no high level libraries (raw PyTorch)',
      '30% validation loss reduction via targeted ablation experiments',
      'Attention visualization, per layer activation probing, gradient attribution',
      'Controlled scaling experiments across architectures and training regimes',
    ],
    tags: ['PyTorch', 'Transformers', 'Interpretability', 'Python', 'ML Research'],
    stats: [
      { value: '10M+', label: 'Parameters' },
      { value: '30%', label: 'Loss reduction' },
    ],
    links: [
      { label: 'GitHub', placeholder: true },
    ],
    mediaText: '∇',
  },
  {
    id: 'veritas',
    index: '02',
    category: 'AI Systems · Auditability',
    title: 'VERITAS',
    titleLines: ['VERITAS'],
    description:
      'Institutional grade backend for deterministic, auditable, reproducible verification of financial solvency claims. Nine independently deployable microservices. Every evaluation is cryptographically traceable via SHA 256 hash chains, version controlled, and byte for byte reproducible on demand. Refusal first design: the system explicitly refuses rather than producing low confidence outputs when evidence is missing.',
    narrative:
      'The core question VERITAS answers is: can an AI system make a consequential determination in a way that is fully traceable and completely reproducible months later? The answer required solving several distinct problems simultaneously. The Reasoning Engine is a pure function library — no HTTP interface, no database, no side effects — because a networked reasoning service would introduce latency, serialization overhead, and a new failure mode for the most critical part of the pipeline. The hash chain audit log makes tampering detectable without write once storage: any modification to a historical entry breaks the chain at that point. ULID identifiers rather than UUIDs preserve database index locality as records insert and make time window queries readable without parsing timestamps. The refusal first policy is a deliberate epistemic stance: a structured REFUSED response with specific missing items is more useful to downstream consumers than a degraded evaluation that looks like a real result.',
    details: [
      '427 tests passing, 71% coverage, 100% coverage on models and schemas',
      'SHA-256 hash chains on every audit entry — tampering detectable without write once storage',
      'Refusal first: structured REFUSED response when required evidence is missing',
      'Nine independently deployable services: API Gateway → Orchestrator → Reasoning Engine → Audit/Report',
      'FastAPI · PostgreSQL · MinIO · Docker · pydantic settings · structlog',
    ],
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Microservices', 'Cryptography'],
    stats: [
      { value: '9', label: 'Services' },
      { value: '427', label: 'Tests' },
      { value: '100%', label: 'Deterministic' },
    ],
    links: [
      { label: 'Website', url: 'https://veritas-chi-ten.vercel.app/' },
      { label: 'GitHub', url: 'https://github.com/FuzzDOT/VERITAS' },
    ],
    mediaText: 'VERITAS',
  },
  {
    id: 'smile saviors',
    index: '04',
    category: 'ML Research · Published',
    title: 'Smile Saviors',
    titleLines: ['Smile', 'Saviors'],
    description:
      'Ensemble deep learning framework for early oral cancer detection combining Vision Transformers and ResNet 18 architectures via soft voting. Achieved 99.5% classification accuracy (1 false positive, 0 false negatives) on a balanced dataset of 950 medical images, surpassing prior ensemble benchmarks. Co authored a 9 page academic paper covering methodology, Grad CAM analysis, and clinical implications.',
    narrative:
      'Oral carcinoma is the 16th most common cancer globally, with a survival rate that drops from 80% to under 20% if caught late. The dataset — 950 images of patients\' oral cavities captured with standard digital cameras — was deliberately chosen to simulate real world resource constraints rather than ideal clinical imaging. The key architectural decision was selecting which transformer to ensemble with ResNet 18: the Vision Transformer outperformed the Swin Transformer by 2.2% validation accuracy and achieved perfect precision, making it the stronger pairing. Soft voting over the models\' probability distributions (rather than hard voting) moderated the extreme predictions that noisy medical images produce. Grad CAM visualizations confirmed both models were attending to clinically meaningful regions, not imaging artifacts.',
    details: [
      '99.5% ensemble accuracy — 1 false positive, 0 false negatives on 950 images',
      'ViT + ResNet 18 soft voting ensemble; ViT selected over Swin Transformer after controlled eval',
      'Advanced data augmentation (flipping, rotation, Gaussian blur, brightness) to reduce overfitting',
      '9 page co authored paper with Grad CAM analysis and clinical implications',
    ],
    tags: ['Deep Learning', 'ViT', 'ResNet', 'Medical Imaging', 'Research'],
    stats: [
      { value: '99.5%', label: 'Accuracy' },
      { value: '950', label: 'Images' },
      { value: '9pg', label: 'Paper' },
    ],
    links: [
      { label: 'Poster', url: 'https://drive.google.com/file/d/1FjBaf4ET1Lxd6D_29N0LE3WuTTTSw2aT/view?usp=sharing' },
      { label: 'Paper', url: 'https://drive.google.com/file/d/19OdhiNO8CBlDEzgTXQRiYhLCms5U374n/view' },
      { label: 'GitHub', url: 'https://github.com/Mehta-AIMLResearchBootcamp24/Smile-Savior' },
    ],
    mediaText: '○',
  },
  {
    id: 'ordin',
    index: '05',
    category: 'AI Systems · Infrastructure',
    title: 'ORDIN',
    titleLines: ['ORDIN'],
    description:
      'Production grade FastAPI backend for AI native task orchestration and scheduling — built to determine what users should work on next and schedule it against their actual calendar availability. Privacy first calendar integration (event metadata discarded immediately, only busy/free blocks stored), explicit task state machine, per request structured logging, and Kubernetes ready infrastructure designed as a foundation for an autonomous AI scheduling engine.',
    narrative:
      'The interesting problem in ORDIN is not CRUD — it is making the system a trustworthy foundation for an AI to act on. That means three things: the authentication layer must disappear entirely so route handlers receive a typed UserContext and never think about tokens; calendar data must be privacy preserving by architecture (the sync pipeline extracts time ranges and discards everything else before writing to the database); and the availability computation endpoint must be clean enough for a scheduling engine to call without any post processing. The explicit task state machine — dedicated transition endpoints rather than a generic PATCH — puts state logic on the server where it can be logged semantically and extended with side effects without client changes.',
    details: [
      'Privacy first calendar sync: event titles, attendees, and metadata discarded — only busy blocks stored',
      'Explicit state machine with typed transition endpoints (start, complete, archive) — not a generic PATCH',
      'Firebase Auth with automatic UserContext injection — zero auth boilerplate in route handlers',
      'Structured JSON logging via structlog with request scoped context binding throughout',
      'Kubernetes ready: liveness/readiness probes, multi stage Docker builds, fail fast config validation',
    ],
    tags: ['Python', 'FastAPI', 'Firebase', 'Firestore', 'Docker', 'Kubernetes'],
    stats: [
      { value: '7', label: 'API layers' },
      { value: '0', label: 'Auth boilerplate' },
    ],
    links: [
      { label: 'GitHub', url: 'https://github.com/FuzzDOT/ORDIN' },
    ],
    mediaEmoji: '⚙️',
  },
  {
    id: 'harvest',
    index: '06',
    category: 'Hackathon · Full Stack',
    title: 'HARVEST',
    titleLines: ['HARVEST'],
    description:
      'End to end crop planning platform combining agronomic rules, weather data, and profitability modeling to recommend what to plant next. Built during a hackathon with a 4 person team. Supports short term monthly recommendations and 12 month crop rotation plans, with revenue estimates based on land size and market prices.',
    narrative:
      'HARVEST was built under hackathon time pressure with a clear goal: ship a complete, demo ready workflow from backend scoring logic to an interactive frontend in one sitting. The backend runs profit, ROI, and ranking pipelines over crop eligibility data filtered by region and season, with fertilizer matching and forecast based weather handling layered on top. The team divided ownership cleanly — backend and ML to Faaz, frontend to Evan and Ayaan, data management to Zhengyao — which let each layer move independently.',
    details: [
      'Short term (monthly) and long term (12 month rotation) planning modes',
      'Revenue estimate engine based on selected crop, land area, and market prices',
      'Forecast based and historical normals based weather handling',
      'FastAPI backend · React + TypeScript frontend · pandas data pipelines',
    ],
    tags: ['FastAPI', 'React', 'TypeScript', 'Python', 'pandas', 'Hackathon'],
    links: [
      { label: 'GitHub', url: 'https://github.com/FuzzDOT/HARVEST' },
    ],
    mediaEmoji: '🌾',
  },
  {
    id: 'dr help',
    index: '07',
    category: 'ML Research · Healthcare',
    title: 'Dr. Help',
    titleLines: ['Dr. Help'],
    description:
      'Multimodal clinical decision support AI integrating text, image, and structured symptom data into unified medical reasoning. A shared preprocessing pipeline enables reliable cross modal inference across heterogeneous inputs, with clinical decision accuracy as the primary evaluation metric. Ongoing structured experimentation.',
    details: [
      'Multimodal: text + image + structured symptom data through a unified preprocessing pipeline',
      'Cross modal inference across heterogeneous input types',
      'Clinical decision accuracy as primary evaluation metric',
      'Ongoing structured experimentation and iterative research',
    ],
    tags: ['PyTorch', 'Multimodal AI', 'Healthcare', 'Python', 'Research'],
    links: [
      { label: 'GitHub Release soon', placeholder: true },
      { label: 'Paper WIP', placeholder: true },
    ],
    mediaEmoji: '🧬',
  },
  {
    id: 'freelance',
    index: '08',
    category: 'Web Dev · Production',
    title: '6 Client Platforms',
    titleLines: ['6 Client', 'Platforms'],
    description:
      'Designed and deployed 6 production grade websites using React, SCSS/BEM, and modern performance techniques. Delivered measurable improvements across load time, SEO, and user engagement for every client.',
    details: [
      '6 production sites, 100% client approval',
      '34% average page load time reduction',
      '15% client traffic increase via SEO and accessibility improvements',
      'HTML5, CSS3, React, mobile responsiveness',
    ],
    tags: ['React', 'SCSS', 'JavaScript', 'SEO', 'Performance'],
    stats: [
      { value: '34%', label: 'Faster loads' },
      { value: '+15%', label: 'Traffic growth' },
      { value: '6', label: 'Live sites' },
    ],
    links: [
      { label: 'Various clients', placeholder: true },
    ],
    mediaText: '</>',
  },
];

// ─── Writing / Papers ────────────────────────────────────────────────────────
// PDF_PATH: Replace the value below with your final hosted PDF URL when ready.
// During development this points to the oral cancer paper as a placeholder.
export const WRITING_PAPERS = [
  {
    id: 'oral cancer',
    title: 'An Enhanced Hybrid Diagnostic Deep Learning Framework Using Ensemble ViT ResNets for Oral Carcinoma Detection',
    subtitle: 'MehtA+ Research · 2024-2025',
    description:
      'A hybrid deep learning framework combining Vision Transformers and CNNs via soft voting ensemble to classify oral squamous carcinoma images. Achieved 99.5% validation accuracy — 1 false positive, 0 false negatives — on 950 medical images. Includes Grad CAM analysis confirming clinically meaningful feature attribution.',
    // ↓↓↓ CHANGE THIS PATH to your final PDF URL before deploying ↓↓↓
    pdfUrl: '/OralCancer.pdf',
    // ↑↑↑ ─────────────────────────────────────────────────────── ↑↑↑
    pageCount: 9,
    tags: ['Deep Learning', 'ViT', 'ResNet', 'Medical Imaging', 'Ensemble'],
    links: [
      { label: 'Paper', url: 'https://drive.google.com/file/d/19OdhiNO8CBlDEzgTXQRiYhLCms5U374n/view' },
      { label: 'Poster', url: 'https://drive.google.com/file/d/1FjBaf4ET1Lxd6D_29N0LE3WuTTTSw2aT/view?usp=sharing' },
    ],
  },
  // Add future papers here — interpretability post goes here when published:
  // {
  //   id: 'interpretability',
  //   title: 'Mechanistic Interpretability in a 10M Parameter Transformer: What I Found',
  //   pdfUrl: '/assets/interpretability.pdf',  // ← SET THIS PATH
  //   pageCount: 0,
  //   ...
  // },
];

export const HELLO_GIFS = [
  { src: '/assets/1.e3e58c57.gif', alt: 'Forest Gump waves hello' },
  { src: '/assets/2.a6927a93.gif', alt: 'The grinch turns' },
  { src: '/assets/3.1feac4ad.gif', alt: 'Spock makes his sign' },
  { src: '/assets/4.e0dea947.gif', alt: 'Someone beckons' },
  { src: '/assets/5.e08aa619.gif', alt: 'Jim Carrey scotch tape' },
  { src: '/assets/6.8b35ecac.gif', alt: 'DiCaprio hello' },
  { src: '/assets/7.6c73d1b1.gif', alt: 'Jim Carrey bow' },
  { src: '/assets/8.3d56f037.gif', alt: 'Max waving hello' },
  { src: '/assets/9.2e0f7da2.gif', alt: 'Nicolas Cage saluting' },
  { src: '/assets/10.d7d7a877.gif', alt: 'Confetti' },
  { src: '/assets/11.c4b49577.gif', alt: 'Penguin waving' },
  { src: '/assets/12.968a48bf.gif', alt: 'Dancing robot' },
  { src: '/assets/13.c7c5871c.gif', alt: 'John Travolta kiss' },
];

export const HOVER_GIFS = [
  { src: '/assets/picto1.cb395c31.gif', alt: 'WWW Diskette' },
  { src: '/assets/picto2.40854ceb.gif', alt: 'Dwayne Johnson muscles' },
  { src: '/assets/picto3.9b420ad1.gif', alt: 'Neo reading the matrix' },
  { src: '/assets/picto4.f8e89447.gif', alt: 'Cat typing' },
];

export const MOODS = ['light', 'dark', 'blue', 'green', 'red', 'gold'] as const;
export type Mood = typeof MOODS[number];

export const SKILLS = {
  'Languages': ['Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript'],
  'ML & AI': ['PyTorch', 'TensorFlow', 'Transformers', 'Model Evaluation', 'Mechanistic Interp.'],
  'Backend & Systems': ['FastAPI', 'REST APIs', 'Async I/O', 'Microservices', 'PostgreSQL'],
  'Infrastructure': ['AWS (SAP-C02)', 'Docker', 'Linux', 'Git', 'CI/CD', 'S3'],
};

export const EXPERIENCE = [
  {
    period: 'Jun 2026 – Aug 2026',
    role: 'AI Developer',
    company: 'NSF ExLAIM Research Internship',
    location: 'Raleigh, NC',
    desc: 'Selected for competitive NSF funded program (<30 participants). Evaluated LLMs on 10,000+ sample datasets; built data pipelines analyzing 100+ structured interviews.',
  },
  {
    period: 'Dec 2025 – Present',
    role: 'CEO & Founder',
    company: 'Adventura Labs',
    location: 'Pittsburgh, PA',
    desc: 'Building AI driven software products. Leading product, engineering, fundraising, and go to market strategy.',
  },
  {
    period: 'Dec 2025 – Present',
    role: 'Founder & Systems Architect',
    company: 'VERITAS',
    location: 'Pittsburgh, PA',
    desc: 'Building deterministic AI evaluation engine with 427 automated tests, 9 backend services, cryptographic audit trails, and full execution traceability.',
  },
  {
    period: 'Feb 2024 – Present',
    role: 'Freelance Software Developer',
    company: 'Self Employed',
    location: 'West Chester, PA',
    desc: '6 production websites, 34% avg page load reduction, 15% traffic increase. React, SCSS, SEO.',
  },
];

export const AWARDS = [
  { title: 'SteelHacks — Social Media & Promotions Lead', org: 'University of Pittsburgh', year: '2025' },
  { title: 'CS Club YouTube — 1K+ subscribers', org: 'University of Pittsburgh', year: '2025' },
  { title: 'MetaCTF — 2nd & 4th Place', org: 'MetaCTF', year: '2025' },
  { title: '2nd Place — Philly Codefest', org: 'Drexel University', year: '2025' },
];

// Easter eggs
export const EASTER_EGGS = {
  KONAMI: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
  SECRET_CLICK_COUNT: 7,
};