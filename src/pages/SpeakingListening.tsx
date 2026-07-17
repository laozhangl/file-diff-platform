import React, { useState } from 'react'
import { Mic, Play, Volume2, Check, Headphones } from 'lucide-react'

interface SpeakingSentence {
  id: number
  text: string
  translation: string
}

const speakingSentences: SpeakingSentence[] = [
  { id: 1, text: 'Hello, how are you?', translation: '你好，你好吗？' },
  { id: 2, text: 'Nice to meet you.', translation: '很高兴认识你。' },
  { id: 3, text: 'Thank you very much.', translation: '非常感谢。' },
  { id: 4, text: 'Have a nice day!', translation: '祝你今天愉快！' },
  { id: 5, text: 'See you tomorrow.', translation: '明天见。' }
]

interface ListeningAudio {
  id: number
  title: string
  transcription: string
  question: string
  options: string[]
  correctAnswer: number
}

const listeningAudios: ListeningAudio[] = [
  {
    id: 1,
    title: '日常对话 - 问候',
    transcription: 'A: Good morning! How are you today? B: I\'m fine, thank you. And you? A: I\'m great, thanks!',
    question: 'What time of day is it?',
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
    correctAnswer: 0
  },
  {
    id: 2,
    title: '日常对话 - 天气',
    transcription: 'A: What\'s the weather like today? B: It\'s sunny and warm. Perfect for going outside!',
    question: 'How is the weather?',
    options: ['Rainy', 'Sunny', 'Cold', 'Snowy'],
    correctAnswer: 1
  }
]

const Speaking: React.FC = () => {
  const [currentSentence, setCurrentSentence] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)

  const sentence = speakingSentences[currentSentence]
  const progress = Math.round(((currentSentence + 1) / speakingSentences.length) * 100)

  const handleRecord = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      setScore(Math.floor(Math.random() * 21) + 80)
    }, 2000)
  }

  const handleNext = () => {
    if (currentSentence < speakingSentences.length - 1) {
      setCurrentSentence(currentSentence + 1)
      setScore(null)
    } else {
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentSentence(0)
    setScore(null)
    setCompleted(false)
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">练习完成！🎉</h1>
          <p className="text-gray-600 mb-8">你完成了所有口语练习</p>
          <button onClick={handleRestart} className="btn-primary">
            再练习一次
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">口语跟读</h1>
          <p className="text-gray-600">第 {currentSentence + 1} 句 / 共 {speakingSentences.length} 句</p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">练习进度</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="text-center mb-8">
            <button className="flex items-center gap-2 mx-auto text-primary hover:text-blue-600 transition-colors mb-4">
              <Volume2 className="w-6 h-6" />
              <span className="font-medium">听发音</span>
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{sentence.text}</h2>
            <p className="text-lg text-gray-500">{sentence.translation}</p>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleRecord}
              disabled={score !== null}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : score !== null
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg'
              }`}
            >
              {isRecording ? (
                <div className="flex gap-1">
                  <div className="w-2 h-8 bg-white rounded animate-bounce" />
                  <div className="w-2 h-8 bg-white rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-8 bg-white rounded animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              ) : score !== null ? (
                <Check className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          </div>

          {score !== null && (
            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
                <p className="text-4xl font-bold text-green-600 mb-2">{score} 分</p>
                <p className="text-green-700">发音很棒！继续保持！</p>
              </div>
              <button onClick={handleNext} className="btn-primary">
                {currentSentence < speakingSentences.length - 1 ? '下一句' : '完成练习'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Listening: React.FC = () => {
  const [currentAudio, setCurrentAudio] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [completed, setCompleted] = useState(false)

  const audio = listeningAudios[currentAudio]
  const progress = Math.round(((currentAudio + 1) / listeningAudios.length) * 100)

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentAudio < listeningAudios.length - 1) {
      setCurrentAudio(currentAudio + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentAudio(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setCompleted(false)
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Headphones className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">练习完成！🎉</h1>
          <p className="text-gray-600 mb-8">你完成了所有听力练习</p>
          <button onClick={handleRestart} className="btn-primary">
            再练习一次
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">听力训练</h1>
          <p className="text-gray-600">第 {currentAudio + 1} 题 / 共 {listeningAudios.length} 题</p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">练习进度</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{audio.title}</h3>
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl flex items-center justify-center gap-3 hover:shadow-lg transition-all">
              <Play className="w-6 h-6 fill-current" />
              <span className="font-medium">播放音频</span>
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <p className="text-gray-700 text-center">{audio.transcription}</p>
          </div>

          <h4 className="font-semibold text-gray-800 mb-4">{audio.question}</h4>

          <div className="space-y-3 mb-6">
            {audio.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswer === null
                    ? 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                    : index === audio.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : index === selectedAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 opacity-50'
                }`}
              >
                <span className={selectedAnswer !== null && index === audio.correctAnswer ? 'font-medium text-green-700' : 'text-gray-700'}>
                  {option}
                </span>
              </button>
            ))}
          </div>

          {showResult && (
            <div className="flex justify-center">
              <button onClick={handleNext} className="btn-primary">
                {currentAudio < listeningAudios.length - 1 ? '下一题' : '完成练习'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Speaking, Listening }