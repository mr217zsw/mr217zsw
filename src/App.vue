<template>
  <div class="app">
    <h1>图片标注工具</h1>
    
    <div class="upload-section">
      <label class="file-label" for="fileInput">
        选择图片
      </label>
      <input type="file" id="fileInput" accept="image/*" multiple @change="handleFileUpload" />
    </div>
    
    <!-- 图片表格 -->
    <el-table :data="imageList" style="width: 100%" border>
      <el-table-column label="原图" width="150">
        <template #default="scope">
          <el-image
            :src="scope.row.originalUrl"
            fit="cover"
            style="width: 100px; height: 100px; cursor: pointer"
            :preview-src-list="[scope.row.previewUrl]"
            @click="loadPreview(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="宽度" prop="width" width="100" />
      <el-table-column label="高度" prop="height" width="100" />
      <el-table-column label="滚动宽度" prop="scrollWidth" width="120" />
      <el-table-column label="滚动高度" prop="scrollHeight" width="120" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { processImage } from './utils/imageProcessor'

const fileInput = ref(null)
const imageList = ref([])

const handleFileUpload = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          // 基础留白值
          let marginTop = 110
          let marginBottom = 110
          let marginLeft = 110
          let marginRight = 110
          
          // 横版图片底部留白230
          if (img.width > img.height) {
            marginBottom = 230
          }
          
          const scrollWidth = img.width - (marginLeft + marginRight)
          const scrollHeight = img.height - (marginTop + marginBottom)
          
          imageList.value.push({
            id: Date.now() + Math.random(),
            originalUrl: e.target.result,
            previewUrl: '',
            width: img.width,
            height: img.height,
            scrollWidth: scrollWidth,
            scrollHeight: scrollHeight
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const loadPreview = async (image) => {
  if (!image.previewUrl) {
    // 懒加载处理：点击时才处理图片
    const previewUrl = await processImage(
      image.originalUrl,
      image.width,
      image.height,
      image.scrollWidth,
      image.scrollHeight
    )
    image.previewUrl = previewUrl
  }
}
</script>

<style scoped>
/* 组件级样式可以在这里添加 */
</style>