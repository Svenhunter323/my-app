import { useState } from 'react'
import SpineViewer from './components/SpineViewer'
import './App.css'

function App() {
  return (
    <div className="app">
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px 0'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #646cff, #61dafb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Spine Chest Animation
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>
          Interactive treasure chest with Spine 3.8.75 animations
        </p>
      </header>
      
      <main>
        <SpineViewer />
      </main>
      
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        padding: '20px 0',
        borderTop: '1px solid #333',
        color: '#666'
      }}>
        <p>Built with Pixi.js v8 + @pixi-spine 3.8 + React 18</p>
      </div>
    </div>
  )
}

export default App
