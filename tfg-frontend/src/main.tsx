import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { ThemeSwitcher } from '@/components/theme-switcher.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeSwitcher />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
