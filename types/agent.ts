export type AgentSchema = {
  id: number;
  name: string;
  owner_name: string;
  owner_github_id?: string;
  supported_keys?: string[];
  description?: string[];
  downloads?: number;
  tasks_executed?: number;
  stars?: number;
  size?: number;
  repository: string;
  external_links?: string[];
};

export type RepositorySchema = {
  id: number;
  url: string;
  name?: string;
  owner_name?: string;
  owner_type?: string;
  owner_avatar_url?: string;
  description?: string;
  readme?: string;
  created_at?: string;
  updated_at?: string;
  size?: number;
  forks?: number;
  watchers?: number;
  open_issues?: number;
  topics?: string;
  licence?: string;
};