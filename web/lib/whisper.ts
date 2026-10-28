import { pipeline, env } from '@huggingface/transformers'

env.allowLocalModels = true
env.allowRemoteModels = false
env.localModelPath = '/models/'

let transcriber: any = null

export async function loadWhisper() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'whisper', {
      dtype: {
        encoder_model: 'q8',
        decoder_model_merged: 'fp16',
      },
    })
  }
  return transcriber
}

export async function decodeTo16k(audioBlob: Blob): Promise<Float32Array> {
  const arrayBuffer = await audioBlob.arrayBuffer()
  const ctx = new AudioContext({ sampleRate: 16000 })
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const data = audioBuffer.getChannelData(0)
  await ctx.close()
  return data
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const model = await loadWhisper()

  const audioData = await decodeTo16k(audioBlob)

  const result = await model(audioData)
  return result.text
}