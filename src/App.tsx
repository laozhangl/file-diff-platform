import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Courses, CourseDetail } from './pages/Courses'
import Vocabulary from './pages/Vocabulary'
import Grammar from './pages/Grammar'
import { Speaking, Listening } from './pages/SpeakingListening'
import { Progress, Profile, Community } from './pages/ProgressProfileCommunity'
import FileDiff from './pages/FileDiff'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<FileDiff />} />
            <Route path="/home" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/learn/vocabulary" element={<Vocabulary />} />
            <Route path="/learn/grammar" element={<Grammar />} />
            <Route path="/learn/speaking" element={<Speaking />} />
            <Route path="/learn/listening" element={<Listening />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/diff" element={<FileDiff />} />
            <Route path="/login" element={
              <div className="min-h-screen flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">登录功能</h1>
                  <p className="text-gray-500 mb-8">这是一个演示页面，实际登录功能需要后端支持</p>
                  <button className="btn-primary">返回首页</button>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
