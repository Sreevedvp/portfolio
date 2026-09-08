export interface StackItem {
  name: string;
  category: 'Frameworks' | 'Systems' | 'Visualization' | 'Real-time' | 'Architecture' | 'Infra' | 'AI & Search';
  description?: string;
  highlight?: boolean;
}

export interface ProjectSection {
  id: string;
  title: string;
  items: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  fullWidth?: boolean;
  architectureDetails?: {
    challenge: string;
    solution: string;
    outcome: string;
    technologies: string[];
    metrics?: string[];
    codeSnippet?: string;
  };
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  achievements: string[];
  skills: string[];
}

export interface ArticleItem {
  url?: string;
  publishedAt?: string;
  id: string;
  title: string;
  category: string;
  platform: string;
  readTime: string;
  date: string;
  summary: string;
  content: string[];
}
