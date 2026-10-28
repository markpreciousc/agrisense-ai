interface TreatmentEntry {
  steps: string[]
  severeNote?: string
}

const HEALTHY: TreatmentEntry = {
  steps: ['No treatment needed — the plant looks healthy', 'Keep monitoring regularly'],
}

export const TREATMENT_ADVICE: Record<string, TreatmentEntry> = {
  'Apple___Apple_scab': {
    steps: ['Remove and destroy fallen leaves', 'Prune to improve air circulation', 'Apply a fungicide labeled for apple scab'],
    severeNote: 'Heavy infection can significantly reduce fruit yield — consider consulting a local extension office.',
  },
  'Apple___Black_rot': {
    steps: ['Prune out dead or cankered wood', 'Remove mummified fruit from the tree', 'Apply a fungicide during the growing season'],
  },
  'Apple___Cedar_apple_rust': {
    steps: ['Remove nearby juniper or cedar trees if possible', 'Apply a protective fungicide in spring', 'Rake and destroy fallen leaves'],
  },
  'Apple___healthy': HEALTHY,
  'Blueberry___healthy': HEALTHY,
  'Cherry_(including_sour)___Powdery_mildew': {
    steps: ['Improve air circulation by pruning', 'Avoid overhead watering', 'Apply a sulfur-based fungicide'],
  },
  'Cherry_(including_sour)___healthy': HEALTHY,
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    steps: ['Rotate crops away from corn for a season', 'Remove infected crop debris after harvest', 'Apply a fungicide if infection is early and severe'],
  },
  'Corn_(maize)___Common_rust_': {
    steps: ['Plant rust-resistant corn varieties next season', 'Apply a fungicide if detected early', 'Monitor fields regularly during humid weather'],
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    steps: ['Rotate crops', 'Remove crop residue after harvest', 'Apply a fungicide at first sign of disease'],
  },
  'Corn_(maize)___healthy': HEALTHY,
  'Grape___Black_rot': {
    steps: ['Remove mummified berries and infected leaves', 'Improve air circulation through pruning', 'Apply a fungicide starting early in the season'],
  },
  'Grape___Esca_(Black_Measles)': {
    steps: ['Prune out and destroy infected wood', 'Avoid pruning during wet weather', 'There is no reliable chemical cure — focus on prevention'],
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    steps: ['Remove infected leaves', 'Improve air circulation', 'Apply a fungicide labeled for grape leaf blight'],
  },
  'Grape___healthy': HEALTHY,
  'Orange___Haunglongbing_(Citrus_greening)': {
    steps: ['Control psyllid insects that spread the disease', 'Remove and destroy infected trees to prevent spread', 'There is no cure — focus on prevention and early detection'],
    severeNote: 'Citrus greening has no cure. Infected trees should be removed to protect nearby healthy trees — contact a local agricultural officer.',
  },
  'Peach___Bacterial_spot': {
    steps: ['Prune to improve air circulation', 'Avoid overhead irrigation', 'Apply a copper-based bactericide'],
  },
  'Peach___healthy': HEALTHY,
  'Pepper,_bell___Bacterial_spot': {
    steps: ['Remove and destroy infected plants', 'Avoid working with plants when leaves are wet', 'Apply a copper-based bactericide'],
  },
  'Pepper,_bell___healthy': HEALTHY,
  'Potato___Early_blight': {
    steps: ['Remove infected leaves', 'Rotate crops each season', 'Apply a fungicide labeled for early blight'],
  },
  'Potato___Late_blight': {
    steps: ['Remove and destroy infected plants immediately', 'Avoid overhead watering', 'Apply a fungicide preventatively in humid conditions'],
    severeNote: 'Late blight can spread very quickly and destroy a crop within days — act immediately and consider consulting a local extension office.',
  },
  'Potato___healthy': HEALTHY,
  'Raspberry___healthy': HEALTHY,
  'Soybean___healthy': HEALTHY,
  'Squash___Powdery_mildew': {
    steps: ['Improve air circulation between plants', 'Avoid overhead watering', 'Apply a sulfur-based fungicide'],
  },
  'Strawberry___Leaf_scorch': {
    steps: ['Remove infected leaves after harvest', 'Avoid overhead irrigation', 'Apply a fungicide labeled for leaf scorch'],
  },
  'Strawberry___healthy': HEALTHY,
  'Tomato___Bacterial_spot': {
    steps: ['Remove infected leaves', 'Avoid working with wet plants', 'Apply a copper-based bactericide'],
  },
  'Tomato___Early_blight': {
    steps: ['Remove affected lower leaves', 'Mulch around the base of the plant', 'Apply a fungicide labeled for early blight'],
  },
  'Tomato___Late_blight': {
    steps: ['Remove and destroy infected plants immediately', 'Avoid overhead watering', 'Apply a fungicide preventatively'],
    severeNote: 'Late blight can spread very quickly and destroy a crop within days — act immediately and consider consulting a local extension office.',
  },
  'Tomato___Leaf_Mold': {
    steps: ['Improve greenhouse or garden ventilation', 'Avoid wetting the leaves when watering', 'Apply a fungicide labeled for leaf mold'],
  },
  'Tomato___Septoria_leaf_spot': {
    steps: ['Remove infected lower leaves', 'Avoid overhead watering', 'Apply a fungicide labeled for septoria leaf spot'],
  },
  'Tomato___Spider_mites Two-spotted_spider_mite': {
    steps: ['Spray plants with water to dislodge mites', 'Introduce natural predators like ladybugs', 'Apply an insecticidal soap if severe'],
  },
  'Tomato___Target_Spot': {
    steps: ['Remove infected leaves', 'Improve air circulation', 'Apply a fungicide labeled for target spot'],
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    steps: ['Control whiteflies, which spread the virus', 'Remove and destroy infected plants', 'There is no cure — focus on prevention'],
    severeNote: 'This virus has no cure and spreads quickly through whiteflies — removing infected plants promptly helps protect the rest of the crop.',
  },
  'Tomato___Tomato_mosaic_virus': {
    steps: ['Remove and destroy infected plants', 'Wash hands and tools after handling infected plants', 'There is no cure — focus on prevention'],
  },
  'Tomato___healthy': HEALTHY,
}

export function getTreatmentAdvice(className: string, severityPercent?: number | null): TreatmentEntry {
  const entry = TREATMENT_ADVICE[className]
  if (!entry) return { steps: ['No specific guidance available for this diagnosis.'] }

  const showSevereNote = entry.severeNote && severityPercent != null && severityPercent > 50
  return { steps: entry.steps, severeNote: showSevereNote ? entry.severeNote : undefined }
}