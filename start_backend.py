#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HistBench后端启动脚本
"""

import subprocess
import sys
import os
from pathlib import Path

def start_backend():
    """启动后端服务"""
    print("🚀 启动HistBench后端服务...")
    
    # 定义Uvicorn命令
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]
    
    # 确保在正确的目录中 (项目根目录)
    os.chdir(Path(__file__).parent)
    
    try:
        # 启动FastAPI服务
        print(f"🏃‍♀️ 运行命令: {' '.join(command)}")
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 后端启动失败: {e}")
    except KeyboardInterrupt:
        print("\n🛑 后端服务已停止")

def main():
    print("🎯 HistBench后端启动器")
    print("=" * 50)
    # 检查数据文件
    if not Path("data/processed/Sheet1.csv").exists():
        print("❌ 数据文件不存在，请先准备好数据文件")
        return
    # 直接启动服务
    start_backend()

if __name__ == "__main__":
    main() 