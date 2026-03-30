# Structural AI — Floor Plan Intelligence & Blockchain Cost Auditing

A full-stack AI application that turns any 2D floor plan image into a complete structural engineering report — complete with element detection, 3D visualization, material cost analysis, AI explainability, and tamper-proof blockchain anchoring on the Stellar network.

---

## Project Description

Upload a floor plan image and Structural AI walks you through a 6-phase pipeline entirely in the browser and a lightweight local backend:

1. **Detection** — A fine-tuned YOLOv8 model identifies walls, doors, windows, columns, stairs, and other architectural elements and draws annotated bounding boxes over the image.
2. **3D Visualization** — The detected bounding boxes are procedurally extruded into an interactive dollhouse-style 3D model rendered with Three.js and `@react-three/fiber`.
3. **Material Analysis** — Each element is classified by structural role (load-bearing, partition, column, opening, slab) and scored against seven real-world materials (RCC, Red Brick, AAC Blocks, Steel Frame, Fly Ash Brick, Hollow Concrete Block, Precast Concrete Panel) using a weighted cost-strength-durability tradeoff formula.
4. **AI Explainability** — Google Gemini generates a structured 4-section engineering narrative for every element, explaining *why* the top material was chosen, what the tradeoffs are, what structural concerns exist, and what the builder should do about it.
5. **Cost Breakdown** — Live material prices are scraped from the web in the background. The app multiplies element area × material price to produce low/mid/high cost estimates, with support for multi-storey projects (G through G+4) that factor in foundation upgrades and per-floor structural requirements.
6. **Blockchain Verification** — The final JSON cost report is SHA-256 hashed in the browser and anchored to the **Stellar Testnet** via a Soroban smart contract. Anyone can later re-upload the report file to verify it hasn't been altered since it was submitted.

The landing page greets users with a rotating 3D house model and an intentionally retro voxel/pixel-game aesthetic — black borders, yellow accents, and chunky uppercase type — to make every step feel more like a game than a form.

---

## Project Vision

Construction cost fraud and document tampering are real problems on Indian building sites. A contractor can quietly adjust a cost estimate or material specification after a client has approved it.

Structural AI exists to close that gap. The idea is that an AI system should not only *produce* a structural analysis — it should make the analysis **verifiable by anyone, forever**, without trusting a single company's server. By anchoring the SHA-256 fingerprint of every cost report to an immutable blockchain ledger, both the builder and the property owner get a receipt that cannot be forged or retroactively changed.

The longer-term goal is to evolve this into a platform where licensed structural engineers can issue digitally-signed, on-chain audit certificates for residential and commercial projects — replacing paper-based processes that are slow, opaque, and easy to manipulate.

---

## Key Features

- **YOLOv8 Object Detection** — Custom-trained on architectural floor plan datasets to detect walls, doors, windows, columns, rooms, stairs, and furniture with bounding box confidence scores.
- **Interactive 3D Dollhouse Viewer** — Real-time Three.js scene built from detection output. Rotate, zoom, and inspect a hollow 3D model generated procedurally from 2D coordinates, with a `.glb` house model on the landing page.
- **7-Material Tradeoff Engine** — Role-specific scoring weights (e.g. strength weighted at 0.55 for columns, cost weighted at 0.45 for partitions) ensure the material recommendation actually changes based on what the element *does*.
- **Structural Concern Flags** — Automatic warnings for unsafe spans (>5 m), large openings without lintel support, oversized columns, and any load-bearing wall exceeding 4 m without intermediate supports.
- **Google Gemini Explainability** — A 1200-token structured 4-section response per element, displaying Material Recommendation, Cost vs Strength Tradeoff, Structural Concerns, and Builder Guidance in plain English.
- **Live Price Scraping** — Backend fetches current Indian material prices from the web at startup and caches them. The frontend shows a live/fallback indicator and allows manual refresh.
- **Multi-Storey Estimation** — Select G, G+1, G+2, G+3, or G+4. The engine applies per-floor cost ratios (upper floors are ~78–80% of the ground floor cost since they skip foundation and roof), selects the appropriate concrete grade (M20–M30), steel grade (Fe415–Fe500D), and footing type (isolated → raft → pile).
- **Adjustable Wall Height** — A slider (1–10 m) updates all wall and opening area calculations in real time; slabs and footprints remain unaffected.
- **PDF Export** — Multi-page PDF generated in-browser via `jsPDF` + `html2canvas` with a timestamped filename.
- **Stellar Blockchain Anchoring** — Freighter wallet integration for signing. The `anchor_report` Soroban function stores a 32-byte SHA-256 hash, mid-range cost estimate, and ledger timestamp per project ID. One-time write (no overwrite allowed by the contract).
- **Blockchain Verification Page** — Drag-and-drop a previously exported JSON report. The app hashes the file locally and calls `verify_report` on the Soroban contract to check the stored hash against the live file.

---

## Deployed Smart Contract Details

### Contract ID

```
CBQEBG5MGKL7CXRTVZM5P7RXSCRDVGLQ7QB7KFOSIFOMKPJMYAWBKVO
```

> Deployed on the **Stellar Testnet** (Soroban). The contract was compiled from `floorplan-ai/contracts/report_registry/` using the Soroban CLI and the Rust `soroban-sdk v22.1.0`.

### Block Explorer

Below is a screenshot of the Stellar Expert block explorer confirming the deployed contract:

> *(Add your Stellar Expert screenshot here — navigate to `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>` and capture the contract details page showing the deployment transaction, creation ledger, and contract data entries.)*

---

## UI Screenshots

> *(Replace the placeholder paths below with actual screenshots taken from your running application. Recommended shots: Landing Page, Detection Results, 3D Visualization, Materials Analysis table, Cost Breakdown with multi-storey panel, Blockchain Verification result.)*

| Screen | Description |
|--------|-------------|
| Landing Page | Rotating 3D house model with VILLA MESSENGER hero text and ENTER button |
| Detection | Annotated floor plan with color-coded bounding boxes per element type |
| 3D View | Procedural dollhouse model — hollow walls with door/window openings |
| Materials | Per-element ranked material cards with score badges and concern flags |
| Explainability | 4-section Gemini-powered structural narrative per element |
| Cost Breakdown | Line-item table, category cards, multi-storey projection bars, PDF + anchor buttons |
| Blockchain Verify | Drag-and-drop JSON verifier with on-chain hash comparison result |

---

## Demo Link

*Not deployed publicly yet. Run locally using the setup guide below.*

---

## Demo Video

*Coming soon.*

---

## Project Setup Guide

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| Rust + Cargo | latest stable |
| Stellar CLI (`stellar`) | 22.x |
| Freighter browser extension | latest |

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd structural_AI
```

---

### 2. Backend Setup

```bash
cd floorplan-ai/backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Place your trained YOLOv8 weights** at:

```
floorplan-ai/backend/weights/best.pt
```

If this file is missing, the backend falls back to the pretrained `yolov8n.pt` model for demo purposes (detection quality will be lower).

**Create a `.env` file** in `floorplan-ai/backend/`:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

A Gemini API key is required for the AI explainability phase. If you skip it, the backend falls back to deterministic template-based explanations.

**Start the backend:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`. The interactive docs are at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

```bash
cd floorplan-ai/frontend

# Install dependencies
npm install
```

**Create a `.env` file** in `floorplan-ai/frontend/`:

```env
VITE_STELLAR_NETWORK=TESTNET
VITE_SOROBAN_CONTRACT_ID=CBQEBG5MGKL7CXRTVZM5P7RXSCRDVGLQ7QB7KFOSIFOMKPJMYAWBKVO
```

**Start the dev server:**

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 4. Full Workflow

1. Hit **ENTER** on the landing page.
2. Upload a 2D floor plan image (JPG or PNG) on the home screen.
3. Click **Analyze** — the backend runs YOLOv8 and returns annotated detections.
4. Click **Proceed to 3D Visualization** — explore the interactive model.
5. Click **Analyze Materials** — the backend scores all 7 materials per element and calls Gemini for explanations.
6. Click **View Cost Breakdown** — adjust wall height and number of floors; review the full line-item table.
7. Click **Anchor to Blockchain** — Freighter will prompt you to sign a Stellar Testnet transaction.
8. Export the JSON report and later drop it into the **Blockchain Verification** page to confirm its integrity.

---

### 5. Smart Contract (Optional — for local development)

If you want to redeploy or modify the Soroban contract:

```bash
cd floorplan-ai/contracts/report_registry

# Build
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet (requires Stellar CLI and a funded testnet account)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/report_registry.wasm \
  --source <your-keypair-alias> \
  --network testnet
```

Update `VITE_SOROBAN_CONTRACT_ID` in your frontend `.env` with the newly deployed contract address.

---

## Future Scope

- **Custom Scale Calibration** — Let users mark a known dimension (e.g. a door width) on the image so that span estimates in metres actually reflect real-world measurements rather than pixel-based approximations.
- **BIM / IFC Export** — Generate an Industry Foundation Classes (IFC) file from the detected elements so architects can import the structural outline into Revit or ArchiCAD.
- **Engineer Digital Signatures** — Allow licensed structural engineers to countersign on-chain records using their Stellar keypair, producing verifiable audit certificates that meet IS 456/IS 13920 compliance requirements.
- **Mainnet Deployment** — Move from the Stellar Testnet to the public Stellar network once the verification workflow is production-ready.
- **Historical Report Dashboard** — A per-user dashboard that lists all previously anchored project reports, letting property owners track changes across design revisions.
- **Regional Price Feeds** — Replace the single national price scrape with city-level price oracles (Mumbai, Delhi, Bangalore, etc.) to account for significant regional cost variation.
- **Mobile Camera Input** — Accept images directly from a phone camera rather than requiring a pre-saved file, enabling on-site floor plan capture with the structural analysis running in real time.
- **Multi-Language Support** — Translate the AI explainability output to Hindi and other regional languages so that site supervisors and owners who don't read English can understand the structural recommendations directly.
