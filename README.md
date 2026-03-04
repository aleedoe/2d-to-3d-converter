# 2D → 3D Converter

An AI-powered web application that transforms 2D images into game-ready 3D assets using Tencent's **Hunyuan3D-2mini** model. Upload any image — a character sketch, a product photo, a game sprite — and receive a downloadable `.glb` 3D model in seconds.

The project is split into two parts:

- **Frontend** (`web/`): A modern, dark-themed **Next.js 16** interface built with the App Router, Tailwind CSS v4, and Shadcn UI. It features drag-and-drop uploads via `react-dropzone`, an interactive 3D previewer powered by React Three Fiber, and a polished loading experience with staged progress feedback.
- **Backend** (`api/`): A **Flask** REST API with a clean, layered architecture. It loads the Hunyuan3D-DiT pipeline with fp16 precision and CUDA optimizations, runs inference on the GPU, and streams the resulting `.glb` file back to the client.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Project Structure](#project-structure)
- [Installation \& Setup](#installation--setup)
  - [Backend (Flask)](#backend-flask)
  - [Frontend (Next.js)](#frontend-nextjs)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Technologies Used](#technologies-used)
- [License](#license)

---

## System Requirements

### Hardware

| Component | Requirement                                              |
| --------- | -------------------------------------------------------- |
| **GPU**   | NVIDIA GPU with ≥ 6 GB VRAM (tested on **RTX 4050**)     |
| **CUDA**  | CUDA Toolkit 11.8+                                       |
| **RAM**   | 16 GB minimum (32 GB recommended)                        |
| **Disk**  | ~5 GB free for the `model.fp16.safetensors` weights file |

> **Note:** The inference pipeline is configured with `fp16` precision, chunked processing (`num_chunks=20000`), and `torch.inference_mode()` to keep VRAM usage within the 6 GB budget of an RTX 4050. If `hy3dgen` is not installed or CUDA is unavailable, the backend falls back to a **mock mode** that returns a placeholder cube — useful for frontend development.

### Software

| Dependency  | Version               |
| ----------- | --------------------- |
| **Python**  | 3.10+                 |
| **Node.js** | 18+ (LTS recommended) |
| **npm**     | 9+                    |
| **pip**     | 23+                   |
| **Git**     | Any recent version    |

---

## Project Structure

```
2d-to-3d-converter/
│
├── api/                              # Flask backend
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py               # App config: CUDA device, model paths,
│   │                                  # inference params, CORS origins, Flask port
│   ├── routes/
│   │   ├── __init__.py
│   │   └── generate.py               # POST /api/generate-3d endpoint (Blueprint)
│   ├── services/
│   │   ├── __init__.py
│   │   └── model_inference.py         # ModelInferenceService — singleton pipeline,
│   │                                  # GPU memory management, GLB export
│   ├── outputs/                       # Generated .glb files (auto-created)
│   ├── main.py                        # Flask entry point — app factory, CORS, logging
│   ├── requirements.txt               # Python dependencies
│   └── model.fp16.safetensors         # Hunyuan3D-2mini weights (3.8 GB, not in Git)
│
├── web/                               # Next.js frontend
│   ├── app/
│   │   ├── globals.css                # Tailwind v4 config, dark theme variables,
│   │   │                              # violet accent palette, custom animations
│   │   ├── layout.tsx                 # Root layout — Inter font, SEO metadata, dark mode
│   │   ├── page.tsx                   # Main page — two-panel UI (upload ↔ 3D preview),
│   │   │                              # state machine: idle → ready → loading → done/error
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ImageUploader.tsx          # Drag-and-drop upload with react-dropzone,
│   │   │                              # image preview, file info display
│   │   ├── ModelViewer.tsx            # React Three Fiber canvas — useGLTF, OrbitControls,
│   │   │                              # environment lighting, auto-rotate, contact shadows
│   │   ├── LoadingOverlay.tsx         # Staged progress bar (5 phases), glassmorphism
│   │   │                              # overlay, animated spinner
│   │   └── ui/                        # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── progress.tsx
│   │       └── separator.tsx
│   ├── lib/
│   │   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
│   ├── next.config.ts                 # API proxy: /api/* → localhost:5000
│   ├── components.json                # Shadcn config (new-york style, lucide icons)
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Installation & Setup

### Backend (Flask)

1. **Navigate to the API directory:**

   ```bash
   cd api
   ```

2. **Create and activate a Python virtual environment:**

   ```bash
   # Windows
   python -m venv env
   env\Scripts\activate

   # macOS / Linux
   python3 -m venv env
   source env/bin/activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Install Hunyuan3D-2 (the AI model library):**

   ```bash
   pip install git+https://github.com/Tencent/Hunyuan3D-2.git
   ```

   > This installs the `hy3dgen` package which provides `Hunyuan3DDiTFlowMatchingPipeline`. If installation fails (e.g., missing C++ build tools or CUDA), the server will still start in **mock mode** and return a placeholder 3D cube for every request.

5. **Model weights:**

   The `model.fp16.safetensors` file (3.8 GB) must be present in the `api/` directory. The pipeline loads weights from the HuggingFace repo `tencent/Hunyuan3D-2mini` (subfolder `hunyuan3d-dit-v2-mini`) with `use_safetensors=True`. On first run, additional model components may be automatically downloaded from HuggingFace if they are not already cached.

---

### Frontend (Next.js)

1. **Navigate to the web directory:**

   ```bash
   cd web
   ```

2. **Install npm dependencies:**

   ```bash
   npm install
   ```

   This installs all packages listed in `package.json`, including:
   - `react-dropzone` — drag-and-drop image upload
   - `@react-three/fiber` + `@react-three/drei` + `three` — interactive 3D viewer
   - `lucide-react` — icon library
   - `radix-ui` + `class-variance-authority` + `tailwind-merge` — Shadcn UI primitives

3. **Shadcn UI components** are already committed to the repo under `components/ui/`. If you need to add more components in the future, use the Shadcn CLI:

   ```bash
   npx shadcn@latest add <component-name>
   ```

   Components currently installed: `button`, `card`, `progress`, `separator`.

---

## Running the Application

### 1. Start the Flask Backend

```bash
cd api
python main.py
```

The server starts on **`http://localhost:5000`** with CORS configured for the Next.js dev server (`localhost:3000`). You should see:

```
HH:MM:SS  INFO  __main__ — Flask app ready  •  CORS origins: ['http://localhost:3000', 'http://127.0.0.1:3000']
HH:MM:SS  INFO  __main__ — Starting server on 0.0.0.0:5000
```

To enable debug mode with auto-reload:

```bash
set FLASK_DEBUG=true    # Windows
export FLASK_DEBUG=true # macOS / Linux
python main.py
```

### 2. Start the Next.js Frontend

```bash
cd web
npm run dev
```

The dev server starts on **`http://localhost:3000`**. API calls to `/api/*` are automatically proxied to the Flask backend via `next.config.ts` rewrites.

### 3. Use the Application

1. Open `http://localhost:3000` in your browser.
2. **Upload** a 2D image by dragging it onto the upload zone or clicking to browse.
3. Click the **"Generate 3D Model"** button.
4. Wait for the loading overlay to complete (the progress bar shows 5 processing stages).
5. **Inspect** the 3D model in the interactive viewer — rotate, pan, and zoom with your mouse.
6. Click **"Download .glb"** to save the file locally for use in game engines (Unity, Unreal, Godot, Blender, etc.).

---

## API Reference

### `POST /api/generate-3d`

Converts a 2D image into a 3D model and returns the generated `.glb` file.

#### Request

| Property          | Value                 |
| ----------------- | --------------------- |
| **Method**        | `POST`                |
| **Content-Type**  | `multipart/form-data` |
| **Max Body Size** | 16 MB                 |

**Form Fields:**

| Field   | Type | Required | Description                                                              |
| ------- | ---- | -------- | ------------------------------------------------------------------------ |
| `image` | File | Yes      | The 2D image to convert. Accepted formats: `png`, `jpg`, `jpeg`, `webp`. |

#### Response — Success (`200 OK`)

| Property                | Value                            |
| ----------------------- | -------------------------------- |
| **Content-Type**        | `model/gltf-binary`              |
| **Content-Disposition** | `attachment; filename=model.glb` |
| **Body**                | Binary `.glb` file               |

#### Response — Error

All error responses return JSON with the following shape:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Cause                                                            |
| ------ | ---------------------------------------------------------------- |
| `400`  | Missing `image` field, empty filename, or unsupported file type. |
| `500`  | Model inference failed or output file not found.                 |

#### Example — cURL

```bash
curl -X POST http://localhost:5000/api/generate-3d \
  -F "image=@./my-character.png" \
  --output model.glb
```

#### Example — JavaScript (Frontend)

```javascript
const formData = new FormData();
formData.append("image", file);

const res = await fetch("/api/generate-3d", {
  method: "POST",
  body: formData,
});

const blob = await res.blob();
const url = URL.createObjectURL(blob);
// Use `url` to render in a 3D viewer or trigger a download
```

---

## Technologies Used

### Frontend

| Technology                                       | Version | Purpose                                                           |
| ------------------------------------------------ | ------- | ----------------------------------------------------------------- |
| [Next.js](https://nextjs.org/)                   | 16.1.6  | React framework with App Router                                   |
| [React](https://react.dev/)                      | 19.2.3  | UI library                                                        |
| [TypeScript](https://www.typescriptlang.org/)    | 5.x     | Type safety                                                       |
| [Tailwind CSS](https://tailwindcss.com/)         | 4.x     | Utility-first CSS                                                 |
| [Shadcn UI](https://ui.shadcn.com/)              | 3.8.5   | Accessible UI components (Button, Card, Progress, Separator)      |
| [React Three Fiber](https://r3f.docs.pmnd.rs/)   | 9.5.0   | Declarative Three.js renderer                                     |
| [@react-three/drei](https://drei.docs.pmnd.rs/)  | 10.7.7  | R3F helpers (OrbitControls, useGLTF, Environment, ContactShadows) |
| [Three.js](https://threejs.org/)                 | 0.183.2 | 3D graphics engine                                                |
| [react-dropzone](https://react-dropzone.js.org/) | 15.0.0  | Drag-and-drop file uploads                                        |
| [Lucide React](https://lucide.dev/)              | 0.576.0 | Icon library                                                      |

### Backend

| Technology                                            | Version  | Purpose                                          |
| ----------------------------------------------------- | -------- | ------------------------------------------------ |
| [Flask](https://flask.palletsprojects.com/)           | ≥ 3.1.0  | Web framework                                    |
| [Flask-CORS](https://flask-cors.readthedocs.io/)      | ≥ 5.0.0  | Cross-origin resource sharing                    |
| [PyTorch](https://pytorch.org/)                       | ≥ 2.5.0  | Deep learning runtime (CUDA)                     |
| [Hunyuan3D-2](https://github.com/Tencent/Hunyuan3D-2) | Latest   | Hunyuan3DDiTFlowMatchingPipeline for image-to-3D |
| [Pillow](https://pillow.readthedocs.io/)              | ≥ 10.4.0 | Image preprocessing                              |
| [trimesh](https://trimesh.org/)                       | ≥ 4.5.0  | 3D mesh handling and GLB export                  |
| [NumPy](https://numpy.org/)                           | ≥ 1.26.0 | Numerical computing                              |

---

## License

This project is for portfolio/personal use. The Hunyuan3D-2 model is subject to [Tencent's license terms](https://github.com/Tencent/Hunyuan3D-2/blob/main/LICENSE).
