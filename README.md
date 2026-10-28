# AgriSense AI

Offline crop disease diagnosis with voice input, built as a Progressive Web App.

**Live demo:** https://agrisense-ai-topaz.vercel.app

## What it does

- Diagnoses a leaf photo **on the phone**, with no server: 38 classes covering 14 crops
- Crop selector and a "not sure" rule, so unfamiliar photos are flagged instead of guessed
- Estimates how severe the infection is and shows rule-based treatment advice
- Voice input: Whisper tiny.en runs in the browser and suggests possible diseases
- Works offline after installation (service worker caches the app and the models)
- Saves each diagnosis locally and syncs it anonymously to Supabase when online

## Results and limits

- Classifier: 98.06% test accuracy on held-out PlantVillage images (laboratory-style photos)
- Severity model: IoU of about 0.335, so the percentage is a rough indicator only
- Real field photos are harder; the model only knows its 38 classes
- Voice is English only and sensitive to noise
- Results are suggestions, not confirmed diagnoses. Confirm with an agricultural extension officer.

## Tech stack

| Area | Technology |
|---|---|
| App | Next.js, React, TypeScript, Tailwind CSS |
| Image models | MobileNetV2 classifier, U-Net severity model (TensorFlow.js) |
| Speech | Whisper tiny.en (ONNX Runtime Web) |
| Offline | Service worker, Cache Storage, IndexedDB |
| Cloud | Supabase (PostgreSQL), Vercel |
| Training | Python 3.12, TensorFlow/Keras, Google Colab (T4 GPU) |

## Repository layout

```
agrisense-ai/
├── web/   Next.js app: UI, service worker and the deployable models in public/models
└── ml/    training notebooks and scripts
```

Datasets, Python environments and the trained `.keras` files are not stored in this repository.

## Run locally

Requirements: Node.js and Google Chrome.

```bash
cd web
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Open http://localhost:3000. The camera and microphone work on localhost.
The service worker is registered only in production builds, so test offline use with:

```bash
npm run build
npm start
```

## Supabase setup

Create a free Supabase project, put its URL and public key in `web/.env.local`, and run this in the SQL editor:

```sql
create table public.diagnoses (
  id uuid primary key,
  device_id uuid not null,
  created_at timestamptz not null,
  synced_at timestamptz not null default now(),
  crop text not null,
  disease text not null,
  is_healthy boolean not null,
  confidence real,
  severity real,
  selected_crop text,
  uncertain boolean not null default false
);

alter table public.diagnoses enable row level security;

create policy "anon can insert" on public.diagnoses
  for insert to anon with check (true);
```

Anonymous devices can insert rows but cannot read, change or delete them.

## Deploy

```bash
cd web
npx vercel --prod
```

Set the two `NEXT_PUBLIC_SUPABASE_*` variables in the Vercel project first.

## Training (ml/)

Notebooks are in `ml/notebooks` and scripts in `ml/scripts`. Download the PlantVillage dataset and a leaf disease segmentation dataset from Kaggle into `ml/data`. Training was done on Google Colab. Remove data augmentation layers from the model before converting it to TensorFlow.js.

## Author

Mark Precious Chinedu, BCA final-year project, Acharya Institute of Graduate Studies, Bengaluru (Dr. Manmohan Singh Bengaluru City University). Guide: Vivek R Venkatesh.

License: not yet specified.