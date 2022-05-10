import { useRef, useState } from 'react';
import { create, all } from 'mathjs'
import './App.css';

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

        // Draws an overlay over the canvas which can later on be used to create the click points for both the canvas computed
        const ctxOverlay = canvasOverlay.getContext('2d')
        const centerXo = Math.round(canvasOverlay.width/2)
        const centerYo = Math.round(canvasOverlay.height/2)
        const radiuso  = Math.round(canvasOverlay.width/2)
        ctxOverlay.beginPath()
        ctxOverlay.fillStyle = "#c82124"
        ctxOverlay.arc(centerXo, centerYo, radiuso, 0, Math.PI*2)
        ctxOverlay.stroke()
        ctxOverlay.closePath()
        ctxOverlay.fill()
        
        const computeX2 = (x, y) => {
          const ans1 = (
            (- Math.pow(x,2)*(Math.pow(x, 2) + Math.pow(y,2) - 1) + 
            Math.sqrt(-Math.pow(x, 4)*(Math.pow(x,2) + Math.pow(y, 2) - 1))) /
            (Math.pow(x,2)*(Math.pow(x,2) + 2*Math.pow(y,2) - 1) + Math.pow(y,2)*(Math.pow(y,2) - 1))
          )
          if (ans1 >= 0) return ans1
          return (
            (- Math.pow(x,2)*(Math.pow(x, 2) + Math.pow(y,2) - 1) - 
            Math.sqrt(-Math.pow(x, 4)*(Math.pow(x,2) + Math.pow(y, 2) - 1))) /
            (Math.pow(x,2)*(Math.pow(x,2) + 2*Math.pow(y,2) - 1) + Math.pow(y,2)*(Math.pow(y,2) - 1))
          )
        }
        const computeY2 = (x,y) => {
          return Math.pow(y, 2)/Math.pow(x,2) *computeX2(x,y)
        }
        for (let i = 0; i < canvas2.width; i++) {
          const x = 2*i/canvas2.width - 1.000001
          for (let j = 0; j < canvas2.height; j++) {
            const y = 2*j/canvas2.height - 1.000001
            const dist = Math.pow(x, 2) + Math.pow(y, 2)
            if (dist > 1) continue
            
            const originX = (x < 0 ? -1 : 1) * Math.sqrt(Math.abs(computeX2(x,y)))
            const originY = (y < 0 ? -1 : 1) * Math.sqrt(Math.abs(computeY2(x,y)))
            if (isNaN(originX) || isNaN(originY)) continue

            const xl = Math.round((originX + 1)*canvas.width/2)
            const yl = Math.round((originY + 1)*canvas.height/2)

            const pixel = ctx.getImageData(xl, yl, 1, 1)
            ctx2.putImageData(pixel, i, j)
          }
        }

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
          <canvas ref={inputCanvasRef} className="inputCanvas" />
        </div>
        <div className="renderCanvas">
          <canvas ref={outputCanvasRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
