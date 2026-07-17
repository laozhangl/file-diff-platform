import React from 'react'
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Award, 
  User, 
  Settings, 
  Trophy, 
  Heart, 
  MessageSquare, 
  Share2 
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts'
import { useAppStore } from '../store'

const Progress: React.FC = () => {
  const { progress } = useAppStore()

  const weeklyData = [
    { day: '周一', minutes: 45, words: 20 },
    { day: '周二', minutes: 60, words: 30 },
    { day: '周三', minutes: 30, words: 15 },
    { day: '周四', minutes: 90, words: 40 },
    { day: '周五', minutes: 45, words: 25 },
    { day: '周六', minutes: 120, words: 50 },
    { day: '周日', minutes: 60, words: 35 }
  ]

  const languageData = [
    { name: '英语', progress: 75 },
    { name: '日语', progress: 40 },
    { name: '韩语', progress: 20 }
  ]

  const achievements = [
    { icon: '📚', title: '初学者', desc: '完成第一个课程', unlocked: true },
    { icon: '🔥', title: '连续学习', desc: '连续学习7天', unlocked: true },
    { icon: '⭐', title: '单词大师', desc: '学习100个单词', unlocked: false },
    { icon: '🏆', title: '完美通关', desc: '完成所有课程', unlocked: false },
    { icon: '💬', title: '口语达人', desc: '完成10次口语练习', unlocked: false },
    { icon: '🎯', title: '听力高手', desc: '完成20次听力练习', unlocked: false }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">学习进度</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <Clock className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-gray-500">今日学习</p>
            <p className="text-2xl font-bold text-gray-800">{progress.todayMinutes} 分钟</p>
          </div>
          <div className="stat-card">
            <BookOpen className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-500">完成课程</p>
            <p className="text-2xl font-bold text-gray-800">{progress.completedLessons} 节</p>
          </div>
          <div className="stat-card">
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-500">学习单词</p>
            <p className="text-2xl font-bold text-gray-800">{progress.wordsLearned} 个</p>
          </div>
          <div className="stat-card">
            <Award className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-sm text-gray-500">正确率</p>
            <p className="text-2xl font-bold text-gray-800">{progress.accuracy}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">本周学习</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="words" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">语言进度</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={languageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="progress" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-6">成就系统</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-500">{achievement.desc}</p>
                {achievement.unlocked && (
                  <p className="text-xs text-green-600 mt-2 font-medium">✓ 已解锁</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const Profile: React.FC = () => {
  const { user } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">个人中心</h1>

        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              src={user?.avatar} 
              alt={user?.username} 
              className="w-24 h-24 rounded-full border-4 border-primary"
            />
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.username}</h2>
              <p className="text-gray-500 mb-4">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">
                  等级 {user?.level}
                </span>
                <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm">
                  {user?.currentLanguage === 'english' ? '🇬🇧 英语' : user?.currentLanguage === 'japanese' ? '🇯🇵 日语' : '🇰🇷 韩语'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-gray-800">账户信息</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">用户名</label>
                <input 
                  type="text" 
                  defaultValue={user?.username}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">邮箱</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <button className="w-full btn-primary">保存修改</button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">学习设置</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">每日学习目标</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none">
                  <option>15 分钟</option>
                  <option selected>30 分钟</option>
                  <option>45 分钟</option>
                  <option>60 分钟</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">学习提醒</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none">
                  <option>关闭</option>
                  <option selected>开启</option>
                </select>
              </div>
              <button className="w-full btn-secondary">保存设置</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">我的成就</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '📚', title: '初学者', count: 1 },
              { icon: '🔥', title: '连续学习', count: 5 },
              { icon: '⭐', title: '单词学习', count: 47 }
            ].map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-2xl font-bold text-primary">{item.count}</p>
                <p className="text-sm text-gray-500">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const Community: React.FC = () => {
  const { communityPosts, user } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">学习社区</h1>

        <div className="card mb-8">
          <div className="flex gap-4">
            <img src={user?.avatar} alt={user?.username} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <textarea 
                placeholder="分享你的学习心得..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button className="btn-primary text-sm">发布</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {communityPosts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex items-start gap-4">
                <img src={post.avatar} alt={post.username} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">{post.username}</span>
                    <span className="text-sm text-gray-400">{post.createdAt}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span>评论</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span>分享</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">热门话题</h3>
          <div className="flex flex-wrap gap-2">
            {['#英语学习', '#日语入门', '#韩语学习', '#学习心得', '#每日打卡', '#学习方法'].map((tag, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-blue-50 text-primary rounded-full text-sm font-medium hover:bg-blue-100 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Progress, Profile, Community }