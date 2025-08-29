import { useEffect, useRef, useState } from 'react';
import { Application, Assets } from 'pixi.js';
import { Spine } from '@pixi-spine/runtime-3.8';
import '@pixi-spine/loader-3.8';  // Auto-registers the Spine loader with Pixi

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
        // Ensure canvasRef is defined and available before initializing PixiJS
        if (!canvasRef.current) {
          console.error('Canvas reference is not available.');
          return;
        }

        console.log('Canvas reference found, initializing PixiJS...', canvasRef.current);

        // Create PixiJS application
        const app = new Application({
          // Use the container div as the resize target (canvasRef.current)
          resizeTo: canvasRef.current,
          backgroundColor: 0x1a1a1a,
          antialias: true
        });

        appRef.current = app;
        // Append the PixiJS canvas to the container div
        canvasRef.current.appendChild(app.view);

        // Load Spine assets directly with atlas metadata
        const parsed = await Assets.load([
          '/chest/proj_1_zoggy_chest_PS_V2.json', // Spine JSON file
          '/chest/proj_1_zoggy_chest_PS_V2.atlas.txt' // Atlas file
        ]);

        // Correct the way to handle Spine JSON loading (Spine 3.8.75 format)
        const spineData = parsed[0];  // The first file in the parsed array is the Spine JSON data

        // Create Spine instance with the loaded data
        const spine = new Spine(spineData);
        spineRef.current = spine;

        // Position the spine in the center of the canvas
        spine.x = app.screen.width / 2;
        spine.y = app.screen.height / 2;

        // Scale the animation to fit the canvas
        spine.scale.set(0.8);

        // Add the spine instance to the PixiJS stage
        app.stage.addChild(spine);

        // Set up animation event listeners (auto-chain to next animation)
        spine.state.addListener({
          complete: (entry) => {
            if (entry.animation.name === 'open') {
              // Auto-chain to open_idle after open completes
              spine.state.setAnimation(0, 'open_idle', true); // Loop animation
              setCurrentAnimation('open_idle');
            }
          }
        });

        // Start with the initial 'reveal' animation
        spine.state.setAnimation(0, 'reveal', false); // 'false' means do not loop
        setIsPlaying(true);
        setIsLoaded(true);

        // Handle resizing of the window
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
    const loop = animationName === 'open_idle'; // Loop the open_idle animation

    // Set the animation
    spine.state.setAnimation(0, animationName, loop);
    setCurrentAnimation(animationName);
    setIsPlaying(true);

    // Play sound effects based on the animation
    if (animationName === 'open') {
      try {
        const audio = new Audio('/chest/sfx_open.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (error) {}
    } else if (animationName === 'reveal') {
      try {
        const audio = new Audio('/chest/sfx_reveal.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (error) {}
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
        <p>{`Use window.dispatchEvent(new CustomEvent("spine:play", { detail: { animation: "open" } })) to trigger animations programmatically`}</p>
        <p>Current: <strong style={{ color: '#646cff' }}>{currentAnimation}</strong></p>
      </div>
    </div>
  );
};

export default SpineViewer;
