// 依存ライブラリを使わない最小限のPCA実装（標準化 + Jacobi法による固有値分解）。
// 対象は評価ベクトルの次元数（23）程度の小さな対称行列のみを想定する。

export type PcaPoint = { x: number; y: number }

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: number[], avg: number): number {
  const variance = mean(values.map((v) => (v - avg) ** 2))
  return Math.sqrt(variance)
}

export function standardize(matrix: number[][]): number[][] {
  const dimensions = matrix[0].length
  const means: number[] = []
  const stds: number[] = []

  for (let d = 0; d < dimensions; d++) {
    const column = matrix.map((row) => row[d])
    const avg = mean(column)
    const std = standardDeviation(column, avg)
    means.push(avg)
    stds.push(std || 1)
  }

  return matrix.map((row) =>
    row.map((value, d) => (value - means[d]) / stds[d]),
  )
}

function covarianceMatrix(standardized: number[][]): number[][] {
  const n = standardized.length
  const dimensions = standardized[0].length
  const cov: number[][] = Array.from({ length: dimensions }, () =>
    new Array(dimensions).fill(0),
  )

  for (let i = 0; i < dimensions; i++) {
    for (let j = i; j < dimensions; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += standardized[k][i] * standardized[k][j]
      }
      const value = sum / (n - 1 || 1)
      cov[i][j] = value
      cov[j][i] = value
    }
  }

  return cov
}

// 対称行列の固有値・固有ベクトルをJacobi回転法で求める。
function jacobiEigenDecomposition(
  input: number[][],
  maxSweeps = 100,
  tolerance = 1e-9,
): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = input.length
  const a = input.map((row) => [...row])
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let offDiagSum = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        offDiagSum += a[i][j] * a[i][j]
      }
    }
    if (offDiagSum < tolerance) break

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-12) continue

        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q])
        const t =
          Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        const app = a[p][p]
        const aqq = a[q][q]
        const apq = a[p][q]

        a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq
        a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq
        a[p][q] = 0
        a[q][p] = 0

        for (let i = 0; i < n; i++) {
          if (i !== p && i !== q) {
            const aip = a[i][p]
            const aiq = a[i][q]
            a[i][p] = c * aip - s * aiq
            a[p][i] = a[i][p]
            a[i][q] = s * aip + c * aiq
            a[q][i] = a[i][q]
          }
        }

        for (let i = 0; i < n; i++) {
          const vip = v[i][p]
          const viq = v[i][q]
          v[i][p] = c * vip - s * viq
          v[i][q] = s * vip + c * viq
        }
      }
    }
  }

  const eigenvalues = a.map((row, i) => row[i])
  const eigenvectors = eigenvalues.map((_, col) => v.map((row) => row[col]))

  return { eigenvalues, eigenvectors }
}

/**
 * 23次元（任意次元）の評価ベクトル群を標準化し、上位2主成分に射影する。
 * 入力は最低2件必要（分散が計算できないため）。
 */
export function computePca2D(matrix: number[][]): PcaPoint[] {
  if (matrix.length < 2) {
    throw new Error("PCAには2件以上のデータが必要です")
  }

  const standardized = standardize(matrix)
  const cov = covarianceMatrix(standardized)
  const { eigenvalues, eigenvectors } = jacobiEigenDecomposition(cov)

  const order = eigenvalues
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((e) => e.index)

  const pc1 = order[0] !== undefined ? eigenvectors[order[0]] : []
  const pc2 = order[1] !== undefined ? eigenvectors[order[1]] : []

  return standardized.map((row) => ({
    x: pc1.reduce((sum, w, i) => sum + w * row[i], 0),
    y: pc2.length ? pc2.reduce((sum, w, i) => sum + w * row[i], 0) : 0,
  }))
}
