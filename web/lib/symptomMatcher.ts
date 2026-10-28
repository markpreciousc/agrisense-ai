const DISEASE_SYMPTOMS: Record<string, string[]> = {
  'Apple___Apple_scab': ['dark spots', 'olive green spots', 'scabby patches'],
  'Apple___Black_rot': ['black rot', 'purple spots', 'rotting fruit', 'spots with rings'],
  'Apple___Cedar_apple_rust': ['orange spots', 'rust colored spots', 'yellow orange spots'],
  'Apple___healthy': ['healthy', 'no spots', 'looks fine'],
  'Blueberry___healthy': ['healthy', 'no spots', 'looks fine'],
  'Cherry_(including_sour)___Powdery_mildew': ['white powder', 'powdery coating', 'white dust'],
  'Cherry_(including_sour)___healthy': ['healthy', 'no spots', 'looks fine'],
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': ['gray spots', 'rectangular spots', 'gray lesions'],
  'Corn_(maize)___Common_rust_': ['rust spots', 'reddish brown spots', 'orange pustules'],
  'Corn_(maize)___Northern_Leaf_Blight': ['long gray lesions', 'cigar shaped spots', 'streaks on leaves'],
  'Corn_(maize)___healthy': ['healthy', 'no spots', 'looks fine'],
  'Grape___Black_rot': ['black spots', 'brown circular spots', 'shriveled grapes'],
  'Grape___Esca_(Black_Measles)': ['striped leaves', 'tiger stripe pattern', 'dark spots on grapes'],
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': ['brown spots', 'irregular brown patches'],
  'Grape___healthy': ['healthy', 'no spots', 'looks fine'],
  'Orange___Haunglongbing_(Citrus_greening)': ['yellow shoots', 'blotchy leaves', 'misshapen fruit', 'yellow veins'],
  'Peach___Bacterial_spot': ['small dark spots', 'water soaked spots', 'holes in leaves'],
  'Peach___healthy': ['healthy', 'no spots', 'looks fine'],
  'Pepper,_bell___Bacterial_spot': ['small dark spots', 'water soaked lesions'],
  'Pepper,_bell___healthy': ['healthy', 'no spots', 'looks fine'],
  'Potato___Early_blight': ['brown spots with rings', 'target shaped spots', 'concentric rings'],
  'Potato___Late_blight': ['dark water soaked spots', 'white mold', 'blackened leaves'],
  'Potato___healthy': ['healthy', 'no spots', 'looks fine'],
  'Raspberry___healthy': ['healthy', 'no spots', 'looks fine'],
  'Soybean___healthy': ['healthy', 'no spots', 'looks fine'],
  'Squash___Powdery_mildew': ['white powder', 'powdery coating', 'white dust'],
  'Strawberry___Leaf_scorch': ['purple spots', 'scorched leaves', 'brown edges'],
  'Strawberry___healthy': ['healthy', 'no spots', 'looks fine'],
  'Tomato___Bacterial_spot': ['small dark spots', 'water soaked spots', 'spots with yellow halo'],
  'Tomato___Early_blight': ['brown spots with rings', 'target shaped spots', 'concentric rings'],
  'Tomato___Late_blight': ['dark water soaked patches', 'white fuzzy mold', 'blackened stems'],
  'Tomato___Leaf_Mold': ['yellow spots on top', 'olive mold underneath', 'fuzzy mold'],
  'Tomato___Septoria_leaf_spot': ['small round spots', 'gray centers with dark edges'],
  'Tomato___Spider_mites Two-spotted_spider_mite': ['tiny webs', 'stippled leaves', 'webbing', 'yellow speckles'],
  'Tomato___Target_Spot': ['target shaped spots', 'brown spots with rings', 'concentric circles'],
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': ['curled leaves', 'yellowing leaves', 'stunted growth'],
  'Tomato___Tomato_mosaic_virus': ['mottled leaves', 'mosaic pattern', 'light and dark patches'],
  'Tomato___healthy': ['healthy', 'no spots', 'looks fine'],
}

export interface SymptomMatch {
  crop: string
  disease: string
  isHealthy: boolean
  score: number
  matchedKeywords: string[]
}

export function matchSymptoms(transcript: string): SymptomMatch[] {
  const text = transcript.toLowerCase()
  const results: SymptomMatch[] = []

  for (const [className, keywords] of Object.entries(DISEASE_SYMPTOMS)) {
    const [cropRaw, diseaseRaw] = className.split('___')
    const crop = cropRaw.replace(/_/g, ' ').replace(',', '')
    const disease = diseaseRaw.replace(/_/g, ' ')
    const isHealthy = diseaseRaw.toLowerCase() === 'healthy'

    const matchedKeywords = keywords.filter((k) => text.includes(k))
    let score = matchedKeywords.length
    if (text.includes(crop.toLowerCase())) score += 2

    if (score > 0) {
      results.push({ crop, disease, isHealthy, score, matchedKeywords })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3)
}