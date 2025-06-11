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
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts'

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
  const tOverview = useTranslations('DataOverview');
  const [questions, setQuestions] = useState<Question[]>([])
  const [allQuestionsForIndex, setAllQuestionsForIndex] = useState<QuestionIndexItem[]>([])
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
        has_media: hasMedia,
      })
      setQuestions([...data.data].sort((a, b) => a.task_id - b.task_id))
      setTotalPages(Math.ceil(data.total / data.per_page))
    } catch (e) {
      setError(t('loadingError'))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, searchTerm, level, answerType, hasMedia, t])

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
  
  const levelChartData = stats ? Object.entries(stats.level_distribution).map(([key, value]) => ({ name: tLevels(key), [t('questionsCount')]: value })) : []
  
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

      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-lg text-gray-600 mt-2">{t('description')}</p>
      </header>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">{t('errorOccurred')}</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      
      {stats && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">{t('statsTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalQuestions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total_questions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('withMediaFiles')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.has_media_count}</div>
                </CardContent>
              </Card>
            </div>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{t('difficultyDistribution')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      data={stats ? Object.entries(stats.level_distribution).map(([k,v]) => ({ name: tLevels(k), value: v })) : []}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {Object.entries(stats?.level_distribution ?? {}).map(([_k,_v], idx) => (
                        <Cell key={idx} fill={LEVEL_COLORS[idx % LEVEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(value) => [value, t('questionsCount')]} />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">{tOverview('title')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  {tOverview('paperTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{tOverview('paperName')}</p>
                <p><span className="font-medium">{tOverview('citation')}:</span> {tOverview('citationText')}</p>
                <div className="flex items-center gap-4">
                    <a href="https://doi.org/10.48550/arXiv.2505.20246" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Globe className="w-4 h-4" /> {tOverview('doiLink')}
                    </a>
                    <a href="https://huggingface.co/datasets/jiahaoq/HistBench" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Cpu className="w-4 h-4" /> {tOverview('datasetSource')}
                    </a>
                    <a href="https://github.com/CharlesQ9/HistAgent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Github className="w-4 h-4" /> {tOverview('githubRepo')}
                    </a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tOverview('difficultyTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{tOverview('difficultyDescription')}</p>
                <ul className="space-y-2">
                  <li><strong className="font-semibold">{tOverview('level1Title')}</strong><span className="ml-2 text-gray-700">{tOverview('level1Desc')}</span></li>
                  <li><strong className="font-semibold">{tOverview('level2Title')}</strong><span className="ml-2 text-gray-700">{tOverview('level2Desc')}</span></li>
                  <li><strong className="font-semibold">{tOverview('level3Title')}</strong><span className="ml-2 text-gray-700">{tOverview('level3Desc')}</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
                <CardHeader>
                  <CardTitle>{tOverview('languageDistributionTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-y-auto max-h-96 rounded-2xl shadow-lg border border-gray-200">
                    <table className="w-full text-base border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                          <th className="py-3 px-4 text-left font-bold border-b border-gray-200 rounded-tl-2xl">{tOverview('language')}</th>
                          <th className="py-3 px-4 text-right font-bold border-b border-gray-200 rounded-tr-2xl">{tOverview('questionCount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {languageDistributionData.map((item, idx) => (
                          <tr
                            key={item.name}
                            className={
                              `transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`
                            }
                          >
                            <td className="py-2.5 px-4 whitespace-nowrap border-b border-gray-100 text-gray-800 font-medium">{item.name}</td>
                            <td className="py-2.5 px-4 border-b border-gray-100 text-blue-900 text-right font-semibold">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

      <Card className="mb-8 p-6 bg-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">{t('searchLabel')}</label>
            <Input
              id="search"
              type="text"
              placeholder={t('searchInputPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">{t('difficultyLabel')}</label>
            <Select onValueChange={(value) => setLevel(value === 'all' ? undefined : Number(value))} defaultValue="all">
              <SelectTrigger id="level"><SelectValue placeholder={t('allLevels')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allLevels')}</SelectItem>
                <SelectItem value="1">{tLevels('1')}</SelectItem>
                <SelectItem value="2">{tLevels('2')}</SelectItem>
                <SelectItem value="3">{tLevels('3')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="answerType" className="block text-sm font-medium text-gray-700 mb-1">{t('answerTypeLabel')}</label>
            <Select onValueChange={(value) => setAnswerType(value === 'all' ? undefined : value)} defaultValue="all">
              <SelectTrigger id="answerType"><SelectValue placeholder={t('allTypes')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="exactMatch">{tAnswerTypes('exactMatch')}</SelectItem>
                <SelectItem value="multipleChoice">{tAnswerTypes('multipleChoice')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor="hasMedia" className="block text-sm font-medium text-gray-700 mb-1">{t('mediaFilesLabel')}</label>
            <Select onValueChange={(value) => setHasMedia(value === 'all' ? undefined : value === 'true')} defaultValue="all">
              <SelectTrigger id="hasMedia"><SelectValue placeholder={t('mediaFilesPlaceholder')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('anyMedia')}</SelectItem>
                <SelectItem value="true">{t('hasMedia')}</SelectItem>
                <SelectItem value="false">{t('noMedia')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-4">
            <Button onClick={handleSearch} className="w-full mt-4" disabled={loading}>
              {loading ? t('loading') : t('applyFilters')}
            </Button>
          </div>
        </div>
      </Card>

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
    </div>
  )
} 