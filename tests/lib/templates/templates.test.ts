import { describe, expect, it } from 'vitest';
import { validateAppSchema } from '@/lib/builder/appSchema';
import { starterTemplates } from '@/lib/templates/templates';

describe('starterTemplates', () => {
  it('ships the first eight schema-backed LOTUS templates', () => {
    expect(starterTemplates.map((template) => template.id)).toEqual([
      'landing-page',
      'mobile-app',
      'saas-dashboard',
      'ecommerce-store',
      'booking-app',
      'ai-chatbot',
      'portfolio',
      'course-lesson-app',
    ]);
  });

  it('loads real AppSchema objects for LivePreview', () => {
    for (const template of starterTemplates) {
      expect(template.name).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.thumbnailType).toBeTruthy();
      expect(template.schema.screens.length).toBeGreaterThan(0);
      expect(validateAppSchema(template.schema)).toEqual({ valid: true, errors: [] });
    }
  });
});
