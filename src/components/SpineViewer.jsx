import { useEffect, useRef, useState } from 'react';
import { Application, Assets } from 'pixi.js';
import { Spine } from '@pixi-spine/all-3.8';

const SpineViewer = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const spineRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('reveal');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initPixi = async () => {
      try {
        // Create Pixi application
        const app = new Application();
        await app.init({ 
          resizeTo: canvasRef.current,
          backgroundColor: 0x1a1a1a,
          antialias: true
        });
        
        appRef.current = app;
        canvasRef.current.appendChild(app.canvas);

        // Register Spine parser with Assets system
        Assets.resolver.add(Spine.SpineParser);

        // Load Spine assets directly with atlas metadata
        const spineData = await Assets.load({
          src: '/chest/proj_1_zoggy_chest_PS_V2.json',
          metadata: { 
            spineAtlasFile: '/chest/proj_1_zoggy_chest_PS_V2.atlas.txt' 
          }
        });
        
        // Create Spine instance
        const spine = new Spine(spineData);
        spineRef.current = spine;
        
        // Center the spine in the canvas
        spine.x = app.screen.width / 2;
        spine.y = app.screen.height / 2;
        
        // Scale to fit nicely
        spine.scale.set(0.8);
        
        app.stage.addChild(spine);
        
        // Set up animation event listeners
        spine.state.addListener({
          complete: (entry) => {
            if (entry.animation.name === 'open') {
              // Auto-chain to open_idle after open completes
              spine.state.setAnimation(0, 'open_idle', true);
              setCurrentAnimation('open_idle');
            }
          }
        });

        // Start with reveal animation
        spine.state.setAnimation(0, 'reveal', false);
        setIsPlaying(true);
        setIsLoaded(true);

        // Handle window resize
        const handleResize = () => {
          if (spine && app) {
            spine.x = app.screen.width / 2;
            spine.y = app.screen.height / 2;
          }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('Failed to load Spine animation:', error);
      }
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, []);

  const playAnimation = (animationName) => {
    if (!spineRef.current) return;
    
    const spine = spineRef.current;
    const loop = animationName === 'open_idle';
    
    spine.state.setAnimation(0, animationName, loop);
    setCurrentAnimation(animationName);
    setIsPlaying(true);
    
    if (animationName === 'open') {
      // Play open sound effect if available
      try {
        const audio = new Audio('/chest/sfx_open.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Ignore audio errors if file doesn't exist
        });
      } catch (error) {
        // Ignore audio errors
      }
    } else if (animationName === 'reveal') {
      // Play reveal sound effect if available
      try {
        const audio = new Audio('/chest/sfx_reveal.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Ignore audio errors if file doesn't exist
        });
      } catch (error) {
        // Ignore audio errors
      }
    }
  };

  const togglePlayPause = () => {
    if (!spineRef.current) return;
    
    const spine = spineRef.current;
    if (isPlaying) {
      spine.state.timeScale = 0;
      setIsPlaying(false);
    } else {
      spine.state.timeScale = 1;
      setIsPlaying(true);
    }
  };

  // Add window event listener for spine:play
  useEffect(() => {
    const handleSpinePlay = (event) => {
      const animationName = event.detail?.animation || 'open';
      playAnimation(animationName);
    };

    window.addEventListener('spine:play', handleSpinePlay);
    
    return () => {
      window.removeEventListener('spine:play', handleSpinePlay);
    };
  }, []);

  return (
    <div className="spine-viewer">
      <div 
        ref={canvasRef} 
        className="canvas-container"
        style={{ 
          width: '100%', 
          height: '600px', 
          border: '2px solid #333',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a'
        }}
      />
      
      {isLoaded && (
        <div className="controls" style={{ 
          marginTop: '20px', 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => playAnimation('reveal')}
            className={`control-btn ${currentAnimation === 'reveal' ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentAnimation === 'reveal' ? '#646cff' : '#333',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Reveal
          </button>
          
          <button
            onClick={() => playAnimation('open')}
            className={`control-btn ${currentAnimation === 'open' ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentAnimation === 'open' ? '#646cff' : '#333',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Open
          </button>
          
          <button
            onClick={() => playAnimation('open_idle')}
            className={`control-btn ${currentAnimation === 'open_idle' ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentAnimation === 'open_idle' ? '#646cff' : '#333',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Open Idle
          </button>
          
          <button
            onClick={togglePlayPause}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#555',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
      
      {!isLoaded && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#888'
        }}>
          Loading Spine animation...
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>Use window.dispatchEvent(new CustomEvent('spine:play', {`{ detail: { animation: 'open' } }`})) to trigger animations programmatically</p>
        <p>Current: <strong style={{ color: '#646cff' }}>{currentAnimation}</strong></p>
      </div>
    </div>
  );
};

export default SpineViewer;