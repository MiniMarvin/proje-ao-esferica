import { create, all } from 'mathjs'

const config = {}
const math = create(all, config)

// @typedef {x: number, y: number} point

const getBaseMatrix = (points) => {
  return [
    [points[0].x, points[1].x, points[2].x],
    [points[0].y, points[1].y, points[2].y],
    [1, 1, 1]
  ]
}

const getMainVector = (points) => {
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
const getTransformationMatrix = (inputPoints, outputPoints) => {
  if (inputPoints.length !== outputPoints.length || inputPoints.length === 0) {
    throw Error("Input and output points doesn't match in size.")
  }

  const inputMainVector = getMainVector(inputPoints)
  const outputMainVector = getMainVector(outputPoints)
  const p1 = getBaseMatrix(inputPoints).map(row => row.map((cell, idx) => cell * inputMainVector[idx]))
  const p2 = getBaseMatrix(outputPoints).map(row => row.map((cell, idx) => cell * outputMainVector[idx]))
  const transformationMatrix = math.multiply(p2, math.inv(p1))

  return transformationMatrix
}

const getXPlaneSquared = (x, y) => {
  const ans1 = (
    (- Math.pow(x, 2) * (Math.pow(x, 2) + Math.pow(y, 2) - 1) +
      Math.sqrt(-Math.pow(x, 4) * (Math.pow(x, 2) + Math.pow(y, 2) - 1))) /
    (Math.pow(x, 2) * (Math.pow(x, 2) + 2 * Math.pow(y, 2) - 1) + Math.pow(y, 2) * (Math.pow(y, 2) - 1))
  )
  if (ans1 >= 0) return ans1
  return (
    (- Math.pow(x, 2) * (Math.pow(x, 2) + Math.pow(y, 2) - 1) -
      Math.sqrt(-Math.pow(x, 4) * (Math.pow(x, 2) + Math.pow(y, 2) - 1))) /
    (Math.pow(x, 2) * (Math.pow(x, 2) + 2 * Math.pow(y, 2) - 1) + Math.pow(y, 2) * (Math.pow(y, 2) - 1))
  )
}

const getYPlaneSquared = (x, y) => {
  return Math.pow(y, 2) / Math.pow(x, 2) * getXPlaneSquared(x, y)
}

const revertPoint = point => {
  const xCircle = point.x
  const yCircle = point.y
  const originX = (xCircle < 0 ? -1 : 1) * Math.sqrt(Math.abs(getXPlaneSquared(xCircle, yCircle)))
  const originY = (yCircle < 0 ? -1 : 1) * Math.sqrt(Math.abs(getYPlaneSquared(xCircle, yCircle)))
  return { x: originX, y: originY }
}

/**
 * Convert spaces between themselves, for easier visualization it's better to use space regions between [0, 1]
 * @param {point[]} inputPoints The input points on the normalized coordinates [-1, 1]
 * @param {point[]} outputPoints The output points on the normalized coordinates [-1, 1]
 * @returns {function(point): point}
 */
const getCircleToPlaneTransformation = (inputPoints, outputPoints) => {
  if (inputPoints === null || outputPoints === null) {
    return revertPoint
  }

  const outputPlanePoints = outputPoints.map(point => revertPoint(point))
  const transformationMatrix = getTransformationMatrix(inputPoints, outputPlanePoints)
  const inverseTransformationMatrix = math.inv(transformationMatrix)

  /**
   * 
   * @param {point} point 
   * @returns {point}
   */
  const transformation = (point) => {
    const reversedPoint = math.multiply(inverseTransformationMatrix, [point.x, point.y, 1])
    return {x: reversedPoint[0], y: reversedPoint[1]}
  }

  return transformation
}

const getNormalizedCoordinate = (value, size) => {
  return 2 * value / size - 1.000001
}

const getImageCoordinates = (value, size) => {
  const ans = Math.round((value + 1) * size / 2)
  if (ans > size || ans < 0) return null
  return ans
}

export {
  getTransformationMatrix,
  getCircleToPlaneTransformation,
  getNormalizedCoordinate,
  getImageCoordinates
}