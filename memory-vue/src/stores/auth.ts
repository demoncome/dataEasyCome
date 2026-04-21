import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 默认账号密码
const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = '123456'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isLoggedIn = ref(false)
  const username = ref('')
  
  // Getters
  const isAuthenticated = computed(() => isLoggedIn.value)
  
  // Actions
  const login = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    // 模拟异步验证
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (inputUsername === DEFAULT_USERNAME && inputPassword === DEFAULT_PASSWORD) {
      isLoggedIn.value = true
      username.value = inputUsername
      // 保存登录状态到 localStorage
      localStorage.setItem('auth_token', 'logged_in')
      localStorage.setItem('auth_user', inputUsername)
      return true
    }
    
    return false
  }
  
  const logout = () => {
    isLoggedIn.value = false
    username.value = ''
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
  
  const checkAuth = () => {
    // 检查 localStorage 中是否有登录状态
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')
    if (token && user) {
      isLoggedIn.value = true
      username.value = user
      return true
    }
    return false
  }
  
  return {
    isLoggedIn,
    username,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
