import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Check, Volume2, Bookmark } from 'lucide-react'
import { useAppStore } from '../store'

const Vocabulary: React.FC = () => {
  const { vocabulary, addWordLearned } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedWords, setLearnedWords] = useState<string[]>([])

  const currentWord = vocabulary[currentIndex]

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleLearned = () => {
    if (!learnedWords.includes(currentWord.id)) {
      setLearnedWords([...learnedWords, currentWord.id])
      addWordLearned()
    }
    handleNext()
  }

  const progress = Math.round(((currentIndex + 1) / vocabulary.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">单词记忆</h1>
          <p className="text-gray-600">点击卡片查看释义</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">学习进度</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {currentIndex + 1} / {vocabulary.length}
          </p>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-8">
          <div 
            className={`relative w-full h-80 cursor-pointer transform-style-preserve-3d transition-transform duration-600 ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <span>{currentWord.language === 'english' ? '🇬🇧' : currentWord.language === 'japanese' ? '🇯🇵' : '🇰🇷'}</span>
                <span>点击查看释义</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{currentWord.word}</h2>
              {currentWord.pronunciation && (
                <p className="text-lg text-gray-500 mb-4">/{currentWord.pronunciation}/</p>
              )}
              <button className="flex items-center gap-2 text-primary hover:text-blue-600 transition-colors">
                <Volume2 className="w-5 h-5" />
                <span>听发音</span>
              </button>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-white"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="text-sm text-blue-100 mb-2">中文释义</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentWord.translation}</h2>
              {currentWord.example && (
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-white/90">{currentWord.example}</p>
                </div>
              )}
              <p className="text-sm text-blue-100 mt-4">点击卡片返回</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            上一个
          </button>
          <button
            onClick={handleLearned}
            className="btn-primary flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            已掌握
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === vocabulary.length - 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            下一个
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="card text-center">
            <Bookmark className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-gray-500">已学习</p>
            <p className="text-2xl font-bold text-gray-800">{learnedWords.length}</p>
          </div>
          <div className="card text-center">
            <RotateCcw className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">剩余</p>
            <p className="text-2xl font-bold text-gray-800">{vocabulary.length - learnedWords.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vocabulary