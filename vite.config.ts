import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis' // ✅ UMD 경고 제거용
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ src 경로 별칭 설정
    },
  },
})
