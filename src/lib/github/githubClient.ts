/**
 * GitHub Client
 * 
 * Handles all GitHub API interactions for the GitHub panel.
 * Uses the GitHub REST API for repository management.
 */

const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface CreateRepoOptions {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

class GitHubClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("github_token", token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("github_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("github_token");
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error("GitHub token not set");
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  // User
  async getUser() {
    return this.request("/user");
  }

  // Repositories
  async listRepos(page = 1, perPage = 30): Promise<GitHubRepo[]> {
    return this.request(`/user/repos?sort=updated&page=${page}&per_page=${perPage}`);
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request(`/repos/${owner}/${repo}`);
  }

  async createRepo(options: CreateRepoOptions): Promise<GitHubRepo> {
    return this.request("/user/repos", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async deleteRepo(owner: string, repo: string): Promise<void> {
    await this.request(`/repos/${owner}/${repo}`, {
      method: "DELETE",
    });
  }

  // Branches
  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.request(`/repos/${owner}/${repo}/branches`);
  }

  // Commits
  async listCommits(
    owner: string,
    repo: string,
    branch?: string,
    perPage = 30
  ): Promise<GitHubCommit[]> {
    const params = new URLSearchParams({ per_page: String(perPage) });
    if (branch) params.append("sha", branch);
    return this.request(`/repos/${owner}/${repo}/commits?${params}`);
  }

  async createCommit(
    owner: string,
    repo: string,
    message: string,
    tree: string,
    parents: string[]
  ): Promise<any> {
    return this.request(`/repos/${owner}/${repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree, parents }),
    });
  }

  // Issues
  async listIssues(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open"
  ): Promise<GitHubIssue[]> {
    return this.request(`/repos/${owner}/${repo}/issues?state=${state}`);
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string
  ): Promise<GitHubIssue> {
    return this.request(`/repos/${owner}/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify({ title, body }),
    });
  }

  // Files
  async getFileContents(owner: string, repo: string, path: string, ref?: string): Promise<any> {
    const params = ref ? `?ref=${ref}` : "";
    return this.request(`/repos/${owner}/${repo}/contents/${path}${params}`);
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string,
    sha?: string
  ): Promise<any> {
    const body: any = {
      message,
      content: btoa(content),
    };
    if (branch) body.branch = branch;
    if (sha) body.sha = sha;

    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // Pull Requests
  async listPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open"
  ): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/pulls?state=${state}`);
  }

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      await this.request("/user");
      return true;
    } catch {
      return false;
    }
  }
}

export const githubClient = new GitHubClient();

// Utility to check if token format is valid
export function isValidGitHubToken(token: string): boolean {
  // GitHub tokens are typically 40-char hex strings (classic) or start with ghp_, github_pat_, etc.
  return /^ghp_[a-zA-Z0-9]{36,}$/.test(token) ||
    /^github_pat_[a-zA-Z0-9_]{22,}$/.test(token) ||
    /^[a-f0-9]{40}$/.test(token);
}

// Get token scopes
export async function getTokenScopes(): Promise<string[]> {
  const token = githubClient.getToken();
  if (!token) return [];

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const scopesHeader = response.headers.get("x-oauth-scopes");
    return scopesHeader ? scopesHeader.split(", ").map((s) => s.trim()) : [];
  } catch {
    return [];
  }
}

export async function verifyToken(): Promise<any> {
  return githubClient.getUser();
}

export async function listRepos(): Promise<GitHubRepo[]> {
  return githubClient.listRepos(1, 100);
}

export async function createRepo(name: string, description?: string, isPrivate = false): Promise<GitHubRepo> {
  return githubClient.createRepo({ name, description, private: isPrivate, auto_init: true });
}

export async function exportToRepo(owner: string, repo: string, files: Array<{ path: string; content: string }>): Promise<void> {
  for (const file of files) {
    await githubClient.createOrUpdateFile(owner, repo, file.path, file.content, `Export ${file.path} from LOTUS`);
  }
}

export async function importFromRepo(owner: string, repo: string): Promise<Array<{ path: string; content: string }>> {
  const file = await githubClient.getFileContents(owner, repo, 'lotus-app.json');
  return [{ path: 'lotus-app.json', content: atob(file.content.replace(/\s/g, '')) }];
}
