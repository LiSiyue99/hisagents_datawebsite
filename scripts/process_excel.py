#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将HistBench.xlsx转换为CSV文件
"""

import pandas as pd
from pathlib import Path

def main():
    """主函数"""
    print("🎯 HistBench数据预处理")
    print("=" * 50)
    
    # 检查Excel文件
    excel_file = Path("data/raw/HistBench.xlsx")
    if not excel_file.exists():
        print("❌ 没有找到HistBench.xlsx文件")
        return
    
    try:
        print("🔄 开始处理Excel文件...")
        
        # 读取Excel文件
        excel_data = pd.ExcelFile(excel_file)
        print(f"📋 发现工作表: {excel_data.sheet_names}")
        
        # 确保输出目录存在
        Path("data/processed").mkdir(parents=True, exist_ok=True)
        
        # 处理每个工作表
        for sheet_name in excel_data.sheet_names:
            print(f"📊 处理工作表: {sheet_name}")
            
            # 读取工作表数据
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            print(f"  - 数据形状: {df.shape}")
            print(f"  - 列名: {list(df.columns)}")
            
            # 保存为CSV
            output_file = Path(f"data/processed/{sheet_name}.csv")
            df.to_csv(output_file, index=False, encoding='utf-8')
            print(f"  ✅ 保存到: {output_file}")
        
        print("🎉 Excel文件处理完成！")
        print("\n💡 现在可以运行分析脚本了：")
        print("   python scripts/analyze_histbench.py")
        
    except Exception as e:
        print(f"❌ 处理Excel文件时出错: {str(e)}")

if __name__ == "__main__":
    main() 