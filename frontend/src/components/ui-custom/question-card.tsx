'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Question, getLevelLabel, getAnswerTypeLabel, getMediaUrl } from "@/lib/api"
import { useTranslations } from 'next-intl';

interface QuestionCardProps {
  question: Question
  onShowDetails: (questionId: number) => void
}

export function QuestionCard({ question, onShowDetails }: QuestionCardProps) {
  const t = useTranslations('QuestionCard');
  const tLevels = useTranslations('Levels');
  const tAnswerTypes = useTranslations('AnswerTypes');

  // 渲染媒体文件
  const renderMedia = (filePath: string) => {
    if (filePath.toLowerCase().startsWith('reference:')) {
      return (
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{filePath}</p>
        </div>
      )
    }
    const ext = filePath.split('.').pop()?.toLowerCase()
    const mediaUrl = getMediaUrl(filePath)
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return (
        <img 
          src={mediaUrl} 
          alt={`Task ${question.task_id} media`}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      )
    }
    
    if (['mp4', 'avi', 'mov'].includes(ext || '')) {
      return (
        <video 
          controls 
          className="max-w-full max-h-96"
          src={mediaUrl}
        >
          {t('videoNotSupported')}
        </video>
      )
    }
    
    if (['mp3', 'm4a', 'wav'].includes(ext || '')) {
      return (
        <audio 
          controls 
          className="w-full"
          src={mediaUrl}
        >
          {t('audioNotSupported')}
        </audio>
      )
    }
    
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">{t('file')}: {filePath}</p>
        <a 
          href={mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {t('view')}
        </a>
      </div>
    )
  }
  
  return (
    <Card className="w-full hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{t('taskTitle')} #{question.task_id}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={question.level === 1 ? 'green' : question.level === 2 ? 'blue' : 'destructive'}>
              {tLevels(getLevelLabel(question.level))}
            </Badge>
            <Badge variant="outline">
              {tAnswerTypes(getAnswerTypeLabel(question.answer_type))}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {/* 题目内容 */}
          <div>
            <h4 className="font-medium mb-2">{t('questionTitle')}</h4>
            <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{question.question}</p>
          </div>
          
          {/* 媒体文件预览 */}
          {question.media_files.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">{t('relatedFiles')} ({question.media_files.length})</h4>
              <div className="flex flex-wrap gap-2">
                {question.media_files.slice(0, 3).map((filePath, index) => (
                  <div key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {filePath.split('/').pop()}
                  </div>
                ))}
                {question.media_files.length > 3 && (
                  <div className="px-2 py-1 bg-gray-200 rounded text-sm">
                    +{question.media_files.length - 3} {t('more')}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 答案预览 */}
          <div>
            <h4 className="font-medium mb-2">{t('answer')}</h4>
            <p className="text-green-700 font-medium">{question.final_answer}</p>
          </div>
        </div>
        
        {/* 查看详情按钮 */}
        <div className="pt-4 mt-auto">
          <Button variant="outline" className="w-full" onClick={() => onShowDetails(question.task_id)}>
            {t('viewDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
