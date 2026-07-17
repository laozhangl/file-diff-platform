import { create } from 'zustand'

interface User {
  id: string
  username: string
  email: string
  avatar: string
  level: number
  currentLanguage: string
}

interface Course {
  id: string
  title: string
  language: string
  level: string
  description: string
  cover: string
  totalLessons: number
  progress: number
}

interface Vocabulary {
  id: string
  word: string
  translation: string
  pronunciation: string
  language: string
  example: string
}

interface CommunityPost {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  likes: number
  createdAt: string
}

interface LearningProgress {
  todayMinutes: number
  completedLessons: number
  streakDays: number
  wordsLearned: number
  accuracy: number
}

interface AppState {
  user: User | null
  courses: Course[]
  vocabulary: Vocabulary[]
  communityPosts: CommunityPost[]
  progress: LearningProgress
  setUser: (user: User | null) => void
  setCourses: (courses: Course[]) => void
  setVocabulary: (vocabulary: Vocabulary[]) => void
  setCommunityPosts: (posts: CommunityPost[]) => void
  updateProgress: (updates: Partial<LearningProgress>) => void
  addWordLearned: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: '1',
    username: '学习者',
    email: 'learner@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=learner',
    level: 2,
    currentLanguage: 'english'
  },
  courses: [
    {
      id: '1',
      title: 'English for Beginners',
      language: 'english',
      level: 'beginner',
      description: 'Start your English journey with basic vocabulary and grammar.',
      cover: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
      totalLessons: 20,
      progress: 35
    },
    {
      id: '2',
      title: 'N5 Japanese',
      language: 'japanese',
      level: 'beginner',
      description: 'Learn Japanese fundamentals for JLPT N5 level.',
      cover: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
      totalLessons: 25,
      progress: 12
    },
    {
      id: '3',
      title: 'Basic Korean',
      language: 'korean',
      level: 'beginner',
      description: 'Master Hangul and basic Korean expressions.',
      cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
      totalLessons: 18,
      progress: 0
    }
  ],
  vocabulary: [
    { id: '1', word: 'Hello', translation: '你好', pronunciation: 'həˈloʊ', language: 'english', example: 'Hello, how are you?' },
    { id: '2', word: 'Thank you', translation: '谢谢', pronunciation: 'θæŋk juː', language: 'english', example: 'Thank you very much.' },
    { id: '3', word: 'こんにちは', translation: '你好', pronunciation: 'konnichiwa', language: 'japanese', example: 'こんにちは、元気ですか？' },
    { id: '4', word: 'ありがとう', translation: '谢谢', pronunciation: 'arigatou', language: 'japanese', example: 'ありがとうございます。' },
    { id: '5', word: '안녕하세요', translation: '你好', pronunciation: 'annyeonghaseyo', language: 'korean', example: '안녕하세요, 반갑습니다.' },
    { id: '6', word: '감사합니다', translation: '谢谢', pronunciation: 'gamsahamnida', language: 'korean', example: '감사합니다.' }
  ],
  communityPosts: [
    {
      id: '1',
      userId: '2',
      username: '日语学习者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=japanese',
      content: '今天完成了第一个日语课程！感觉很棒，继续加油！🎉',
      likes: 15,
      createdAt: '2小时前'
    },
    {
      id: '2',
      userId: '3',
      username: '韩语达人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=korean',
      content: '分享一个学习韩语的小技巧：多听韩剧OST，语感提升很快哦！',
      likes: 23,
      createdAt: '5小时前'
    }
  ],
  progress: {
    todayMinutes: 45,
    completedLessons: 8,
    streakDays: 5,
    wordsLearned: 47,
    accuracy: 85
  },
  setUser: (user) => set({ user }),
  setCourses: (courses) => set({ courses }),
  setVocabulary: (vocabulary) => set({ vocabulary }),
  setCommunityPosts: (posts) => set({ communityPosts: posts }),
  updateProgress: (updates) => set((state) => ({ progress: { ...state.progress, ...updates } })),
  addWordLearned: () => set((state) => ({ progress: { ...state.progress, wordsLearned: state.progress.wordsLearned + 1 } }))
}))