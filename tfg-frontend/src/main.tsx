import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/theme/theme-provider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { z } from 'zod'
import { Toaster } from '@/components/ui/toaster.tsx'

const envSchema = z.object({
  VITE_BACK_URL: z.string(),
})

envSchema.parse(import.meta.env)

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace ImportMeta {
//     interface Env extends z.infer<typeof envSchema> {}
//   }
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'online',
    },
  },
})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </ThemeProvider>,
)
