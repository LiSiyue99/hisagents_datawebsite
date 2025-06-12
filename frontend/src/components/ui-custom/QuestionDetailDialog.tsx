'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Question, getMediaUrl } from "@/lib/api"
import { useTranslations } from 'next-intl';
import MediaViewer from './MediaViewer';

interface QuestionDetailDialogProps {
  question: Question | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onImagePreview: (imageUrl: string) => void
}

export function QuestionDetailDialog({ question, open, onOpenChange, onImagePreview }: QuestionDetailDialogProps) {
  const t = useTranslations('QuestionDetailDialog');
  
  if (!question) {
    return null
  }

  const renderMedia = (filePath: string) => {
    const fileName = filePath.split('/').pop() || filePath;
    const mediaUrl = getMediaUrl(filePath);
    return (
      <div className="space-y-2">
        <MediaViewer fileUrl={mediaUrl} fileName={fileName} />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dialogTitle', { taskId: question.task_id })}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div>
            <h4 className="font-semibold mb-2 text-base">{t('question')}</h4>
            <p className="text-gray-800 whitespace-pre-wrap">{question.question}</p>
          </div>
          
          {question.media_files.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 text-base">{t('relatedFiles')}</h4>
              <div className="space-y-4">
                {question.media_files.map((filePath: string, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    {renderMedia(filePath)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold mb-2 text-base">{t('correctAnswer')}</h4>
            <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{question.final_answer}</p>
            </div>
          </div>
          
          {question.answer_explanation && (
            <div>
              <h4 className="font-semibold mb-2 text-base">{t('answerExplanation')}</h4>
              <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                <p className="text-blue-800 whitespace-pre-wrap">{question.answer_explanation}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 