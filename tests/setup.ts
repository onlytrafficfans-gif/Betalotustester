import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubEnv('VITE_SUPABASE_URL', 'https://orghdwyqtpzfspevqhey.supabase.co');
vi.stubEnv(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Im9yZ2hkd3lxdHB6ZnNwZXZxaGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODIyNjcsImV4cCI6MjA5ODM1ODI2N30.test-signature'
);
