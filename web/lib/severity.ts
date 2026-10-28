import * as tf from '@tensorflow/tfjs'

let severityModel: tf.GraphModel | null = null

export async function loadSeverityModel() {
  if (!severityModel) {
    severityModel = await tf.loadGraphModel('/models/severity/model.json')
  }
  return severityModel
}

export async function estimateSeverity(imageElement: HTMLImageElement) {
  const model = await loadSeverityModel()

  const prediction = tf.tidy(() => {
    const tensor = tf.browser
      .fromPixels(imageElement)
      .resizeBilinear([128, 128])
      .toFloat()
      .expandDims(0)
    return model.predict(tensor) as tf.Tensor
  })

  const maskValues = await prediction.data()
  prediction.dispose()

  let diseasedPixels = 0
  for (let i = 0; i < maskValues.length; i++) {
    if (maskValues[i] > 0.5) diseasedPixels++
  }

  return { severityPercent: (diseasedPixels / maskValues.length) * 100 }
}