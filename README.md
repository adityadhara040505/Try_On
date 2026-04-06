# 👗 VTON AI Studio: Virtual Try-On

A modern, high-fashion virtual try-on application featuring a glassmorphism UI and powered by open-source AI models.

## ✨ Features
- **Instant AI Styling**: High-quality virtual try-on for any garment.
- **Gallery Mode**: Saves your created looks to a personal local history.
- **Real-Time Monitoring**: Detailed status tracking of the AI engine.
- **Truly Free**: Utilizing community-hosted models (No API Keys needed!).

## 🚀 Getting Started

### 1. Setup the Codebase
Clone the repo and install dependencies:
```bash
npm install
```

### 2. (Optional) Run Models Locally
If you have an NVIDIA GPU with 16GB+ VRAM, you can download the model weights to your machine:
```bash
chmod +x setup_models.sh
./setup_models.sh
```
*Note: This downloads about 15GB of raw model data.*

### 3. Run the Studio
Start the development server:
```bash
npm run dev
```

---

## 🎨 UI & Aesthetics
This project uses a custom styling engine designed for high-fashion aesthetics:
- **Glassmorphism**: Layered прозрачность and blur for a premium digital feel.
- **Animated Logos & Loaders**: Built with Framer Motion.
- **Dynamic Previews**: Instant feedback during the upload process.

## 🤝 For Developers
The project is built on **React + Vite** and uses the **Gradio JS Client** to connect to open-source **IDM-VTON** spaces in the cloud (hosted by Hugging Face). 

To share this with a friend, simply push this code to a new GitHub repository and follow the instructions in this README!

---
© 2026 VTON AI Studio
