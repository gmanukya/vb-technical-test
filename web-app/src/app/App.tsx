import { ThemeProvider } from './providers/ThemeProvider'
import { CatalogPage } from '../features/catalog/CatalogPage'

export default function App() {
  return (
    <ThemeProvider>
      <CatalogPage />
    </ThemeProvider>
  )
}
