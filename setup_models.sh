#!/bin/bash

# VTON AI Studio - Local Model Downloader
# This script installs requirements and downloads the IDM-VTON model weights.

echo "🎨 VTON AI Studio: Local Model Setup"
echo "-------------------------------------"

# Check for Python
if ! command -v python3 &> /dev/null
then
    echo "❌ Error: Python 3 is not installed. Please install it first."
    exit 1
fi

# Install huggingface_hub if needed
echo "📦 Installing download tools..."
pip install huggingface_hub

# Create models directory
mkdir -p models

# Use huggingface-cli to download the model to the local directory
echo "🚀 Starting download (approx. 15GB)..."
echo "Note: This can take 30-120 mins depending on your connection."

huggingface-cli download yisol/IDM-VTON --local-dir ./models/idm-vton --local-dir-use-symlinks False

if [ $? -eq 0 ]; then
    echo "✅ Success! Models are now in ./models/idm-vton"
else
    echo "❌ Error: Download was interrupted. You can run this script again to resume."
fi

echo "-------------------------------------"
echo "Next steps:"
echo "1. Run 'npm install' to setup the website."
echo "2. Run 'npm run dev' to start the studio."
