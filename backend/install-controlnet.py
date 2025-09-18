#!/usr/bin/env python3
"""
Скрипт для установки ControlNet и необходимых зависимостей
"""

import subprocess
import sys
import os

def install_package(package):
    """Устанавливает Python пакет"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} установлен успешно")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка установки {package}: {e}")
        return False

def main():
    print("🔄 Устанавливаем ControlNet и зависимости...")
    
    # Список необходимых пакетов
    packages = [
        "torch",
        "torchvision", 
        "diffusers",
        "transformers",
        "accelerate",
        "controlnet-aux",
        "opencv-python",
        "Pillow",
        "numpy",
        "scipy",
        "matplotlib",
        "tqdm"
    ]
    
    success_count = 0
    total_count = len(packages)
    
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print(f"\n📊 Результат: {success_count}/{total_count} пакетов установлено успешно")
    
    if success_count == total_count:
        print("🎉 Все зависимости установлены! ControlNet готов к работе.")
    else:
        print("⚠️ Некоторые пакеты не удалось установить. Проверьте ошибки выше.")
    
    # Проверяем доступность GPU
    try:
        import torch
        if torch.cuda.is_available():
            print(f"🚀 GPU доступен: {torch.cuda.get_device_name(0)}")
        else:
            print("💻 GPU недоступен, будет использоваться CPU")
    except ImportError:
        print("⚠️ PyTorch не установлен")

if __name__ == "__main__":
    main()
