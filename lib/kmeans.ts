// 依存ライブラリを使わない最小限のk-means実装（決定的な最遠点初期化 + Lloyd's algorithm）。

function squaredDistance(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0)
}

function initializeCentroids(data: number[][], k: number): number[][] {
  const centroids: number[][] = [data[0]]
  while (centroids.length < k) {
    let farthestPoint = data[0]
    let maxMinDist = -1
    for (const point of data) {
      const minDist = Math.min(
        ...centroids.map((c) => squaredDistance(c, point)),
      )
      if (minDist > maxMinDist) {
        maxMinDist = minDist
        farthestPoint = point
      }
    }
    centroids.push(farthestPoint)
  }
  return centroids
}

/**
 * データ点をk個のクラスタに分類し、各点のクラスタ番号（0始まり）を返す。
 * 初期化は決定的（最も離れた点を逐次選ぶ）ため、同じ入力なら常に同じ結果になる。
 */
export function kMeans(data: number[][], k: number, maxIter = 100): number[] {
  const effectiveK = Math.max(1, Math.min(k, data.length))
  let centroids = initializeCentroids(data, effectiveK)
  let assignments = new Array(data.length).fill(0)

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssignments = data.map((point) => {
      let best = 0
      let bestDist = Infinity
      centroids.forEach((centroid, idx) => {
        const dist = squaredDistance(point, centroid)
        if (dist < bestDist) {
          bestDist = dist
          best = idx
        }
      })
      return best
    })

    const changed = newAssignments.some((a, i) => a !== assignments[i])
    assignments = newAssignments
    if (!changed && iter > 0) break

    centroids = centroids.map((centroid, ci) => {
      const members = data.filter((_, i) => assignments[i] === ci)
      if (members.length === 0) return centroid
      const dim = data[0].length
      const sum = new Array(dim).fill(0)
      for (const member of members) {
        for (let d = 0; d < dim; d++) sum[d] += member[d]
      }
      return sum.map((v) => v / members.length)
    })
  }

  return assignments
}
