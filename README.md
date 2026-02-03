# Neural Network Visualizer 🧠

A professional, web-based tool for inspecting Keras/TensorFlow architectures (`.h5`, `.keras`). It parses deep learning models into interactive, interpretable graphs, extracting layer details, tensor shapes, and computational statistics (FLOPs/Params).

![System Preview](https://via.placeholder.com/1200x600?text=Neural+Visualizer+Preview)

---

## 🚀 Features

- **Universal Parsing**: Handles both **Sequential** and **Functional** Keras models.
- **Interactive Graph**: Zoom, pan, and drag nodes to explore complex architectures.
- **Deep Inspection**: Click any node to reveal:
    - Kernel size, strides, and activation functions.
    - Exact tensor input/output shapes.
    - Parameter counts and estimated FLOPs.
- **Smart Fallback**: Robust loading strategies (including direct HDF5 binary parsing) to handle version mismatches.
- **Premium UI**: Glassmorphism design with high-contrast visualization for clarity.

---

## 🛠️ System Architecture

The project follows a modular **Client-Server** architecture:

### **Backend (FastAPI)**
- **Core Loader**: Attempts multiple loading strategies (`tf.keras.load_model`, `h5py` direct parse) to ensure compatibility.
- **Parser Engine**: Traverses the internal Keras graph (DAG) and converts it into a standardized **Intermediate Graph Representation (IGR)**.
- **Analyzer**: Calculates derived statistics like FLOPs based on layer types and tensor dimensions.

### **Frontend (React + Vite)**
- **React Flow**: Renders the IGR as an interactive graph using GPU acceleration.
- **Design System**: Tailwind CSS with a strict color-coding logic:
    - 🟦 **Conv2D**: Blue (Feature Extraction)
    - 🟪 **Dense**: Purple (Decision/Logic)
    - 🟧 **RNN**: Orange (Temporal)
    - 🟩 **Pooling**: Emerald (Downsampling)

---

## 🚦 Quick Start Guide

Follow these steps to run the visualizer locally.

### Prerequisites
- **Python 3.9+**
- **Node.js 16+**

### 1. Setup Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Backend runs on: `http://localhost:8000`*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173` (typically)*

### 3. Usage
1. Open the frontend URL in your browser.
2. Drag and drop a `.h5` or `.keras` file anywhere on the screen.
3. Watch the neural graph appear instantly.
4. Click on any node to inspect its internal configuration.

---

## 📂 File Structure

```
neural_network_visualizer/
├── backend/
│   ├── core/
│   │   ├── loader.py       # Safe Loading Logic
│   │   ├── parser.py       # Graph Extraction
│   │   └── analyzer.py     # FLOPs/Stats Engine
│   ├── routers/            # API Endpoints
│   └── main.py             # Server Entry Point
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CustomNode.jsx  # Visualization Component
    │   │   └── Inspector.jsx   # Details Panel
    │   └── App.jsx             # Main Logic
```

---

## 🧩 Visualization Logic

We use a semantic color mapping to make architectures readable at a glance:

| Layer Type | Color | Meaning |
|:---|:---|:---|
| **Convolutional** | 🟦 Blue | Extracts spatial features from images. |
| **Dense (FC)** | 🟪 Purple | Classification and decision making. |
| **Pooling** | 🟩 Green | Reduces dimensionality. |
| **Recurrent** | 🟧 Orange | Handles sequential data (LSTM/GRU). |
| **Input/Output** | ⬜ Gray | Data entry and exit points. |

---

## 🧪 Testing

We have verified the system with:
- Standard VGG16 / ResNet50 (Functional API)
- Simple Sequential Models (List-based Configs)
- Custom Models with user-defined layers (handled via robust fallback)

---

**Developed for Advanced Agentic Coding by Google Deepmind Team.**
