import { useEffect, useRef, useState } from 'react';
import './App.css';
import { getCircleToPlaneTransformation, getImageCoordinates, getNormalizedCoordinate } from './transform';

// const config = { }
// const math = create(all, config)

function App() {
  const [loading, setLoading] = useState(false)
  const inputCanvasRef = useRef(null)
  const outputCanvasRef = useRef(null)
  const inputCanvasOverlayRef = useRef(null)
  const outputCanvasOverlayRef = useRef(null)

  const handleImage = (e) => {
    setLoading(true)
    const canvas = inputCanvasRef.current
    const ctx = canvas.getContext('2d')

    //------------------------------------------------------
    // Test to check if the overlay is ok
    const canvasOverlay = inputCanvasOverlayRef.current
    const canvas2Overlay = outputCanvasOverlayRef.current
    inputCanvasOverlayRef.current.addEventListener('click', handleClick(inputCanvasOverlayRef))
    outputCanvasOverlayRef.current.addEventListener('click', handleClick(outputCanvasOverlayRef))
    //------------------------------------------------------

    const canvas2 = outputCanvasRef.current
    const ctx2 = canvas2.getContext('2d')
    
    var reader = new FileReader()
    reader.onload = (event) => {
      // first canvas
      var img = new Image()
      img.onload = () => {
        // defines the width of the window for small screens and 512 for big screens
        const computedWidth = Math.min((window.innerWidth - 40), 512)
        const relation = computedWidth/img.width
        canvas.width = computedWidth
        canvas.height = img.height * relation
        canvasOverlay.width = canvas.width
        canvasOverlay.height = canvas.height
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas2.width = Math.min(canvas.width, canvas.height)
        canvas2.height = canvas2.width
        
        for (let i = 0; i < canvas2.width; i++) {
          const x = getNormalizedCoordinate(i, canvas2.width)
          for (let j = 0; j < canvas2.height; j++) {
            const y = getNormalizedCoordinate(j, canvas2.height)
            const dist = Math.pow(x, 2) + Math.pow(y, 2)
            if (dist > 1) continue
            
            const defaultTransform = getCircleToPlaneTransformation(null, null)
            const origin = defaultTransform({x, y})
            if (isNaN(origin.x) || isNaN(origin.y)) continue

            const xl = getImageCoordinates(origin.x, canvas.width)
            const yl = getImageCoordinates(origin.y, canvas.height)

            const pixel = ctx.getImageData(xl, yl, 1, 1)
            ctx2.putImageData(pixel, i, j)
          }
        }

        canvas2Overlay.width = canvas2.width
        canvas2Overlay.height = canvas2.height

        // Draw affinity line
        const centerX = Math.round(canvas2.width/2)
        const centerY = Math.round(canvas2.height/2)
        const radius  = Math.round(canvas2.width/2)
        ctx2.beginPath()
        ctx2.arc(centerX, centerY, radius, 0, Math.PI*2)
        ctx2.stroke()
        ctx2.closePath()
        setLoading(false)
      }
      img.src = event.target.result

    }
    reader.readAsDataURL(e.target.files[0])
  }

  const handleClick = (canvasRef) => {
    return (event) => {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      console.log(`clicked at: (${x}, ${y})`)
    }
  }

  return (
    <div className="app">
      {/* TODO: add the file input button */}
      <div className="inputZone">
        <input type="file" onChange={handleImage} accept="image/*" />
      </div>
      {loading ? <span>loading...</span> : null}
      <div className="canvasZone">
        <div className="inputCanvasContainer">
          <canvas ref={inputCanvasOverlayRef} className='inputCanvasOverlay' />
          <canvas ref={inputCanvasRef} className='inputCanvas' />
        </div>
        <div className="renderZone">
          <canvas ref={outputCanvasOverlayRef} className="outputCanvasOverlay" />
          <canvas ref={outputCanvasRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
