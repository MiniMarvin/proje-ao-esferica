import { create, all } from 'mathjs'
import { getProjectiveTransformationValues } from './projectiveTransform'

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

  const inputBase = getBaseMatrix(inputPoints)
  const outputBase = getBaseMatrix(outputPoints)
  const inputMainVector = getMainVector(inputPoints)
  const outputMainVector = getMainVector(outputPoints)

  const inputEigenVector = math.usolve(inputBase, inputMainVector).map(v => v[0])
  const outputEigenVector = math.usolve(outputBase, outputMainVector).map(v => v[0])

  const p1 = inputBase.map(row => row.map((cell, idx) => cell * inputEigenVector[idx]))
  const p2 = outputBase.map(row => row.map((cell, idx) => cell * outputEigenVector[idx]))
  const transformationMatrix = math.multiply(p2, math.inv(p1))

  // console.log('-------------')
  // console.log('input points:', inputPoints)
  // console.log('output points:', outputPoints)
  // console.log(`input base: `, inputBase)
  // console.log(`output base: `, outputBase)
  // console.log(`input main vector: `, inputMainVector)
  // console.log(`output main vector: `, outputMainVector)
  // console.log(`input eigenvector: `, inputEigenVector)
  // console.log(`output eigenvector: `, outputEigenVector)
  // console.log(`p1: `, p1)
  // console.log(`p2: `, p2)
  // console.log('-------------')

  return transformationMatrix
}

const revertPoint = point => {
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
  // const inverseTransformationMatrix = getTransformationMatrix(outputPlanePoints, inputPoints)
  // console.log('inverse transformation matrix: ', inverseTransformationMatrix)

  const H = getProjectiveTransformationValues(outputPlanePoints, inputPoints)
  const inverseTransformationMatrix = H
  console.log('inverse transformation matrix: ', inverseTransformationMatrix)
  
  /**
   * 
   * @param {point} point 
   * @returns {point}
   */
  const transformation = (point) => {
    const mappedPoint = revertPoint(point)
    const reversedPoint = math.multiply(inverseTransformationMatrix, [mappedPoint.x, mappedPoint.y, 1])
    const computedPoint = {x: reversedPoint[0], y: reversedPoint[1], z: reversedPoint[2]}
    return computedPoint
  }

  const directTransformation = (point) => {
    const reversedPoint = math.multiply(inverseTransformationMatrix, [point.x, point.y, 1])
    const computedPoint = {x: reversedPoint[0], y: reversedPoint[1], z: reversedPoint[2]}
    return computedPoint
  }

  console.log('===========================')
  const validation = outputPoints.map((circlePoint, idx) => ({
    circlePoint: circlePoint, 
    outputPlanePoint: outputPlanePoints[idx], 
    computedOutputPlanePoint: revertPoint(circlePoint), 
    inputPlanePoint: inputPoints[idx], 
    computedInputPlanePoint: transformation(circlePoint),
    directComputedInputPlanePoint: directTransformation(outputPlanePoints[idx]), 
  }))
  console.log({validation})
  console.log('===========================')

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

/**
 * 
 * @param {point[]} points 
 * @returns {point}
 */
const getCentralPoint = (points) => {
  console.log('points >> ', points)
  const vectorPoints = points.map(p => [p.x, p.y, 1])
  const r1 = math.cross(vectorPoints[0], vectorPoints[1])
  const r2 = math.cross(vectorPoints[2], vectorPoints[3])
  const r1l = r1.map(v => v/r1[2])
  const r2l = r2.map(v => v/r2[2])
  console.log('r1: ', `${r1l[0]}x + (${r1l[1]}y +${r1l[2]}) = 0`)
  console.log('r2: ', `${r2l[0]}x + (${r2l[1]}y +${r2l[2]}) = 0`)
  const center = math.cross(r1l, r2l)
  const centerPoint = {x: center[0]/center[2], y: center[1]/center[2]}
  return centerPoint
}

export {
  getTransformationMatrix,
  getCircleToPlaneTransformation,
  getNormalizedCoordinate,
  getImageCoordinates,
  getNormalizedCoordinateOnMain,
  getCentralPoint
}