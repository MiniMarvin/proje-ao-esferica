import { useRef, useState } from 'react';
import './App.css';
import { getCircleToPlaneTransformation, getImageCoordinates, getNormalizedCoordinate } from './transform';

// const config = { }
// const math = create(all, config)

const inputPoints = []
const outputPoints = []
let inputPointsIndex = 0
let outputPointsIndex = 0
let inputClickHandler = null
let outputClickHandler = null

const drawAffinity = (canvas, ctx) => {
  const centerX = Math.round(canvas.width/2)
  const centerY = Math.round(canvas.height/2)
  const radius  = Math.round(canvas.width/2)
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI*2)
  ctx.stroke()
  ctx.closePath()
}

/**
 * 
 * @param {any} canvas 
 * @param {point[]} points 
 */
const drawPoints = (canvas, points) => {
console.log(points)
const ctx = canvas.getContext('2d')
ctx.clearRect(0, 0, canvas.width, canvas.height)
const colors = ['#dd0000','#00dd00', '#0000dd', '#dd00dd', '#dddd00']
let npoints = points

npoints.forEach((point, idx) => {
  const radius  = 5
  ctx.beginPath()
  ctx.arc(point.x, point.y, radius, 0, Math.PI*2)
  ctx.fillStyle = colors[idx]
  ctx.fill()
  ctx.closePath()
})
}

const handleClick = (canvasRef, canvasIndex) => {
  return (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    console.log(`clicked at: (${x}, ${y})`)
    if (canvasIndex === 0) {
      if (inputPoints.length > 3) {
        inputPoints[inputPointsIndex] = {x, y}
      } else {
        inputPoints.push({x,y})
      }

      drawPoints(canvas, inputPoints)
      // setInputPoints(newInput)
      if (inputPointsIndex === 3) inputPointsIndex = 0
      else inputPointsIndex += 1
    } else {
      if (outputPoints.length > 3) {
        outputPoints[outputPointsIndex] = {x, y}
      } else {
        outputPoints.push({x,y})
      }

      drawPoints(canvas, outputPoints)
      // setOutputPoints(newOutput)
      if (outputPointsIndex === 3) outputPointsIndex = 0
      else outputPointsIndex += 1
    }
  }
}

function App() {
  const [loading, setLoading] = useState(false)
  const inputCanvasRef = useRef(null)
  const outputCanvasRef = useRef(null)
  const inputCanvasOverlayRef = useRef(null)
  const outputCanvasOverlayRef = useRef(null)

  const drawOutputImage = (canvasRef, canvas2Ref) => {
    const canvas = canvasRef.current
    const canvas2 = canvas2Ref.current
    const ctx = canvas.getContext('2d')
    const ctx2 = canvas2.getContext('2d')
    ctx2.clearRect(0, 0, canvas.width, canvas.height)

    const normalizedInput = inputPoints.length < 4 ? 
      null : 
      inputPoints.map(point => {
        return {
          x: getNormalizedCoordinate(point.x, canvas.width), 
          y: getNormalizedCoordinate(point.y, canvas.height)
        }})
    const normalizedOutput = outputPoints.length < 4 ? 
      null : 
      outputPoints.map(point => ({
        x: getNormalizedCoordinate(point.x, canvas2.width), 
        y: getNormalizedCoordinate(point.y, canvas2.height)
      }))
    const defaultTransform = getCircleToPlaneTransformation(normalizedInput, normalizedOutput)
    // TODO: modify directly on that object to avoid rerender on the DOM without need.
    const inputImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const outputImageDataBuffer = Array.from(ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data)

    for (let i = 0; i < canvas2.width; i++) {
      const x = getNormalizedCoordinate(i, canvas2.width)
      for (let j = 0; j < canvas2.height; j++) {
        const y = getNormalizedCoordinate(j, canvas2.height)
        const dist = Math.pow(x, 2) + Math.pow(y, 2)
        if (dist > 1) continue
        const origin = defaultTransform({x, y})
        // console.log(origin)
        if (isNaN(origin.x) || isNaN(origin.y)) continue
        const xl = getImageCoordinates(origin.x, canvas.width)
        const yl = getImageCoordinates(origin.y, canvas.height)

        // TODO: iterate over image data virtually
        if (xl !== null && yl != null) {
          // const pixel = ctx.getImageData(xl, yl, 1, 1)
          // ctx2.putImageData(pixel, i, j)
          const inputPos = 4*(yl*canvas.width + xl)
          const outputPos = 4*(j*canvas2.width + i)
          for (let i = 0; i < 4; i++) {
            outputImageDataBuffer[outputPos + i] = inputImageData.data[inputPos + i]
          }
        }
      }
    }
    const imageData = new ImageData(Uint8ClampedArray.from(outputImageDataBuffer), canvas2.width, canvas2.height)
    ctx2.putImageData(imageData, 0, 0)

    drawAffinity(canvas2, ctx2)
  }

  const handleImage = (e) => {
    setLoading(true)
    const canvas = inputCanvasRef.current
    const ctx = canvas.getContext('2d')

    //------------------------------------------------------
    // Test to check if the overlay is ok
    const canvasOverlay = inputCanvasOverlayRef.current
    const canvas2Overlay = outputCanvasOverlayRef.current
    
    if (inputClickHandler === null) {
      inputClickHandler = handleClick(inputCanvasOverlayRef, 0)
    }
    else {
      inputCanvasOverlayRef.current.removeEventListener('click', inputClickHandler)
      while (inputPoints.length > 0) inputPoints.pop()
    }
    
    if (outputClickHandler === null) {
      outputClickHandler = handleClick(outputCanvasOverlayRef, 1)
    }
    else {
      outputCanvasOverlayRef.current.removeEventListener('click', outputClickHandler)
      while (outputPoints.length > 0) outputPoints.pop()
    }

    inputCanvasOverlayRef.current.addEventListener('click', inputClickHandler)
    outputCanvasOverlayRef.current.addEventListener('click', outputClickHandler)
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

        // drawOutputImage(canvas, canvas2)
        // TODO: support multiple image transitions
        // Draw affinity line
        drawAffinity(canvas2, ctx2)
        canvas2Overlay.width = canvas2.width
        canvas2Overlay.height = canvas2.height
        setLoading(false)
      }
      img.src = event.target.result

    }
    reader.readAsDataURL(e.target.files[0])
  }

  

  const reRender = () => {
    console.log('start rendering...')
    setLoading(true)
    drawOutputImage(inputCanvasRef, outputCanvasRef)
    setLoading(false)
    console.log('finished rendering...')
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
      <div className="inputZone">
        <button onClick={reRender}>Atualizar Imagem</button>
      </div>
    </div>
  );
}

export default App;
