import { useRef, useState } from 'react';
// import { add, div, mul } from './calc';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false)
  const inputCanvasRef = useRef(null)
  const outputCanvasRef = useRef(null)

  const handleImage = (e) => {
    setLoading(true)
    const canvas = inputCanvasRef.current
    const ctx = canvas.getContext('2d')

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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas2.width = Math.min(canvas.width, canvas.height)
        canvas2.height = canvas2.width

        let mnx = 0
        let mxx = 0
        let mny = 0
        let mxy = 0
        for (let i = 0; i < canvas.width; i++) {
          const x = 2*i/canvas.width - 1
          for (let j = 0; j < canvas.height; j++) {
            const y = 2*j/canvas.height - 1
            const xc = (x < 0 ? -1 : 1) * Math.sqrt((1 - 1/Math.pow((x*x + y*y + 1), 2))/(1 + Math.pow(y,2)/Math.pow(x,2)))
            const yc = (y < 0 ? -1 : 1) * Math.sqrt(1 - xc*xc - 1/Math.pow((x*x + y*y + 1), 2))
            if (xc > -100 && xc < 100 && yc > -100 && yc < 100) {
              mnx = Math.min(mnx, xc)
              mny = Math.min(mny, yc)
              mxx = Math.max(mxx, xc)
              mxy = Math.max(mxy, yc)
            } else {
              continue
            }
            
            // console.log(`computed: (${xc}, ${yc})`)
            const xcl = Math.round( (xc + 1) * canvas2.width/2 )
            const ycl = Math.round( (yc + 1) * canvas2.height/2 )
            // console.log(`normal computed: (${xcl}, ${ycl})`)
            const pixel = ctx.getImageData(i, j, 1, 1)

            console.log(`original: ${x}, ${y} \ncomputed: ${xc}, ${yc}`)
            // console.log(pixel)
            // console.log(xcl, ycl)
            ctx2.putImageData(pixel, xcl, ycl)
          }
        }

        console.log(`max computed: (${mxx}, ${mxy})`)
        console.log(`min computed: (${mnx}, ${mny})`)

        const centerX = Math.round(canvas2.width/2)
        const centerY = Math.round(canvas2.height/2)
        const radius  = Math.round(canvas2.width/2)
        ctx2.beginPath()
        ctx2.arc(centerX, centerY, radius, 0, Math.PI*2)
        ctx2.stroke()
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
        <div className="inputCanvas">
          <canvas ref={inputCanvasRef} />
        </div>
        <div className="renderCanvas">
          <canvas ref={outputCanvasRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
