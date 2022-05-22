import { multiply } from "mathjs"

/**
 * 
 * @param {number[][]} matrix 
 * @returns {number[]}
 */
const rankOrder = (matrix) => {
  // assing a rank for a row. i.e. {row: rank}
  const rank = {}
  for (let col = 0; col < matrix[0].length; col++) {
    for (let row = 0; row < matrix.length; row++) {
      if (rank[row] !== undefined && rank[row] !== null) continue
      if (matrix[row][col] !== 0) {
        rank[row] = col
        break
      }
    }
  }

  const order = Array.from({ length: rank.length }, () => 0)
  Object.keys(rank).map(key => order[rank[key]] = key)

  return order
}

/**
 * 
 * @param {number[][]} matrix 
 * @param {number[][]} outputVector 
 * @returns {{matrix: number[][], outputVector: number[][], order: number[]}}
 */
const diagonalization = (matrix, outputVector) => {
  // deep copy to avoid issues with cloned values
  matrix = JSON.parse(JSON.stringify(matrix))
  outputVector = JSON.parse(JSON.stringify(outputVector))
  
  let order = rankOrder(matrix)
  matrix = order.map(rowIndex => matrix[rowIndex])
  outputVector = order.map(rowIndex => outputVector[rowIndex])

  // remove bottom of diagonal
  for (let col = 0; col < matrix[0].length; col++) {
    for (let row = col + 1; row < matrix.length; row++) {
      if (matrix[row][col] !== 0) {
        const mrc = matrix[row][col]
        const mcc = matrix[col][col]
        const newOutput = outputVector[col][0] * mrc - outputVector[row][0] * mcc
        for (let index = 0; index < matrix[0].length; index++) {
          matrix[row][index] = matrix[col][index] * mrc - matrix[row][index] * mcc
        }

        outputVector[row][0] = newOutput
      }
    }
    order = rankOrder(matrix)
    matrix = order.map(rowIndex => matrix[rowIndex])
    outputVector = order.map(rowIndex => outputVector[rowIndex])
  }

  // remove upper side
  for (let col = matrix[0].length - 1; col >= 0; col--) {
    for (let row = col - 1; row >= 0; row--) {
      if (matrix[row][col] !== 0) {
        const mrc = matrix[row][col]
        const mcc = matrix[col][col]
        const newOutput = outputVector[col][0] * mrc - outputVector[row][0] * mcc
        for (let index = 0; index < matrix[0].length; index++) {
          matrix[row][index] = matrix[col][index] * mrc - matrix[row][index] * mcc
        }

        outputVector[row][0] = newOutput
      }
    }
    order = rankOrder(matrix)
    matrix = order.map(rowIndex => matrix[rowIndex])
    outputVector = order.map(rowIndex => outputVector[rowIndex])
  }

  return { matrix, outputVector }
}

/**
 * 
 * @param {number[][]} matrix 
 * @param {outputVector[][]} outputVector 
 * @returns {number[]}
 */
const getEscalatedMatrix = (matrix, outputVector) => {
  const diagonal = diagonalization(matrix, outputVector)
  const answers = diagonal.outputVector.map((_, idx) => diagonal.outputVector[idx][0]/diagonal.matrix[idx][idx])
  // return diagonal.order.map(row => answers[row])
  return answers
}

/**
 * 
 * @param {point[]} inputPoints 
 * @param {point[]} outputPoints 
 * @returns {{matrix: number[][], outputVector: number[][]}}
 */
const getLinearSystemFromPoints = (inputPoints, outputPoints) => {
  const matrix = inputPoints.map((ip, idx) => [
    [-ip.x, -ip.y, -1, 0, 0, 0, ip.x*outputPoints[idx].x, ip.y*outputPoints[idx].x, outputPoints[idx].x],
    [0, 0, 0, -ip.x, -ip.y, -1, ip.x*outputPoints[idx].y, ip.y*outputPoints[idx].y, outputPoints[idx].y],
  ]).reduce((acc, curr) => acc.concat(curr), []).concat([[0,0,0,0,0,0,0,0,1]])
  const outputVector = outputPoints.map(p => [[0], [0]]).reduce((acc, curr) => acc.concat(curr), []).concat([[1]])
  return {matrix, outputVector}
}

/**
 * 
 * @param {point[]} inputPoints 
 * @param {point[]} outputPoints 
 * @returns {number[][]}
 */
const getProjectiveTransformationValues = (inputPoints, outputPoints) => {
  console.log('----------------------')
  console.log('gaussian response')
  const system = getLinearSystemFromPoints(inputPoints, outputPoints)
  console.log({system})
  const response = getEscalatedMatrix(system.matrix, system.outputVector)
  console.log({response})
  const transformationMatrix = [
    [response[0], response[1], response[2]],
    [response[3], response[4], response[5]],
    [response[6], response[7], response[8]],
  ]
  console.log({transformationMatrix})
  console.log('----------------------')
  return transformationMatrix
}

export {
  getProjectiveTransformationValues
}