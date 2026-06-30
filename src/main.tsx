// LOTUS App Builder — Entry Point
// Providers MUST be initialized before the store is imported

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initProviders } from '@/lib/ai/initProviders'
import './index.css'
import App from './App'

// Initialize AI providers BEFORE any component imports the store
// This ensures getDefaultProviderId() can see registered providers
initProviders()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
