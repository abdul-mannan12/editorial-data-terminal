export interface Post {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string;
  readTime: number;
  featured: boolean;
  content: string;
}

export interface DailyStat {
  date: string;
  pageViews: number;
  visitors: number;
  subscribers: number;
  revenue: number;
}
