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
    id: 'veritas',
    index: '01',
    category: 'AI Systems · Auditability',
    title: 'VERITAS',
    titleLines: ['VERITAS'],
    description: 'Institutional grade deterministic AI evaluation and governance platform. Pure function reasoning, immutable audit logs, and byte for byte replayable pipelines enabling cryptographic accountability in high stakes decisions.',
    details: [
      '400+ automated tests, 70%+ coverage',
      '95% reduction in invalid evaluations',
      'Sub 200ms latency under high throughput',
      'FastAPI · PostgreSQL · S3 compatible storage',
    ],
    tags: ['AI', 'FastAPI', 'PostgreSQL', 'Docker', 'Python'],
    stats: [
      { value: '100%', label: 'Deterministic' },
      { value: '∞', label: 'Replayable' },
      { value: '95%', label: 'Error reduction' },
    ],
    links: [
      { label: 'Website', url: 'https://veritas-chi-ten.vercel.app/' },
      { label: 'GitHub', url: 'https://github.com/FuzzDOT/VERITAS' },
    ],
    mediaText: 'VERITAS',
  },
  {
    id: 'transformer',
    index: '02',
    category: 'ML Research · Interpretability',
    title: 'Mechanistic Transformer',
    titleLines: ['Mechanistic', 'Transformer'],
    description: 'Built a 10M+ parameter transformer language model from scratch — tokenization, positional embeddings, multi head attention, gradient based optimization — plus a full interpretability toolkit for mechanistic analysis.',
    details: [
      '10M+ parameters built from scratch',
      '30% reduction in validation loss',
      'Attention visualization & activation probing',
      'Ablation experiments across architectures',
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
    id: 'vector-db',
    index: '03',
    category: 'Systems · Infrastructure',
    title: 'Vector Database',
    titleLines: ['Distributed', 'Vector DB'],
    description: 'Designed and implemented a vector database with custom graph based ANN indexing. Sub 50ms query latency on 100K+ embeddings with concurrent query pipelines sustaining 1,000+ QPS.',
    details: [
      'Sub 50ms query latency on 100K+ embeddings',
      '1,000+ queries per second sustained',
      'Custom graph based ANN indexing',
      'RAG pipeline integration ready',
    ],
    tags: ['Systems', 'C++', 'Python', 'Distributed Systems', 'Database'],
    stats: [
      { value: '<50ms', label: 'Latency' },
      { value: '1K+', label: 'QPS' },
      { value: '100K+', label: 'Embeddings' },
    ],
    links: [
      { label: 'GitHub', placeholder: true },
    ],
    mediaText: '⊗',
  },
  {
    id: 'dr-help',
    index: '04',
    category: 'ML Research · Healthcare',
    title: 'Dr. Help',
    titleLines: ['Dr. Help'],
    description: 'Multimodal clinical decision support AI integrating text, image, and structured symptom data into unified medical reasoning. Shared preprocessing pipeline enables reliable cross modal inference.',
    details: [
      'Multimodal: text + image + structured data',
      'Unified preprocessing pipeline',
      'Clinical decision accuracy focus',
      'Ongoing research & experimentation',
    ],
    tags: ['PyTorch', 'Multimodal AI', 'Healthcare', 'Python', 'Research'],
    links: [
      { label: 'GitHub', url: 'https://github.com/FuzzDOT/drhelp' },
      { label: 'Paper W.I.P', placeholder: true },
    ],
    mediaEmoji: '🧬',
  },
  {
    id: 'smile-saviors',
    index: '05',
    category: 'ML Research · Published',
    title: 'Smile Saviors',
    titleLines: ['Smile', 'Saviors'],
    description: 'Ensemble deep learning model for oral cancer detection combining Vision Transformers and ResNet architectures. Achieved >99% classification accuracy on 950 medical images. Co authored 9-page academic paper.',
    details: [
      '>99% classification accuracy',
      '950-image balanced dataset',
      'Vision Transformers + ResNet ensemble',
      '9-page co-authored research paper',
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
    description: 'Designed and deployed 6 production grade websites using React, SCSS/BEM, and modern performance techniques. Delivered measurable improvements across load time, SEO, and user engagement.',
    details: [
      '6 production sites, 100% client approval',
      '34% avg load time reduction',
      '15% client traffic increase',
      'HTML5 · CSS3 · React · SEO',
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
    mediaText: '</>'
  },
];

export const HELLO_GIFS = [
  { src: '/1.e3e58c57.gif', alt: 'Forest Gump waves hello' },
  { src: '/2.a6927a93.gif', alt: 'The grinch turns' },
  { src: '/3.1feac4ad.gif', alt: 'Spock makes his sign' },
  { src: '/4.e0dea947.gif', alt: 'Someone beckons' },
  { src: '/5.e08aa619.gif', alt: 'Jim Carrey scotch tape' },
  { src: '/6.8b35ecac.gif', alt: 'DiCaprio hello' },
  { src: '/7.6c73d1b1.gif', alt: 'Jim Carrey bow' },
  { src: '/8.3d56f037.gif', alt: 'Max waving hello' },
  { src: '/9.2e0f7da2.gif', alt: 'Nicolas Cage saluting' },
  { src: '/10.d7d7a877.gif', alt: 'Confetti' },
  { src: '/11.c4b49577.gif', alt: 'Penguin waving' },
  { src: '/12.968a48bf.gif', alt: 'Dancing robot' },
  { src: '/13.c7c5871c.gif', alt: 'John Travolta kiss' },
];

export const HOVER_GIFS = [
  { src: '/picto1.cb395c31.gif', alt: 'WWW Diskette' },
  { src: '/picto2.40854ceb.gif', alt: 'Dwayne Johnson muscles' },
  { src: '/picto3.9b420ad1.gif', alt: 'Neo reading the matrix' },
  { src: '/picto4.f8e89447.gif', alt: 'Cat typing' },
];

export const MOODS = ['light', 'dark', 'blue', 'green', 'red', 'gold'] as const;
export type Mood = typeof MOODS[number];

export const SKILLS = {
  'Languages': ['Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript'],
  'ML & AI': ['PyTorch', 'TensorFlow', 'Transformers', 'Model Evaluation', 'Mechanistic Interp.'],
  'Backend & Systems': ['FastAPI', 'REST APIs', 'Async I/O', 'Microservices', 'PostgreSQL'],
  'Infrastructure': ['AWS (SAA-C03)', 'Docker', 'Linux', 'Git', 'CI/CD', 'S3'],
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
    company: 'Self-Employed',
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
  SECRET_CLICK_COUNT: 7, // Click the logo 7x
};
