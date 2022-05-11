import { create, all } from 'mathjs'

const config = {}
const math = create(all, config)

// @typedef {x: number, y: number} point

const getBaseMatrix = (points) => {
  return  [
    [points[0].x, points[1].x, points[2].x],
    [points[0].y, points[1].y, points[2].y],
    [1, 1, 1]
  ]
}

const computeMainVector = (points) => {
  const baseMatrix = getBaseMatrix(points)
  const baseVec = [points[3].x, points[3].y, 1]
  const ansVec = math.usolve(baseMatrix, baseVec)
  return ansVec
}

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

  const inputMainVector = computeMainVector(inputPoints)
  const outputMainVector = computeMainVector(outputPoints)
  const p1 = getBaseMatrix(inputPoints).map(row => row.map((cell, idx) => cell*inputMainVector[idx]))
  const p2 = getBaseMatrix(outputPoints).map(row => row.map((cell, idx) => cell*outputMainVector[idx]))
  const transformationMatrix = math.multiply(p2, math.inv(p1))

  return transformationMatrix
}

export {
  computeTransformationMatrix
}