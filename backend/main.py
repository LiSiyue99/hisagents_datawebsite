#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HistBench数据浏览后端API
FastAPI + Pandas + 静态文件服务
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
import mimetypes
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse, StreamingResponse
from io import BytesIO
from PIL import Image

# 全局变量存储数据
df = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    global df
    print("🚀 应用启动，开始加载数据...")
    load_data()
    # 挂载静态文件目录
    app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")
    print("✅ 数据和静态目录加载完成")
    yield
    # 应用关闭时执行 (如果需要)
    print("应用关闭")

app = FastAPI(
    title="HistBench API",
    description="历史题目数据浏览API",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001", 
        "http://localhost:3002", "http://127.0.0.1:3002",
        "http://localhost:3003", "http://127.0.0.1:3003"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据文件路径
DATA_FILE = "data/processed/Sheet1.csv"
MEDIA_DIR = Path("data/raw/HistBench_complete")

# 数据模型
class QuestionItem(BaseModel):
    task_id: int
    question: str
    level: int
    answer_type: str
    final_answer: str
    file_name: Optional[str] = None
    answer_explanation: Optional[str] = None
    media_files: List[str] = []

class QuestionResponse(BaseModel):
    total: int
    page: int
    per_page: int
    data: List[QuestionItem]

class StatsResponse(BaseModel):
    total_questions: int
    level_distribution: dict
    answer_type_distribution: dict
    has_media_count: int

class QuestionIndexItem(BaseModel):
    task_id: int
    level: int
    answer_type: str

def load_data():
    """加载CSV数据"""
    global df
    if df is None:
        try:
            df = pd.read_csv(DATA_FILE)
            # 数据清洗
            df = df.fillna("")
            # 标准化答案类型
            df['Answer Type'] = df['Answer Type'].str.replace('Multiple Choice', 'multipleChoice')
            df['Answer Type'] = df['Answer Type'].str.replace('Multiple choice', 'multipleChoice')  
            df['Answer Type'] = df['Answer Type'].str.replace('mutipleChioce', 'multipleChoice')
            df['Answer Type'] = df['Answer Type'].str.replace('Exact match', 'exactMatch')
            print(f"✅ 数据加载成功: {len(df)} 条记录")
        except Exception as e:
            print(f"❌ 数据加载失败: {e}")
            raise e
    return df

def find_media_files(file_name: str) -> List[str]:
    """根据文件名查找对应的媒体文件"""
    if not file_name:
        return []
    
    media_files = []
    
    # 分割多个文件名（用分号分隔）
    file_names = [f.strip() for f in file_name.split(';') if f.strip()]
    
    for fname in file_names:
        # 查找完全匹配的文件
        for media_file in MEDIA_DIR.rglob("*"):
            if media_file.is_file() and media_file.name == fname:
                # 返回相对路径
                relative_path = str(media_file.relative_to(MEDIA_DIR))
                media_files.append(relative_path)
                break
    
    return media_files

@app.get("/", summary="API根路径")
async def root():
    return {"message": "HistBench API 服务正在运行", "version": "1.0.0"}

@app.get("/stats", response_model=StatsResponse, summary="获取数据统计信息")
async def get_stats():
    """获取数据统计信息"""
    data = load_data()
    
    level_dist = data['Level'].value_counts().to_dict()
    answer_type_dist = data['Answer Type'].value_counts().to_dict()
    has_media = (data['file_name'] != "").sum()
    
    return StatsResponse(
        total_questions=len(data),
        level_distribution=level_dist,
        answer_type_distribution=answer_type_dist,
        has_media_count=int(has_media)
    )

@app.get("/questions", response_model=QuestionResponse, summary="获取题目列表")
async def get_questions(
    page: int = Query(1, ge=1, description="页码"),
    per_page: int = Query(20, ge=1, le=100, description="每页数量"),
    level: Optional[int] = Query(None, description="难度级别筛选"),
    answer_type: Optional[str] = Query(None, description="答案类型筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    has_media: Optional[bool] = Query(None, description="是否有媒体文件")
):
    """获取题目列表，支持分页和筛选"""
    data = load_data().copy()
    
    # 筛选逻辑
    if level is not None:
        data = data[data['Level'] == level]
    
    if answer_type:
        data = data[data['Answer Type'] == answer_type]
    
    if search:
        # 在问题和答案中搜索
        mask = (data['Question'].str.contains(search, case=False, na=False) | 
                data['Final answer'].str.contains(search, case=False, na=False))
        data = data[mask]
    
    if has_media is not None:
        if has_media:
            data = data[data['file_name'] != ""]
        else:
            data = data[data['file_name'] == ""]
    
    # 分页
    total = len(data)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    page_data = data.iloc[start_idx:end_idx]
    
    # 转换为响应格式
    questions = []
    for _, row in page_data.iterrows():
        media_files = find_media_files(row['file_name'])
        
        question = QuestionItem(
            task_id=int(row['task_id']),
            question=row['Question'],
            level=int(row['Level']),
            answer_type=row['Answer Type'],
            final_answer=row['Final answer'],
            file_name=row['file_name'] if row['file_name'] else None,
            answer_explanation=row['Answer Explanation'] if row['Answer Explanation'] else None,
            media_files=media_files
        )
        questions.append(question)
    
    return QuestionResponse(
        total=total,
        page=page,
        per_page=per_page,
        data=questions
    )

@app.get("/questions/index", response_model=List[QuestionIndexItem], summary="获取所有题目的索引信息")
async def get_questions_index():
    """获取所有题目的核心元数据，用于索引面板"""
    data = load_data()
    
    # 只选择需要的列
    index_data = data[['task_id', 'Level', 'Answer Type']].copy()
    index_data.rename(columns={'Level': 'level', 'Answer Type': 'answer_type'}, inplace=True)
    
    # 转换为字典列表
    result = index_data.to_dict(orient='records')
    return result

@app.get("/questions/{task_id}", response_model=QuestionItem, summary="获取单个题目详情")
async def get_question(task_id: int):
    """获取单个题目的详细信息"""
    data = load_data()
    question_data = data[data['task_id'] == task_id]
    
    if question_data.empty:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    row = question_data.iloc[0]
    media_files = find_media_files(row['file_name'])
    
    return QuestionItem(
        task_id=int(row['task_id']),
        question=row['Question'],
        level=int(row['Level']),
        answer_type=row['Answer Type'],
        final_answer=row['Final answer'],
        file_name=row['file_name'] if row['file_name'] else None,
        answer_explanation=row['Answer Explanation'] if row['Answer Explanation'] else None,
        media_files=media_files
    )

@app.get("/media-info/{file_path:path}", summary="获取媒体文件信息")
async def get_media_info(file_path: str):
    """获取媒体文件的类型和大小信息"""
    full_path = MEDIA_DIR / file_path
    
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 获取文件信息
    file_size = full_path.stat().st_size
    mime_type, _ = mimetypes.guess_type(str(full_path))
    
    return {
        "file_name": full_path.name,
        "file_size": file_size,
        "mime_type": mime_type,
        "file_extension": full_path.suffix.lower(),
        "is_image": mime_type and mime_type.startswith("image/"),
        "is_video": mime_type and mime_type.startswith("video/"),
        "is_audio": mime_type and mime_type.startswith("audio/"),
        "is_pdf": full_path.suffix.lower() == ".pdf"
    }

@app.get("/media-convert/{file_path:path}", summary="媒体文件动态转换（目前仅支持TIFF→PNG）")
async def convert_media(file_path: str):
    """如果请求的文件是 .tif/.tiff，则在线转换为 PNG 并返回。否则直接返回原文件。"""
    full_path = MEDIA_DIR / file_path
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    ext = full_path.suffix.lower()

    # 仅处理 TIFF
    if ext in {'.tif', '.tiff'}:
        try:
            img = Image.open(full_path)
            buf = BytesIO()
            img.save(buf, format="PNG")
            buf.seek(0)
            return StreamingResponse(buf, media_type="image/png")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"TIFF conversion failed: {e}")

    # 其他格式直接返回原始文件
    mime, _ = mimetypes.guess_type(full_path)
    return FileResponse(full_path, media_type=mime or "application/octet-stream")

if __name__ == "__main__":
    import uvicorn
    print("🚀 启动HistBench API服务 (开发模式)...")
    print("📖 API文档: http://localhost:8000/docs")
    print("🌐 前端地址: http://localhost:3000")
    # 注意: 在生产环境中，推荐使用Gunicorn等WSGI服务器来运行Uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, app_dir="backend") 