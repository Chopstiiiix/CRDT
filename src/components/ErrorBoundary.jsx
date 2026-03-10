import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#000', color: '#fff',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>!</div>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              An unexpected error occurred. Please reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', border: '1px solid rgba(74,158,255,0.4)',
                background: 'linear-gradient(135deg, rgba(74,158,255,0.3), rgba(74,158,255,0.15))',
                color: '#fff',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
