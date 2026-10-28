import * as tf from "@tensorflow/tfjs";

let model: tf.GraphModel | null = null;

const CLASS_NAMES = [
  "Apple___Apple_scab",
  "Apple___Black_rot",
  "Apple___Cedar_apple_rust",
  "Apple___healthy",
  "Blueberry___healthy",
  "Cherry_(including_sour)___Powdery_mildew",
  "Cherry_(including_sour)___healthy",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  "Corn_(maize)___Common_rust_",
  "Corn_(maize)___Northern_Leaf_Blight",
  "Corn_(maize)___healthy",
  "Grape___Black_rot",
  "Grape___Esca_(Black_Measles)",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
  "Grape___healthy",
  "Orange___Haunglongbing_(Citrus_greening)",
  "Peach___Bacterial_spot",
  "Peach___healthy",
  "Pepper,_bell___Bacterial_spot",
  "Pepper,_bell___healthy",
  "Potato___Early_blight",
  "Potato___Late_blight",
  "Potato___healthy",
  "Raspberry___healthy",
  "Soybean___healthy",
  "Squash___Powdery_mildew",
  "Strawberry___Leaf_scorch",
  "Strawberry___healthy",
  "Tomato___Bacterial_spot",
  "Tomato___Early_blight",
  "Tomato___Late_blight",
  "Tomato___Leaf_Mold",
  "Tomato___Septoria_leaf_spot",
  "Tomato___Spider_mites Two-spotted_spider_mite",
  "Tomato___Target_Spot",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  "Tomato___Tomato_mosaic_virus",
  "Tomato___healthy",
];

export const CROPS = Array.from(
  new Set(CLASS_NAMES.map((n) => n.split("___")[0])),
);

export async function loadClassifier() {
  if (!model) {
    model = await tf.loadGraphModel("/models/classifier/model.json");
  }
  return model;
}

export async function classifyImage(
  imageElement: HTMLImageElement,
  selectedCrop?: string,
) {
  const loadedModel = await loadClassifier();

  const prediction = tf.tidy(() => {
    const tensor = tf.browser
      .fromPixels(imageElement)
      .resizeBilinear([224, 224])
      .toFloat()
      .expandDims(0);
    return loadedModel.predict(tensor) as tf.Tensor;
  });

  const probabilities = await prediction.data();
  prediction.dispose();

  // 1. Which classes may the model choose from? (all of them if no crop is picked)
  const allowed = CLASS_NAMES.map((_, i) => i).filter(
    (i) => !selectedCrop || CLASS_NAMES[i].startsWith(selectedCrop + "___"),
  );

  // 2. How much probability did the model put on those classes in total?
  const cropMass = allowed.reduce((sum, i) => sum + probabilities[i], 0);

  // 3. Rescale inside the allowed group and sort best-first
  const ranked = allowed
    .map((i) => ({ i, score: cropMass > 0 ? probabilities[i] / cropMass : 0 }))
    .sort((a, b) => b.score - a.score);

  const toResult = ({ i, score }: { i: number; score: number }) => {
    const className = CLASS_NAMES[i];
    const [crop, disease] = className.split("___");
    return {
      className,
      crop: crop.replace(/_/g, " "),
      disease: disease.replace(/_/g, " "),
      isHealthy: disease.toLowerCase() === "healthy",
      confidence: score,
    };
  };

  const results = ranked.slice(0, 3).map(toResult);
  const best = results[0];

  // 4. Honest "not sure" flag (thresholds are starting guesses, tune them on your photos)
  const uncertain = selectedCrop
    ? cropMass < 0.2 || best.confidence < 0.6
    : best.confidence < 0.7;

  return { ...best, top3: results, cropMass, uncertain };
}
