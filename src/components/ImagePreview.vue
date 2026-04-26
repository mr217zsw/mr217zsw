<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="image-viewer-overlay"
      @click="close"
    >
      <div class="image-viewer" @click.stop>
        <!-- 关闭按钮 -->
        <button class="image-viewer__close" @click="close">
          ×
        </button>
        
        <!-- 图片内容 -->
        <div class="image-viewer__content">
          <div 
            class="image-wrapper" 
            :style="wrapperStyle"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          >
            <!-- 原始图片 -->
            <img 
              :src="image.originalUrl" 
              :style="imageStyle" 
              :alt="'Image preview'" 
            />
            
            <!-- 标注覆盖层 -->
            <div 
              class="annotation-overlay preview-overlay"
              :style="overlayStyle"
            >
              <!-- 滚动区域 -->
              <div 
                class="scroll-area"
                :style="scrollAreaStyle"
              ></div>
              
              <!-- 虚线 -->
              <div class="dashed-lines">
                <!-- 顶部虚线 -->
                <div 
                  class="dashed-line top"
                  :style="getDashedLineStyle('top')"
                ></div>
                <!-- 底部虚线 -->
                <div 
                  class="dashed-line bottom"
                  :style="getDashedLineStyle('bottom')"
                ></div>
                <!-- 左侧虚线 -->
                <div 
                  class="dashed-line left"
                  :style="getDashedLineStyle('left')"
                ></div>
                <!-- 右侧虚线 -->
                <div 
                  class="dashed-line right"
                  :style="getDashedLineStyle('right')"
                ></div>
              </div>
              
              <!-- 尺寸标注 -->
              <div class="annotations">
                <!-- 顶部留白标注 -->
                <div 
                  class="annotation top"
                  :style="getAnnotationStyle('top')"
                >{{ image.marginTop }}px</div>
                <!-- 底部留白标注 -->
                <div 
                  class="annotation bottom"
                  :style="getAnnotationStyle('bottom')"
                >{{ image.marginBottom }}px</div>
                <!-- 左侧留白标注 -->
                <div 
                  class="annotation left"
                  :style="getAnnotationStyle('left')"
                >{{ image.marginLeft }}px</div>
                <!-- 右侧留白标注 -->
                <div 
                  class="annotation right"
                  :style="getAnnotationStyle('right')"
                >{{ image.marginRight }}px</div>
                
                <!-- 图片宽度标注（顶部） -->
                <div 
                  class="annotation width top"
                  :style="getWidthAnnotationStyle('top')"
                >{{ image.width }}px</div>
                <!-- 图片宽度标注（底部） -->
                <div 
                  class="annotation width bottom"
                  :style="getWidthAnnotationStyle('bottom')"
                >{{ image.width }}px</div>
                <!-- 图片高度标注（左侧） -->
                <div 
                  class="annotation height left"
                  :style="getHeightAnnotationStyle('left')"
                >{{ image.height }}px</div>
                <!-- 图片高度标注（右侧） -->
                <div 
                  class="annotation height right"
                  :style="getHeightAnnotationStyle('right')"
                >{{ image.height }}px</div>
              </div>
              
              <!-- 四角延长线 -->
              <div class="corner-lines">
                <!-- 左上角延长线 -->
                <div class="corner-line top-left-h"></div>
                <div class="corner-line top-left-v"></div>
                <!-- 右上角延长线 -->
                <div class="corner-line top-right-h"></div>
                <div class="corner-line top-right-v"></div>
                <!-- 左下角延长线 -->
                <div class="corner-line bot-left-h"></div>
                <div class="corner-line bot-left-v"></div>
                <!-- 右下角延长线 -->
                <div class="corner-line bot-right-h"></div>
                <div class="corner-line bot-right-v"></div>
              </div>
              
              <!-- 宽高标注线 -->
              <div class="dimension-lines">
                <!-- 顶部宽度线 -->
                <div 
                  class="dimension-line top"
                  :style="getDimensionLineStyle('top')"
                ></div>
                <!-- 底部宽度线 -->
                <div 
                  class="dimension-line bottom"
                  :style="getDimensionLineStyle('bottom')"
                ></div>
                <!-- 左侧高度线 -->
                <div 
                  class="dimension-line left"
                  :style="getDimensionLineStyle('left')"
                ></div>
                <!-- 右侧高度线 -->
                <div 
                  class="dimension-line right"
                  :style="getDimensionLineStyle('right')"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 工具栏 -->
        <div class="image-viewer__toolbar" @click.stop>
          <el-button size="small" circle @click.stop="zoomIn" class="toolbar-btn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button size="small" circle @click.stop="zoomOut" class="toolbar-btn">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button size="small" circle @click.stop="resetZoom" class="toolbar-btn">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElIcon } from 'element-plus'
import { ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  image: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close'])

// 响应式状态
const scale = ref(1) // 默认缩放比例
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const translate = ref({ x: 0, y: 0 })

// 计算合适的初始缩放比例
const calculateInitialScale = () => {
  if (!props.image || !props.image.width || !props.image.height) {
    return 0.5
  }
  
  // 预留空间用于标注（上下左右各200px）
  const padding = 200
  const viewportWidth = window.innerWidth - padding
  const viewportHeight = window.innerHeight - padding
  
  // 计算缩放比例
  const scaleX = viewportWidth / props.image.width
  const scaleY = viewportHeight / props.image.height
  
  // 取较小的那个比例，确保图片完全在视口内
  return Math.min(scaleX, scaleY, 1) // 最大不超过1
}

// 计算属性
const wrapperStyle = computed(() => ({
  position: 'relative',
  width: `${props.image.width}px`,
  height: `${props.image.height}px`,
  boxSizing: 'content-box',
  transform: `scale(${scale.value}) translate(${translate.value.x}px, ${translate.value.y}px)`,
  transformOrigin: 'center center',
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const imageStyle = computed(() => ({
  width: `${props.image.width}px`,
  height: `${props.image.height}px`,
  display: 'block'
}))

const overlayStyle = computed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none'
}))

const scrollAreaStyle = computed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: `${props.image.scrollWidth}px`,
  height: `${props.image.scrollHeight}px`,
  border: '2px solid #0099FF',
  backgroundColor: 'rgba(100, 181, 246, 0.3)',
  boxSizing: 'border-box',
  transform: `translate(${props.image.marginLeft}px, ${props.image.marginTop}px)`
}))

// 方法
const close = () => {
  emit('close')
  // 重置状态
  scale.value = 1
  translate.value = { x: 0, y: 0 }
  isDragging.value = false
  // 恢复滚动
  document.body.style.overflow = ''
}

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 3)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.1)
}

const resetZoom = () => {
  scale.value = calculateInitialScale()
  translate.value = { x: 0, y: 0 }
}

// 鼠标拖动事件处理
const handleMouseDown = (event) => {
  isDragging.value = true
  startX.value = event.clientX - translate.value.x
  startY.value = event.clientY - translate.value.y
  event.preventDefault()
  // 添加全局鼠标事件监听，确保鼠标移出图片区域时仍能继续拖动
  document.addEventListener('mousemove', handleGlobalMouseMove)
  document.addEventListener('mouseup', handleGlobalMouseUp)
  document.addEventListener('mouseleave', handleGlobalMouseUp)
}

const handleGlobalMouseMove = (event) => {
  if (isDragging.value) {
    // 直接更新位置，确保拖动流畅
    translate.value.x = event.clientX - startX.value
    translate.value.y = event.clientY - startY.value
    event.preventDefault()
  }
}

const handleGlobalMouseUp = () => {
  isDragging.value = false
  // 移除全局鼠标事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  document.removeEventListener('mouseleave', handleGlobalMouseUp)
}

// 移除多余的鼠标事件处理，避免重复处理
const handleMouseMove = (event) => {
  if (isDragging.value) {
    event.preventDefault()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  // 移除全局鼠标事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  document.removeEventListener('mouseleave', handleGlobalMouseUp)
}

// 鼠标滚轮事件
const handleWheel = (event) => {
  if (props.visible) {
    event.preventDefault()
    if (event.deltaY > 0) {
      zoomOut()
    } else {
      zoomIn()
    }
  }
}

// 生命周期
onUnmounted(() => {
  // 移除全局鼠标事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  document.removeEventListener('mouseleave', handleGlobalMouseUp)
  document.removeEventListener('wheel', handleWheel)
  // 恢复滚动
  document.body.style.overflow = ''
})

// 监听visible属性变化
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      // 阻止滚动
      document.body.style.overflow = 'hidden'
      // 计算合适的初始缩放比例
      scale.value = calculateInitialScale()
      // 重置位置
      translate.value = { x: 0, y: 0 }
    } else {
      // 恢复滚动
      document.body.style.overflow = ''
    }
  }
)

// 添加鼠标滚轮事件监听
if (typeof window !== 'undefined') {
  window.addEventListener('wheel', handleWheel, { passive: false })
}

// 样式计算方法
const getDashedLineStyle = (position) => {
  const styles = {
    position: 'absolute',
    pointerEvents: 'none'
  }
  
  switch (position) {
    case 'top':
      return {
        ...styles,
        top: 0,
        left: `${props.image.marginLeft + props.image.scrollWidth / 2}px`,
        width: '2px',
        height: `${props.image.marginTop}px`,
        borderLeft: '2px dashed #0099FF'
      }
    case 'bottom':
      return {
        ...styles,
        bottom: 0,
        left: `${props.image.marginLeft + props.image.scrollWidth / 2}px`,
        width: '2px',
        height: `${props.image.marginBottom}px`,
        borderLeft: '2px dashed #0099FF'
      }
    case 'left':
      return {
        ...styles,
        left: 0,
        top: `${props.image.marginTop + props.image.scrollHeight / 2}px`,
        width: `${props.image.marginLeft}px`,
        height: '2px',
        borderTop: '2px dashed #0099FF'
      }
    case 'right':
      return {
        ...styles,
        right: 0,
        top: `${props.image.marginTop + props.image.scrollHeight / 2}px`,
        width: `${props.image.marginRight}px`,
        height: '2px',
        borderTop: '2px dashed #0099FF'
      }
    default:
      return styles
  }
}

const getAnnotationStyle = (position) => {
  const styles = {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0099FF',
    whiteSpace: 'nowrap'
  }
  
  switch (position) {
    case 'top':
      return {
        ...styles,
        top: `${props.image.marginTop / 2 - 12}px`,
        left: `${props.image.marginLeft + props.image.scrollWidth / 2 + 10}px`
      }
    case 'bottom':
      return {
        ...styles,
        bottom: `${props.image.marginBottom / 2 - 12}px`,
        left: `${props.image.marginLeft + props.image.scrollWidth / 2 + 10}px`
      }
    case 'left':
      return {
        ...styles,
        left: `${props.image.marginLeft / 2 - 30}px`,
        top: `${props.image.marginTop + props.image.scrollHeight / 2 + 10}px`
      }
    case 'right':
      return {
        ...styles,
        right: `${props.image.marginRight / 2 - 30}px`,
        top: `${props.image.marginTop + props.image.scrollHeight / 2 + 10}px`
      }
    default:
      return styles
  }
}

const getWidthAnnotationStyle = (position) => {
  const styles = {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0099FF',
    whiteSpace: 'nowrap'
  }
  
  switch (position) {
    case 'top':
      return {
        ...styles,
        top: '-80px',
        left: '50%',
        transform: 'translateX(-50%)'
      }
    case 'bottom':
      return {
        ...styles,
        bottom: '-80px',
        left: '50%',
        transform: 'translateX(-50%)'
      }
    default:
      return styles
  }
}

const getHeightAnnotationStyle = (position) => {
  const styles = {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0099FF',
    whiteSpace: 'nowrap'
  }
  
  switch (position) {
    case 'left':
      return {
        ...styles,
        left: '-140px',
        top: '50%',
        transform: 'translateY(-50%) rotate(-90deg)'
      }
    case 'right':
      return {
        ...styles,
        right: '-140px',
        top: '50%',
        transform: 'translateY(-50%) rotate(-90deg)'
      }
    default:
      return styles
  }
}

const getDimensionLineStyle = (position) => {
  const styles = {
    position: 'absolute',
    pointerEvents: 'none'
  }
  
  switch (position) {
    case 'top':
      return {
        ...styles,
        top: '-10px',
        left: '50px',
        right: '50px',
        height: '2px',
        borderTop: '2px solid #0099FF'
      }
    case 'bottom':
      return {
        ...styles,
        bottom: '-10px',
        left: '50px',
        right: '50px',
        height: '2px',
        borderTop: '2px solid #0099FF'
      }
    case 'left':
      return {
        ...styles,
        left: '-10px',
        top: '50px',
        bottom: '50px',
        width: '2px',
        borderLeft: '2px solid #0099FF'
      }
    case 'right':
      return {
        ...styles,
        right: '-10px',
        top: '50px',
        bottom: '50px',
        width: '2px',
        borderLeft: '2px solid #0099FF'
      }
    default:
      return styles
  }
}
</script>

<style scoped>
/* 预览弹窗样式 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  cursor: pointer;
  pointer-events: auto;
}

.image-viewer {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: default;
  overflow: visible;
}

.image-viewer__close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 30px;
  line-height: 40px;
  text-align: center;
  border-radius: 50%;
  cursor: pointer;
  z-index: 100000;
}

.image-viewer__content {
  position: relative;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
}

.image-viewer__content:active {
  cursor: grabbing;
}

.image-viewer__toolbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  background: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: 25px;
  z-index: 100000;
}

.toolbar-btn {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  max-width: 40px !important;
  max-height: 40px !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  font-size: 18px !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 修复Element Plus按钮样式 */
.toolbar-btn.el-button--circle {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  line-height: 1 !important;
}

.toolbar-btn.el-button--circle .el-icon {
  width: 20px !important;
  height: 20px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  font-size: 20px !important;
  line-height: 1 !important;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 预览图片样式 */
.image-wrapper {
  position: relative;
  transition: transform 0.2s ease;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.scroll-area {
  position: absolute;
  box-sizing: border-box;
}

.dashed-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.dashed-line {
  position: absolute;
  pointer-events: none;
}

.annotations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.annotation {
  position: absolute;
  pointer-events: none;
  white-space: nowrap;
}

.corner-lines {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  pointer-events: none;
}

.corner-line {
  position: absolute;
  border-color: #0099FF;
  pointer-events: none;
}

.top-left-h, .top-right-h, .bot-left-h, .bot-right-h {
  width: 30px;
  height: 0;
  border-top: 2px solid #0099FF;
}

.top-left-v, .top-right-v, .bot-left-v, .bot-right-v {
  width: 0;
  height: 30px;
  border-left: 2px solid #0099FF;
}

/* 调整四角延长线方向 */
.preview-overlay .top-left-h {
  top: 0;
  left: -30px;
}

.preview-overlay .top-left-v {
  top: -30px;
  left: 0;
}

.preview-overlay .top-right-h {
  top: 0;
  right: -30px;
}

.preview-overlay .top-right-v {
  top: -30px;
  right: 0;
}

.preview-overlay .bot-left-h {
  bottom: 0;
  left: -30px;
}

.preview-overlay .bot-left-v {
  bottom: -30px;
  left: 0;
}

.preview-overlay .bot-right-h {
  bottom: 0;
  right: -30px;
}

.preview-overlay .bot-right-v {
  bottom: -30px;
  right: 0;
}

/* 预览时的标注线 */
.preview-overlay .dimension-lines {
  position: absolute;
  top: -40px;
  left: -40px;
  right: -40px;
  bottom: -40px;
  pointer-events: none;
}

.dimension-line {
  position: absolute;
  pointer-events: none;
}
</style>