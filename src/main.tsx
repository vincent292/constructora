import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import CmsApp from './CmsApp.tsx'

const RootApp = window.location.pathname.startsWith('/cms') ? CmsApp : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
