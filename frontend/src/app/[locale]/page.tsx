'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getQuestions, getStats, Question, Stats, getQuestion, getQuestionsIndex, QuestionIndexItem } from '@/lib/api'
import { QuestionCard } from '@/components/ui-custom/question-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { IndexPanel } from '@/components/ui-custom/IndexPanel'
import { QuestionDetailDialog } from '@/components/ui-custom/QuestionDetailDialog'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Globe, Book, Github, Cpu } from 'lucide-react'
import Image from 'next/image'
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip } from 'recharts'
import DatasetSection from '@/components/ui-custom/DatasetSection'

const languageDistributionData = [
  { name: 'English', count: 228 },
  { name: 'Chinese', count: 52 },
  { name: 'Classical Chinese', count: 47 },
  { name: 'Russian', count: 22 },
  { name: 'Japanese', count: 13 },
  { name: 'French', count: 10 },
  { name: 'Latin', count: 8 },
  { name: 'German', count: 8 },
  { name: 'Dutch', count: 5 },
  { name: 'Tibetan', count: 2 },
  { name: 'Armenian', count: 2 },
  { name: 'Arabic', count: 2 },
  { name: 'Khitan', count: 2 },
  { name: 'Ancient Greek', count: 2 },
  { name: 'Khmer', count: 1 },
  { name: 'Indonesian', count: 1 },
  { name: 'Old Tibetan', count: 1 },
  { name: 'Sanskrit', count: 1 },
  { name: 'Old Uyghur', count: 1 },
  { name: 'Middle Polish', count: 1 },
  { name: 'Aramaic', count: 1 },
  { name: 'Danish', count: 1 },
  { name: 'Bosnian', count: 1 },
  { name: 'Italian', count: 1 },
  { name: 'Macedonian', count: 1 },
  { name: 'Yukaghir', count: 1 },
].sort((a, b) => b.count - a.count);

// 难度分布饼图颜色
const LEVEL_COLORS = ['#34d399', '#60a5fa', '#f87171'];

export default function HomePage() {
  const t = useTranslations('HomePage');
  const tLevels = useTranslations('Levels');
  const tAnswerTypes = useTranslations('AnswerTypes');
  const tOverview = useTranslations('Overview');
  const tFilter = useTranslations('FilterControls');
  const tQuestions = useTranslations('Questions');
  const [questions, setQuestions] = useState<Question[]>([])
  const [allQuestionsForIndex, setAllQuestionsForIndex] = useState<QuestionIndexItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [level, setLevel] = useState<number | undefined>(undefined)
  const [answerType, setAnswerType] = useState<string | undefined>(undefined)
  const [mediaType, setMediaType] = useState<string | undefined>(undefined)
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
        media_type: mediaType,
      })
      setQuestions([...data.data].sort((a, b) => a.task_id - b.task_id))
      setTotalPages(Math.ceil(data.total / data.per_page))
    } catch (e) {
      setError(t('loadingError'))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, searchTerm, level, answerType, mediaType, t])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statsData, indexData] = await Promise.all([
          getStats(),
          getQuestionsIndex()
        ]);
        setStats(statsData)
        setAllQuestionsForIndex([...indexData].sort((a, b) => a.task_id - b.task_id));
      } catch (e) {
        console.error('Failed to load stats or question index', e)
        setError('加载索引或统计信息失败');
      }
    }
    loadInitialData()
  }, [])
  
  const handleShowDetails = useCallback(async (taskId: number) => {
    setIsDetailLoading(true)
    setDetailQuestion(null)
    try {
      const data = await getQuestion(taskId);
      setDetailQuestion(data)
    } catch (e) {
      setError(t('loadingDetailsError', { taskId }))
      console.error(e)
      setDetailQuestion(null)
    } finally {
      setIsDetailLoading(false)
    }
  }, [t])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchQuestions()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }
  
  const levelChartData = stats ? Object.entries(stats.level_distribution).map(([key, value]) => ({ name: tLevels(key), [t('questionsCount')]: value as number })) : []
  const answerTypeChartData = stats ? Object.entries(stats.answer_type_distribution).map(([key, value]) => ({ name: tAnswerTypes(key), [t('questionsCount')]: value as number })) : []
  const mediaTypeChartData = stats ? Object.entries(stats.media_type_distribution).map(([key, value]) => ({ name: t(`MediaTypes.${key}`), [t('questionsCount')]: value as number })) : []

  useEffect(() => {
    setPreviewZoom(1)
  }, [previewImage])

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      {stats && <IndexPanel questions={allQuestionsForIndex} totalQuestions={stats.total_questions} onSelectQuestion={handleShowDetails} />}
      
      <QuestionDetailDialog
        question={detailQuestion}
        open={!!detailQuestion || isDetailLoading}
        onOpenChange={(open) => {
          // 只有在没有图片预览时才允许关闭题目详情对话框
          if (!open && !previewImage) {
            setDetailQuestion(null)
          }
        }}
        onImagePreview={setPreviewImage}
      />

      {previewImage && (
        <Dialog
          open={!!previewImage}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewImage(null)
              setPreviewZoom(1) // 重置缩放
            }
          }}
          modal={true}
        >
          <DialogContent 
            className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
            onInteractOutside={(e) => {
              e.preventDefault() // 防止点击外部关闭，只能通过按钮关闭
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault() // 防止ESC键关闭题目详情对话框
              setPreviewImage(null)
              setPreviewZoom(1)
            }}
          >
            <div className="relative w-full h-[95vh] flex flex-col">
              <DialogTitle className="sr-only">{t('imagePreviewTitle')}</DialogTitle>
              
              {/* 关闭按钮和缩放控制 */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewZoom((z) => Math.max(0.25, z - 0.25))
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600 shadow-lg"
                >
                  -
                </Button>
                <span className="text-white w-12 text-center select-none bg-gray-800 px-2 py-1 rounded text-sm border-2 border-gray-600 shadow-lg">
                  {Math.round(previewZoom * 100)}%
                </span>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewZoom((z) => Math.min(4, z + 0.25))
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600 shadow-lg"
                >
                  +
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={(e) => {
                    e.stopPropagation() // 防止事件冒泡
                    setPreviewImage(null)
                    setPreviewZoom(1)
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white border-2 border-red-500 shadow-lg"
                >
                  ✕
                </Button>
              </div>
              
              {/* 图片容器 - 确保居中显示 */}
              <div className="flex-1 overflow-auto">
                <div className="min-h-full flex items-center justify-center p-4">
                  <img
                    src={previewImage}
                    alt={t('imagePreviewAlt')}
                    style={{ 
                      transform: `scale(${previewZoom})`,
                      transformOrigin: 'center',
                      maxWidth: previewZoom <= 1 ? '100%' : 'none',
                      maxHeight: previewZoom <= 1 ? '100%' : 'none',
                      display: 'block'
                    }}
                    className="transition-transform duration-200"
                    onClick={(e) => {
                      // 点击图片本身时不关闭对话框
                      e.stopPropagation()
                    }}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-16">

        {/* 顶部标题 */}
        <header className="text-center mb-8 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            {t('title')}
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-500 max-w-4xl mx-auto">{t('subtitle')}</p>
        </header>

        {/* 数据集与论文信息 */}
        <DatasetSection stats={stats} />

        {/* 数据概览 */}
        {stats && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">{tOverview('heading')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{tOverview('totalQuestions')}</CardTitle>
                  <p className="text-xs text-muted-foreground pt-1">{tOverview('totalQuestionsDesc')}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total_questions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{tOverview('languages')}</CardTitle>
                  <p className="text-xs text-muted-foreground pt-1">{tOverview('languagesDesc')}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">26</p>
                </CardContent>
              </Card>

              {/* Difficulty Distribution */}
              <Card className="lg:col-span-2 row-span-2">
                <CardHeader>
                  <CardTitle>{tOverview('difficultyDistribution')}</CardTitle>
                  <p className="text-xs text-muted-foreground pt-1">{tOverview('difficultyDesc')}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 h-[250px]">
                    {isClient && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={levelChartData} dataKey={t('questionsCount')} nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                             {levelChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#34d399', '#60a5fa', '#f87171'][index % 3]} />)}
                          </Pie>
                          <ReTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="flex flex-col justify-center text-sm space-y-2">
                      <h3 className="font-semibold mb-2">{tOverview('difficultyDistribution')}</h3>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li><span className="text-green-500 font-bold">1:</span> {tOverview('level1')}</li>
                        <li><span className="text-blue-400 font-bold">2:</span> {tOverview('level2')}</li>
                        <li><span className="text-red-500 font-bold">3:</span> {tOverview('level3')}</li>
                      </ul>
                    </div>
                </CardContent>
              </Card>

              {/* Media Type Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{tOverview('mediaTypeDistribution')}</CardTitle>
                  <p className="text-xs text-muted-foreground pt-1">{tOverview('mediaTypeDesc')}</p>
                </CardHeader>
                <CardContent className="h-[250px]">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={mediaTypeChartData} dataKey={t('questionsCount')} nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {mediaTypeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#22c55e', '#3b82f6', '#ef4444', '#f97316', '#a855f7', '#f59e0b'][index % 6]} />)}
                        </Pie>
                        <ReTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* 搜索和筛选 */}
        <section id="search" className="mb-8 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2 xl:col-span-2">
              <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">{t('searchLabel')}</label>
              <Input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('searchPlaceholder')}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="level-select" className="block text-sm font-medium text-gray-700 mb-1">{t('levelLabel')}</label>
              <Select value={level?.toString() || 'all'} onValueChange={(v) => setLevel(v === 'all' ? undefined : Number(v))}>
                <SelectTrigger id="level-select">
                  <SelectValue placeholder={t('levelPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allLevels')}</SelectItem>
                  <SelectItem value="1">{tLevels('1')}</SelectItem>
                  <SelectItem value="2">{tLevels('2')}</SelectItem>
                  <SelectItem value="3">{tLevels('3')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 mb-1">{t('typeLabel')}</label>
              <Select value={answerType || 'all'} onValueChange={(v) => setAnswerType(v === 'all' ? undefined : v)}>
                <SelectTrigger id="type-select">
                  <SelectValue placeholder={t('typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="multipleChoice">{tAnswerTypes('multipleChoice')}</SelectItem>
                  <SelectItem value="exactMatch">{tAnswerTypes('exactMatch')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor="media-select" className="block text-sm font-medium text-gray-700 mb-1">{t('mediaLabel')}</label>
              <Select value={mediaType || 'all'} onValueChange={(v) => setMediaType(v === 'all' ? undefined : v)}>
                <SelectTrigger id="media-select">
                  <SelectValue placeholder={t('mediaPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allMedia')}</SelectItem>
                  <SelectItem value="image">{t('MediaTypes.image')}</SelectItem>
                  <SelectItem value="video">{t('MediaTypes.video')}</SelectItem>
                  <SelectItem value="audio">{t('MediaTypes.audio')}</SelectItem>
                  <SelectItem value="document">{t('MediaTypes.document')}</SelectItem>
                  <SelectItem value="reference">{t('MediaTypes.reference')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-4">
              <Button onClick={handleSearch} className="w-full mt-4" disabled={loading}>
                {loading ? t('loading') : t('applyFilters')}
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">{t('loadingPleaseWait')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {questions.map((q) => (
                <QuestionCard key={q.task_id} question={q} onShowDetails={handleShowDetails} />
              ))}
            </div>

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
          </>
        )}
      </main>
    </div>
  )
} 