export interface Project {
  id: string;
  index: string;
  category: string;
  title: string;
  titleLines: string[];
  description: string;
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
    index: '02',
    category: 'Systems · C++20',
    title: 'VexDB',
    titleLines: ['VexDB'],
    description: 'High performance vector database written in C++20 from scratch. Custom HNSW graph index, SIMD accelerated distance kernels for AVX2 and NEON, two phase parallel batch construction, and a concurrent query pipeline. Not a wrapper around any existing library.',
    details: [
      '24,319 vectors/sec insert throughput on Apple Silicon',
      '4,678 QPS at 0.21ms p50 latency on 10k vectors',
      '9.5x parallel speedup over serial HNSW construction',
      'O(log n) scaling confirmed: 10x data causes only 1.6x latency increase',
    ],
    tags: ['C++20', 'SIMD', 'HNSW', 'Systems', 'Python Bindings'],
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
    description: 'Built a 10M+ parameter transformer language model from scratch including tokenization, positional embeddings, multi head attention, and gradient based optimization without relying on high level model libraries. Includes a full mechanistic interpretability toolkit.',
    details: [
      '10M+ parameters built from scratch, no high level libraries',
      '30% reduction in validation loss via ablation experiments',
      'Attention visualization, activation probing, gradient attribution',
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
    index: '01',
    category: 'AI Systems · Auditability',
    title: 'VERITAS',
    titleLines: ['VERITAS'],
    description: 'Institutional grade backend system for deterministic, auditable, and reproducible verification of financial solvency claims. Nine independently deployable microservices. Every evaluation is cryptographically traceable, version controlled, and byte for byte reproducible on demand.',
    details: [
      '427 tests passing, 71% coverage, 100% on models and schemas',
      'Tamper evident SHA 256 hash chains on every audit entry',
      'Refusal first: structured REFUSED response when evidence is missing',
      'FastAPI · PostgreSQL · MinIO · Docker · pydantic settings',
    ],
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Microservices'],
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
    id: 'dr help',
    index: '04',
    category: 'ML Research · Healthcare',
    title: 'Dr. Help',
    titleLines: ['Dr. Help'],
    description: 'Multimodal clinical decision support AI integrating text, image, and structured symptom data into unified medical reasoning. Shared preprocessing pipeline enables reliable cross modal inference and structured evaluation.',
    details: [
      'Multimodal: text + image + structured symptom data',
      'Unified preprocessing pipeline across heterogeneous inputs',
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
    id: 'smile saviors',
    index: '05',
    category: 'ML Research · Published',
    title: 'Smile Saviors',
    titleLines: ['Smile', 'Saviors'],
    description: 'Ensemble deep learning model for early oral cancer detection combining Vision Transformers and ResNet architectures. Achieved greater than 99% classification accuracy on a balanced dataset of 950 medical images. Co authored a 9 page academic paper on methodology and clinical implications.',
    details: [
      'Greater than 99% classification accuracy on 950 images',
      'Vision Transformers and ResNet ensemble architecture',
      'Advanced data augmentation to reduce overfitting on limited medical data',
      '9 page co authored paper on methodology and clinical implications',
    ],
    tags: ['Deep Learning', 'ViT', 'ResNet', 'Medical Imaging', 'Research'],
    stats: [
      { value: '>99%', label: 'Accuracy' },
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
    id: 'freelance',
    index: '06',
    category: 'Web Dev · Production',
    title: '6 Client Platforms',
    titleLines: ['6 Client', 'Platforms'],
    description: 'Designed and deployed 6 production grade websites using React, SCSS/BEM, and modern performance techniques. Delivered measurable improvements across load time, SEO, and user engagement for every client.',
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
    desc: 'Building deterministic AI evaluation engine with 400+ automated tests, 7+ backend services, and full execution traceability.',
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