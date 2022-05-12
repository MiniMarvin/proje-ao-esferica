import { getTransformationMatrix } from './transform';

test('Compute Identity matrix test',() => {
  const identityMatrix = '[[1,0,0],[0,1,0],[0,0,1]]'
  const points = [{x: 1, y: 2}, {x: 2, y: 1}, {x: 1, y: 1}, {x: 2, y:2}]
  const transformationMatrix = getTransformationMatrix(points, points)
  const relatedMatrix = transformationMatrix.map(row => row.map(cell => Math.round(cell)))
  expect(JSON.stringify(relatedMatrix)).toBe(identityMatrix)
})