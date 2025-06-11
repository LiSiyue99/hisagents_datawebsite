// API调用工具函数
const API_BASE_URL = 'http://localhost:8000'

export interface Question {
  task_id: number
  question: string
  level: number
  answer_type: string
  final_answer: string
  file_name: string | null
  answer_explanation: string | null
  media_files: string[]
}

export interface QuestionIndexItem {
  task_id: number;
  level: number;
  answer_type: string;
}

export interface QuestionResponse {
  total: number
  page: number
  per_page: number
  data: Question[]
}

export interface Stats {
  total_questions: number
  level_distribution: Record<string, number>
  answer_type_distribution: Record<string, number>
  has_media_count: number
}

export interface GetQuestionsParams {
  page?: number
  per_page?: number
  level?: number
  answer_type?: string
  search?: string
  has_media?: boolean
}

// 获取题目列表
export async function getQuestions(params: GetQuestionsParams = {}): Promise<QuestionResponse> {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const response = await fetch(`${API_BASE_URL}/questions?${searchParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch questions')
  }
  
  return response.json()
}

// 获取所有题目索引
export async function getQuestionsIndex(): Promise<QuestionIndexItem[]> {
  const response = await fetch(`${API_BASE_URL}/questions/index`)
  if (!response.ok) {
    throw new Error('Failed to fetch question index')
  }
  return response.json()
}

// 获取单个题目详情
export async function getQuestion(taskId: number): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions/${taskId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch question')
  }
  
  return response.json()
}

// 获取统计信息
export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  
  return response.json()
}

// 获取媒体文件URL
export function getMediaUrl(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'tif' || ext === 'tiff') {
    return `${API_BASE_URL}/media-convert/${filePath}`;
  }
  return `${API_BASE_URL}/media/${filePath}`;
}

// 难度级别标签
export function getLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '1',
    2: '2',
    3: '3'
  }
  return labels[level] || 'unknown'
}

// 答案类型标签
export function getAnswerTypeLabel(answerType: string): string {
  // The answerType string should directly correspond to a key in the translation files.
  // e.g., "exactMatch", "multipleChoice"
  return answerType
} 