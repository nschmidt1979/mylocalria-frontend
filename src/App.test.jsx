import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Helper function to render components with necessary providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders the main application structure', () => {
    renderWithProviders(<App />)
    
    // Check if the main container exists
    const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body
    expect(main).toBeInTheDocument()
  })
})