import React, { useState } from 'react'
import { Check, X, ChevronRight, Trophy } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: '选择正确的单词填空：I ___ to school every day.',
    options: ['go', 'goes', 'going', 'went'],
    correctAnswer: 0,
    explanation: '一般现在时，主语是 I，动词用原形。'
  },
  {
    id: 2,
    question: '选择正确的单词填空：She ___ a book now.',
    options: ['read', 'reads', 'is reading', 'reading'],
    correctAnswer: 2,
    explanation: '现在进行时，用 be + doing 结构。'
  },
  {
    id: 3,
    question: '选择正确的单词填空：They ___ football yesterday.',
    options: ['play', 'plays', 'played', 'playing'],
    correctAnswer: 2,
    explanation: '一般过去时，动词用过去式。'
  },
  {
    id: 4,
    question: '选择正确的单词填空：___ you like coffee?',
    options: ['Do', 'Does', 'Are', 'Is'],
    correctAnswer: 0,
    explanation: '一般现在时疑问句，主语是 you，用助动词 do。'
  },
  {
    id: 5,
    question: '选择正确的单词填空：This is ___ book.',
    options: ['I', 'me', 'my', 'mine'],
    correctAnswer: 2,
    explanation: '形容词性物主代词 my 修饰名词 book。'
  }
]

const Grammar: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setShowResult(true)
    
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setCompleted(false)
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">练习完成！🎉</h1>
          <p className="text-gray-600 mb-8">
            你答对了 {score} / {questions.length} 道题
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-gray-500">正确率</p>
            {percentage >= 80 && <p className="text-green-500 mt-2 font-medium">太棒了！继续保持！</p>}
            {percentage >= 60 && percentage < 80 && <p className="text-yellow-500 mt-2 font-medium">不错！继续努力！</p>}
            {percentage < 60 && <p className="text-orange-500 mt-2 font-medium">加油！多练习会更好！</p>}
          </div>
          <button onClick={handleRestart} className="btn-primary">
            再练习一次
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">语法练习</h1>
          <p className="text-gray-600">第 {currentQuestion + 1} 题 / 共 {questions.length} 题</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">答题进度</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentQuestion + 1}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{question.question}</h2>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswer === null
                    ? 'border-gray-200 hover:border-primary hover:bg-blue-50'
                    : index === question.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : index === selectedAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={selectedAnswer !== null && index === question.correctAnswer ? 'font-medium text-green-700' : 'text-gray-700'}>
                    {option}
                  </span>
                  {showResult && index === question.correctAnswer && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`mt-6 p-4 rounded-xl ${selectedAnswer === question.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-medium mb-2 ${selectedAnswer === question.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                {selectedAnswer === question.correctAnswer ? '✓ 答对了！' : '✗ 答错了'}
              </p>
              <p className="text-gray-600">{question.explanation}</p>
            </div>
          )}
        </div>

        {showResult && (
          <div className="flex justify-center">
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              {currentQuestion < questions.length - 1 ? '下一题' : '查看结果'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Grammar