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

  // TODO: usolve the matrix
  const inputBase = getBaseMatrix(inputPoints)
  const outputBase = getBaseMatrix(outputPoints)
  const inputMainVector = getMainVector(inputPoints)
  const outputMainVector = getMainVector(outputPoints)

  const inputEigenVector = math.usolve(inputBase, inputMainVector).map(v => v[0])
  const outputEigenVector = math.usolve(outputBase, outputMainVector).map(v => v[0])

  const p1 = inputBase.map(row => row.map((cell, idx) => cell * inputEigenVector[idx]))
  const p2 = outputBase.map(row => row.map((cell, idx) => cell * outputEigenVector[idx]))
  const transformationMatrix = math.multiply(p2, math.inv(p1))

  console.log('-------------')
  console.log('input points:', inputPoints)
  console.log('output points:', outputPoints)
  console.log(`input base: `, inputBase)
  console.log(`output base: `, outputBase)
  console.log(`input main vector: `, inputMainVector)
  console.log(`output main vector: `, outputMainVector)
  console.log(`input eigenvector: `, inputEigenVector)
  console.log(`output eigenvector: `, outputEigenVector)
  console.log(`p1: `, p1)
  console.log(`p2: `, p2)
  console.log('-------------')

  return transformationMatrix
}

const revertPoint = point => {
  // const originX = (point.x < 0 ? -1 : 1) * Math.sqrt(Math.abs(getXPlaneSquared(point.x, point.y)))
  // const originY = (point.y < 0 ? -1 : 1) * Math.sqrt(Math.abs(getYPlaneSquared(point.x, point.y)))
  const radius2 = Math.pow(point.x, 2) + Math.pow(point.y, 2)
  const factor = Math.sqrt(1/(1 - radius2)) 
  const originX = factor * point.x
  const originY = factor * point.y
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
  console.log('input points: ', inputPoints)
  console.log('output circle points: ', outputPoints)
  console.log('output plane points: ', outputPlanePoints)
  const inverseTransformationMatrix = getTransformationMatrix(outputPlanePoints, inputPoints)
  console.log('inverse transformation matrix: ', inverseTransformationMatrix)

  /**
   * 
   * @param {point} point 
   * @returns {point}
   */
  const transformation = (point) => {
    const mappedPoint = revertPoint(point)
    const reversedPoint = math.multiply(inverseTransformationMatrix, [mappedPoint.x, mappedPoint.y, 1])
    const computedPoint = {x: reversedPoint[0]/reversedPoint[2], y: reversedPoint[1]/reversedPoint[2]}
    return computedPoint
  }

  return transformation
}

const getNormalizedCoordinate = (value, size) => {
  return 2 * value / size - 1.000000001
}

const getNormalizedCoordinateOnMain = (value, size) => {
  return value / size + 1e-10
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
  getImageCoordinates,
  getNormalizedCoordinateOnMain
}