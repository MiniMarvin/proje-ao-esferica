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
        
        
        
        // Do plano linear para o plano projetivo circular
        // const computeXc = (x, y) => (x < 0 ? -1 : 1) * Math.sqrt((1 - 1/Math.pow((x*x + y*y + 1), 2))/(1 + Math.pow(y,2)/Math.pow(x,2)))
        // const computeYc = (x, y) => (y < 0 ? -1 : 1) * Math.sqrt(1 - xc*xc - 1/Math.pow((x*x + y*y + 1), 2))
        // for (let i = 0; i < canvas.width; i++) {
        //   const x = 2*i/canvas.width - 1
        //   for (let j = 0; j < canvas.height; j++) {
        //     const y = 2*j/canvas.height - 1
        //     const xc = computeXc(x,y)
        //     const yc = computeYc(x,y)
        //     if (xc > -100 && xc < 100 && yc > -100 && yc < 100) {} else {
        //       continue
        //     }
            
        //     // console.log(`computed: (${xc}, ${yc})`)
        //     const xcl = Math.round( (xc + 1) * canvas2.width/2 )
        //     const ycl = Math.round( (yc + 1) * canvas2.height/2 )
        //     // console.log(`normal computed: (${xcl}, ${ycl})`)
        //     const pixel = ctx.getImageData(i, j, 1, 1)

        //     console.log(`original: ${x}, ${y} \ncomputed: ${xc}, ${yc}`)
        //     // console.log(pixel)
        //     // console.log(xcl, ycl)
        //     ctx2.putImageData(pixel, xcl, ycl)
        //   }
        // }

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
