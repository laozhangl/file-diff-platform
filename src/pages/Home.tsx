import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, BookOpen, Flame, BookMarked, Brain, Mic, Volume2, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store'

const Home: React.FC = () => {
  const { user, courses, progress } = useAppStore()

  const learningModules = [
    { icon: BookMarked, title: '单词记忆', path: '/learn/vocabulary', color: 'from-blue-500 to-cyan-500' },
    { icon: Brain, title: '语法练习', path: '/learn/grammar', color: 'from-purple-500 to-pink-500' },
    { icon: Mic, title: '口语跟读', path: '/learn/speaking', color: 'from-orange-500 to-red-500' },
    { icon: Volume2, title: '听力训练', path: '/learn/listening', color: 'from-green-500 to-emerald-500' }
  ]

  const stats = [
    { icon: Clock, label: '今日学习', value: `${progress.todayMinutes}分钟`, color: 'text-blue-500' },
    { icon: BookOpen, label: '完成课程', value: `${progress.completedLessons}节`, color: 'text-purple-500' },
    { icon: Flame, label: '连续学习', value: `${progress.streakDays}天`, color: 'text-orange-500' },
    { icon: BookMarked, label: '学习单词', value: `${progress.wordsLearned}个`, color: 'text-green-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              你好，{user?.username}！👋
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              今天继续你的语言学习之旅吧
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/learn/vocabulary" className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                开始学习
              </Link>
              <Link to="/courses" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                浏览课程
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Modules */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">互动学习</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {learningModules.map((module, index) => (
            <Link key={index} to={module.path} className="card hover:shadow-lg transition-all duration-300 group">
              <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">{module.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">推荐课程</h2>
          <Link to="/courses" className="text-primary font-medium flex items-center hover:underline">
            查看全部 <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="card hover:shadow-lg transition-all duration-300 group">
              <div className="relative mb-4">
                <img src={course.cover} alt={course.title} className="w-full h-40 object-cover rounded-xl" />
                <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                  {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">{course.progress}%</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home