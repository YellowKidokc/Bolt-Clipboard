export interface Clip {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  created_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  name: string;
  category: string;
  content: string;
  shortcut_key: string | null;
  created_at: string;
  tags?: Tag[];
}

export interface Link {
  id: string;
  user_id: string;
  page_id: string;
  title: string;
  url: string;
  domain: string | null;
  category: string;
  created_at: string;
  tags?: Tag[];
}

export interface Hotkey {
  id: string;
  user_id: string;
  combo: string;
  action: 'fire_prompt' | 'copy_prompt' | 'navigate' | 'toggle_ai' | 'quick_clip' | 'run_scrape' | 'run_research';
  target?: string;
  label: string;
  payload?: string;
  created_at: string;
}

export interface CustomPage {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  page_type: 'link_collection' | 'text_collection' | 'embed' | 'custom_html';
  config: Record<string, unknown>;
  sort_order: number;
  created_at: string;
}

export interface Settings {
  openai_api_key?: string;
  mcp_token?: string;
  theme?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ResearchResult {
  topic: string;
  sources: Array<{
    url: string;
    title: string;
    content: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
  }>;
  synthesis: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}
