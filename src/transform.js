import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

// @typedef {x: number, y: number} point

/**
 * 
 * @param {point[]} inputPoints 
 * @param {point[]} outputPoints 
 * @returns 
 */
const computeTransformationMatrix = (inputPoints, outputPoints) => {
  if (inputPoints.length !== outputPoints.length || inputPoints.length === 0) {
    throw Error("Input and output points doesn't match in size.")
  }

  const equationsMatrix = inputPoints.map((_, idx) => [
    [inputPoints[idx].x, inputPoints[idx].y, 1, 0, 0, 0, -outputPoints[idx].x*inputPoints[idx].x, -outputPoints[idx].x*inputPoints[idx].y],
    [0, 0, 0, inputPoints[idx].x, inputPoints[idx].y, 1, -outputPoints[idx].y*inputPoints[idx].x, -outputPoints[idx].y*inputPoints[idx].y]
  ]).reduce(((equations, curr) => equations + curr, []))

  const resultsMatrix = outputPoints.reduce((values, point) => values + [point.x, point.y],[])
  const transformationElements = math.usolve(equationsMatrix, resultsMatrix) + [1]
  const transformationMatrix = [0,1,2].map(start => transformationElements.slice(3*start, 3*start + 3))
  return transformationMatrix
}

export {
  computeTransformationMatrix
}