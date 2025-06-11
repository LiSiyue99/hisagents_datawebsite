'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PanelLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl';
import { getLevelLabel, getAnswerTypeLabel, QuestionIndexItem } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

interface IndexPanelProps {
  questions: QuestionIndexItem[]
  totalQuestions: number
  onSelectQuestion: (taskId: number) => void
}

export function IndexPanel({ questions, totalQuestions, onSelectQuestion }: IndexPanelProps) {
  const t = useTranslations('IndexPanel');
  const tLevels = useTranslations('Levels');
  const tAnswerTypes = useTranslations('AnswerTypes');
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState("")

  const handleGo = () => {
    const id = parseInt(inputValue, 10)
    if (!isNaN(id) && id > 0 && id <= totalQuestions) {
      setSelectedId(id)
      onSelectQuestion(id)
      setInputValue("") // 清空输入框
    } else {
      // 可以在这里添加一些错误提示，比如 alert
      alert(t('invalidIdError', { totalQuestions }))
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGo()
    }
  }

  // Use the passed questions if available, otherwise generate a list of IDs
  const questionList = questions.length > 0
    ? [...questions].sort((a, b) => a.task_id - b.task_id)
    : Array.from({ length: totalQuestions }, (_, i) => ({ task_id: i + 1 } as QuestionIndexItem));

  return (
    <div
      className="fixed top-1/4 left-0 z-40"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex items-start">
        {/* 抽屉把手 */}
        <div 
          className="p-2 bg-white border-r border-t border-b rounded-r-lg shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
          style={{ transform: isExpanded ? 'translateX(16rem)' : 'translateX(0)', transition: 'transform 0.3s ease-in-out' }}
        >
          <PanelLeft className="h-6 w-6 text-gray-600" />
        </div>

        {/* 可展开内容 */}
        <div
          className={`
            bg-white border-t border-r border-b rounded-r-lg shadow-lg h-[60vh]
            transition-all duration-300 ease-in-out overflow-hidden
            ${isExpanded ? 'w-64' : 'w-0'}
          `}
        >
          <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{t('title')}</h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <ul className="space-y-1 pr-4">
                {questionList.map((q) => (
                  <li 
                    key={q.task_id}
                    className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => onSelectQuestion(q.task_id)}
                  >
                    <div className="text-gray-700 text-sm flex flex-col items-start">
                      <span className="font-semibold hover:text-blue-600 hover:underline">{t('questionTitle', { id: q.task_id })}</span>
                      {q.level && q.answer_type && (
                        <div className="flex gap-1 mt-1">
                          <Badge variant={q.level === 1 ? 'green' : q.level === 2 ? 'blue' : 'destructive'} className="text-xs">
                            {tLevels(getLevelLabel(q.level))}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {tAnswerTypes(getAnswerTypeLabel(q.answer_type))}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
} 