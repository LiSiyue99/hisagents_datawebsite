'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getQuestions, getStats, Question, Stats, getQuestion, getQuestionsIndex, QuestionIndexItem } from '@/lib/api'
import { QuestionCard } from '@/components/ui-custom/question-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { IndexPanel } from '@/components/ui-custom/IndexPanel'
import { QuestionDetailDialog } from '@/components/ui-custom/QuestionDetailDialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [indexQuestions, setIndexQuestions] = useState<QuestionIndexItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [level, setLevel] = useState<number | undefined>(undefined)
  const [answerType, setAnswerType] = useState<string | undefined>(undefined)
  const [hasMedia, setHasMedia] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [detailQuestion, setDetailQuestion] = useState<Question | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewZoom, setPreviewZoom] = useState<number>(1)

  const isClient = typeof window !== 'undefined';

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getQuestions({
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
        level: level,
        answer_type: answerType,
      })
      setQuestions(data.data)
      setTotalPages(Math.ceil(data.total / data.per_page))
    } catch (e) {
      setError('加载题目失败，请确保后端服务已启动 (python start_backend.py)')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, searchTerm, level, answerType])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statsData, indexData] = await Promise.all([
          getStats(),
          getQuestionsIndex(),
        ]);
        setStats(statsData);
        setIndexQuestions(indexData);
      } catch (e) {
        console.error('Failed to load stats or index', e);
      }
    }
    loadInitialData();
  }, []);
  
  const handleShowDetails = useCallback(async (taskId: number) => {
    setIsDetailLoading(true)
    setDetailQuestion(null) // 清除旧数据
    try {
      const data = await getQuestion(taskId);
      setDetailQuestion(data)
    } catch (e) {
      setError(`加载题目 #${taskId} 详情失败`)
      console.error(e)
      setDetailQuestion(null) // 确保失败时弹窗不显示
    } finally {
      setIsDetailLoading(false)
    }
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchQuestions()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }
  
  const levelChartData = stats ? Object.entries(stats.level_distribution).map(([key, value]) => ({ name: `难度 ${key}`, '题目数': value })) : []
  const answerTypeChartData = stats ? Object.entries(stats.answer_type_distribution).map(([key, value]) => ({ name: key, '题目数': value })) : []

  // 当切换图片或关闭时重置缩放
  useEffect(() => {
    setPreviewZoom(1)
  }, [previewImage])

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      {stats && <IndexPanel questions={indexQuestions} totalQuestions={stats.total_questions} onSelectQuestion={handleShowDetails} />}
      
      <QuestionDetailDialog
        question={detailQuestion}
        open={!!detailQuestion || isDetailLoading}
        onOpenChange={(open) => !open && setDetailQuestion(null)}
        onImagePreview={setPreviewImage}
      />

      {/* 独立的图片预览Dialog */}
      {previewImage && (
        <Dialog
          open={!!previewImage}
          onOpenChange={(open) => {
            if (!open) setPreviewImage(null)
          }}
          modal={false}
        >
          <DialogContent className="z-60 p-0 bg-transparent border-none shadow-none max-w-[95vw] sm:max-w-5xl max-h-[90vh] flex items-center justify-center">
            <div className="w-auto h-auto relative bg-black/90 rounded-lg overflow-hidden">
              <DialogTitle className="sr-only">图片预览</DialogTitle>
              <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                <Button size="icon" variant="secondary" onClick={() => setPreviewZoom((z) => Math.max(0.25, z - 0.25))}>-</Button>
                <span className="text-white w-12 text-center select-none">{Math.round(previewZoom * 100)}%</span>
                <Button size="icon" variant="secondary" onClick={() => setPreviewZoom((z) => Math.min(4, z + 0.25))}>+</Button>
              </div>
              <div className="w-full max-h-[85vh] overflow-auto flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="预览"
                  style={{ width: `${previewZoom * 100}%`, height: 'auto' }}
                  className="object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">HistBench 历史题目浏览器</h1>
        <p className="text-lg text-gray-600 mt-2">探索、筛选和查看详细的历史问题</p>
      </header>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">发生错误!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      
      {/* 统计信息 */}
      {stats && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">数据概览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>总题目数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total_questions}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader><CardTitle>题目难度分布</CardTitle></CardHeader>
                <CardContent>
                    {isClient && (
                      <ResponsiveContainer width="100%" height={100}>
                        <BarChart data={levelChartData}>
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="题目数" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* 筛选和搜索 */}
      <Card className="mb-8 p-6 bg-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* 搜索框 */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">搜索问题</label>
            <Input
              id="search"
              type="text"
              placeholder="输入关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>

          {/* 难度筛选 */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">难度</label>
            <Select onValueChange={(value) => setLevel(value === 'all' ? undefined : Number(value))} defaultValue="all">
              <SelectTrigger id="level"><SelectValue placeholder="所有难度" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有难度</SelectItem>
                <SelectItem value="1">简单</SelectItem>
                <SelectItem value="2">中等</SelectItem>
                <SelectItem value="3">困难</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 答案类型筛选 */}
          <div>
            <label htmlFor="answerType" className="block text-sm font-medium text-gray-700 mb-1">答案类型</label>
            <Select onValueChange={(value) => setAnswerType(value === 'all' ? undefined : value)} defaultValue="all">
              <SelectTrigger id="answerType"><SelectValue placeholder="所有类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="exactMatch">准确匹配</SelectItem>
                <SelectItem value="multipleChoice">选择题</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 媒体文件筛选 */}
          <div className='flex flex-col gap-2'>
             <label htmlFor="hasMedia" className="block text-sm font-medium text-gray-700 mb-1">媒体文件</label>
            <Select onValueChange={(value) => setHasMedia(value === 'all' ? undefined : value === 'true')} defaultValue="all">
              <SelectTrigger id="hasMedia"><SelectValue placeholder="媒体文件" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">不限</SelectItem>
                <SelectItem value="true">有</SelectItem>
                <SelectItem value="false">无</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 应用筛选按钮 */}
          <div className="lg:col-span-4">
             <Button onClick={handleSearch} className="w-full mt-4" disabled={loading}>
              {loading ? '加载中...' : '应用筛选'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 问题列表 */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">加载中，请稍候...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {questions.map((q) => (
              <QuestionCard key={q.task_id} question={q} onShowDetails={handleShowDetails} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1) }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                     const pageNum = i + 1;
                     if (totalPages <= 7 || (pageNum <= 3) || (pageNum >= totalPages - 2) || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                       return (
                         <PaginationItem key={i}>
                           <PaginationLink 
                             href="#"
                             isActive={currentPage === pageNum}
                             onClick={(e) => { e.preventDefault(); handlePageChange(pageNum) }}
                           >
                             {pageNum}
                           </PaginationLink>
                         </PaginationItem>
                       );
                     } else if (pageNum === 4 || pageNum === totalPages - 3) {
                         return <PaginationItem key={i}><span className="px-4 py-2">...</span></PaginationItem>
                     }
                     return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1) }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {questions.length === 0 && !loading && (
             <div className="text-center py-10 col-span-full">
                <p className="text-lg text-gray-600">没有找到符合条件的题目。</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
