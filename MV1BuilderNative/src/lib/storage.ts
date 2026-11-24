import AsyncStorage from '@react-native-async-storage/async-storage';

import { validateSpecification } from '@/lib/specification';
import { BuilderProject } from '@/types/builder';

const storageKey = 'mv1-builder.projects.v1';

export async function loadProjects(): Promise<BuilderProject[]> {
  const value = await AsyncStorage.getItem(storageKey);
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((candidate) => {
    try {
      if (!candidate || typeof candidate !== 'object') return [];
      const project = candidate as BuilderProject;
      const versions = Array.isArray(project.versions)
        ? project.versions.flatMap((version) => {
            try {
              return [{
                ...version,
                previousSpecification: validateSpecification(version.previousSpecification),
                updatedSpecification: validateSpecification(version.updatedSpecification),
              }];
            } catch {
              return [];
            }
          })
        : [];
      return [{
        ...project,
        specification: validateSpecification(project.specification),
        versions,
      }];
    } catch {
      return [];
    }
  });
}

export async function saveProjects(projects: BuilderProject[]) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(projects));
}
