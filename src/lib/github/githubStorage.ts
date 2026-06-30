/**
 * GitHub Storage
 * 
 * Handles saving and loading app projects to/from GitHub repositories.
 * Converts app schemas to repository structures and vice versa.
 */

import { githubClient } from "./githubClient";

export interface GitHubProject {
  repo: string;
  owner: string;
  branch: string;
  lastSynced: string;
}

/**
 * Save an app project to a GitHub repository
 */
export async function saveProjectToGitHub(
  owner: string,
  repo: string,
  schema: any,
  message = "Update app from LOTUS"
): Promise<void> {
  const content = JSON.stringify(schema, null, 2);

  try {
    // Try to get existing file to get SHA for update
    const existing = await githubClient.getFileContents(owner, repo, "lotus-app.json");
    await githubClient.createOrUpdateFile(
      owner,
      repo,
      "lotus-app.json",
      content,
      message,
      undefined,
      existing.sha
    );
  } catch {
    // File doesn't exist, create it
    await githubClient.createOrUpdateFile(
      owner,
      repo,
      "lotus-app.json",
      content,
      message
    );
  }
}

/**
 * Load an app project from a GitHub repository
 */
export async function loadProjectFromGitHub(
  owner: string,
  repo: string,
  ref?: string
): Promise<any> {
  const data = await githubClient.getFileContents(owner, repo, "lotus-app.json", ref);

  if (data.content) {
    const content = atob(data.content.replace(/\s/g, ""));
    return JSON.parse(content);
  }

  throw new Error("No app data found in repository");
}

/**
 * List all LOTUS projects in user's repos
 */
export async function listGitHubProjects(): Promise<GitHubProject[]> {
  const repos = await githubClient.listRepos(1, 100);
  const projects: GitHubProject[] = [];

  for (const repo of repos) {
    try {
      await githubClient.getFileContents(repo.owner.login, repo.name, "lotus-app.json");
      projects.push({
        repo: repo.name,
        owner: repo.owner.login,
        branch: repo.default_branch,
        lastSynced: repo.pushed_at,
      });
    } catch {
      // Not a LOTUS project, skip
    }
  }

  return projects;
}

/**
 * Save project metadata to localStorage
 */
export function saveProjectMetadata(metadata: GitHubProject): void {
  const projects = getSavedProjects();
  const existing = projects.findIndex(
    (p) => p.owner === metadata.owner && p.repo === metadata.repo
  );

  if (existing >= 0) {
    projects[existing] = metadata;
  } else {
    projects.push(metadata);
  }

  localStorage.setItem("lotus_github_projects", JSON.stringify(projects));
}

/**
 * Get saved project metadata from localStorage
 */
export function getSavedProjects(): GitHubProject[] {
  try {
    const data = localStorage.getItem("lotus_github_projects");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Remove a project from saved list
 */
export function removeSavedProject(owner: string, repo: string): void {
  const projects = getSavedProjects().filter(
    (p) => !(p.owner === owner && p.repo === repo)
  );
  localStorage.setItem("lotus_github_projects", JSON.stringify(projects));
}
