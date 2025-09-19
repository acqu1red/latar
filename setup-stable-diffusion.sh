#!/bin/bash

echo "🚀 Установка Stable Diffusion WebUI с ControlNet"

# Переходим в папку проекта
cd "$(dirname "$0")"

# Проверяем наличие Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.10+ и попробуйте снова."
    exit 1
fi

# Переходим в папку WebUI
cd stable-diffusion-webui

echo "📦 Устанавливаем зависимости..."

# Создаем виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Устанавливаем зависимости
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt

echo "🎯 Устанавливаем ControlNet..."

# Создаем папку для расширений
mkdir -p extensions

# Клонируем ControlNet
if [ ! -d "extensions/sd-webui-controlnet" ]; then
    git clone https://github.com/Mikubill/sd-webui-controlnet.git extensions/sd-webui-controlnet
fi

# Скачиваем модель ControlNet для scribble
mkdir -p models/ControlNet
cd models/ControlNet

if [ ! -f "control_v11p_sd15_scribble.pth" ]; then
    echo "📥 Скачиваем модель ControlNet для scribble..."
    wget https://huggingface.co/lllyasviel/ControlNet/resolve/main/models/control_v11p_sd15_scribble.pth
fi

cd ../../

echo "📥 Скачиваем базовую модель Stable Diffusion..."

# Скачиваем базовую модель
mkdir -p models/Stable-diffusion
cd models/Stable-diffusion

if [ ! -f "v1-5-pruned-emaonly.ckpt" ]; then
    echo "📥 Скачиваем Stable Diffusion 1.5..."
    wget https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt
fi

cd ../../

echo "✅ Установка завершена!"
echo ""
echo "🎯 Для запуска Stable Diffusion WebUI выполните:"
echo "   cd stable-diffusion-webui"
echo "   source venv/bin/activate"
echo "   python webui.py --api --listen"
echo ""
echo "🌐 WebUI будет доступен по адресу: http://127.0.0.1:7860"
echo "🔧 API будет доступен по адресу: http://127.0.0.1:7860/sdapi/v1/"
