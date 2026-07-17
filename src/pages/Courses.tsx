import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ChevronLeft, CheckCircle, Globe, Star } from 'lucide-react'
import { useAppStore } from '../store'

const Courses: React.FC = () => {
  const { courses } = useAppStore()
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  const languages = [
    { value: 'all', label: '全部语言', icon: '🌍' },
    { value: 'english', label: '英语', icon: '🇬🇧' },
    { value: 'japanese', label: '日语', icon: '🇯🇵' },
    { value: 'korean', label: '韩语', icon: '🇰🇷' }
  ]

  const levels = [
    { value: 'all', label: '全部级别' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' }
  ]

  const filteredCourses = courses.filter(course => {
    const languageMatch = selectedLanguage === 'all' || course.language === selectedLanguage
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel
    return languageMatch && levelMatch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">探索课程</h1>
          <p className="text-gray-600">选择适合你的语言学习课程</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">语言</label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedLanguage === lang.value
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{lang.icon}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">级别</label>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(level.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedLevel === level.value
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="card hover:shadow-lg transition-all duration-300 group">
              <div className="relative mb-4">
                <img src={course.cover} alt={course.title} className="w-full h-48 object-cover rounded-xl" />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                  {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {course.language === 'english' ? '英语' : course.language === 'japanese' ? '日语' : '韩语'}
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
                <span className="text-sm text-gray-500">{course.totalLessons} 节课</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">{course.progress}%</span>
              </div>
              <button className="w-full btn-primary text-sm">
                {course.progress > 0 ? '继续学习' : '开始学习'}
              </button>
            </Link>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">没有找到课程</h3>
            <p className="text-gray-500">尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  )
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { courses } = useAppStore()
  const course = courses.find(c => c.id === id)

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">课程未找到</h3>
          <Link to="/courses" className="text-primary hover:underline">返回课程列表</Link>
        </div>
      </div>
    )
  }

  const lessons = Array.from({ length: course.totalLessons }, (_, i) => ({
    id: i + 1,
    title: `第 ${i + 1} 课`,
    completed: i < Math.floor(course.totalLessons * course.progress / 100)
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="relative">
        <img src={course.cover} alt={course.title} className="w-full h-64 md:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <Link to="/courses" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" />
              返回课程列表
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-white/80 text-lg">{course.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-12">
        <div className="card">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">课程进度</span>
              <span className="font-bold text-primary">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          {/* Lessons */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">课程目录</h2>
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className={`flex items-center p-4 rounded-xl border transition-all ${
                    lesson.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-100 hover:border-primary'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    lesson.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {lesson.completed ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">{lesson.id}</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${lesson.completed ? 'text-green-700' : 'text-gray-800'}`}>{lesson.title}</h3>
                  </div>
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    lesson.completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg'
                  }`}>
                    {lesson.completed ? '已完成' : '开始学习'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Courses, CourseDetail }