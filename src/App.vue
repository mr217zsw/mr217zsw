<template>
  <div class="app">
    <h1>图片标注工具</h1>

    <div class="upload-section">
      <label class="file-label" for="fileInput"> 选择图片 </label>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        multiple
        @change="handleFileUpload"
      />
    </div>

    <!-- 图片表格 -->
    <el-table :data="imageList" style="width: 100%" border>
      <el-table-column label="原图" width="150">
        <template #default="scope">
          <div class="image-container">
            <el-image
              :src="scope.row.originalUrl"
              :style="getImageStyle(scope.row)"
              fit="cover"
              class="annotated-image"
              @click="showPreview(scope.row)"
            >
              <!-- 标注覆盖层 -->
              <div
                class="annotation-overlay"
                :style="getOverlayStyle(scope.row)"
              >
                <!-- 滚动区域 -->
                <div
                  class="scroll-area"
                  :style="getScrollAreaStyle(scope.row)"
                ></div>

                <!-- 虚线 -->
                <div class="dashed-lines">
                  <!-- 顶部虚线 -->
                  <div
                    class="dashed-line top"
                    :style="getDashedLineStyle('top', scope.row)"
                  ></div>
                  <!-- 底部虚线 -->
                  <div
                    class="dashed-line bottom"
                    :style="getDashedLineStyle('bottom', scope.row)"
                  ></div>
                  <!-- 左侧虚线 -->
                  <div
                    class="dashed-line left"
                    :style="getDashedLineStyle('left', scope.row)"
                  ></div>
                  <!-- 右侧虚线 -->
                  <div
                    class="dashed-line right"
                    :style="getDashedLineStyle('right', scope.row)"
                  ></div>
                </div>

                <!-- 尺寸标注 -->
                <div class="annotations">
                  <!-- 顶部留白标注 -->
                  <div
                    class="annotation top"
                    :style="getAnnotationStyle('top', scope.row)"
                  >
                    {{ scope.row.marginTop }}px
                  </div>
                  <!-- 底部留白标注 -->
                  <div
                    class="annotation bottom"
                    :style="getAnnotationStyle('bottom', scope.row)"
                  >
                    {{ scope.row.marginBottom }}px
                  </div>
                  <!-- 左侧留白标注 -->
                  <div
                    class="annotation left"
                    :style="getAnnotationStyle('left', scope.row)"
                  >
                    {{ scope.row.marginLeft }}px
                  </div>
                  <!-- 右侧留白标注 -->
                  <div
                    class="annotation right"
                    :style="getAnnotationStyle('right', scope.row)"
                  >
                    {{ scope.row.marginRight }}px
                  </div>

                  <!-- 图片宽度标注（顶部） -->
                  <div
                    class="annotation width top"
                    :style="getWidthAnnotationStyle('top', scope.row)"
                  >
                    {{ scope.row.width }}px
                  </div>
                  <!-- 图片宽度标注（底部） -->
                  <div
                    class="annotation width bottom"
                    :style="getWidthAnnotationStyle('bottom', scope.row)"
                  >
                    {{ scope.row.width }}px
                  </div>
                  <!-- 图片高度标注（左侧） -->
                  <div
                    class="annotation height left"
                    :style="getHeightAnnotationStyle('left', scope.row)"
                  >
                    {{ scope.row.height }}px
                  </div>
                  <!-- 图片高度标注（右侧） -->
                  <div
                    class="annotation height right"
                    :style="getHeightAnnotationStyle('right', scope.row)"
                  >
                    {{ scope.row.height }}px
                  </div>
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
                    :style="getDimensionLineStyle('top', scope.row)"
                  ></div>
                  <!-- 底部宽度线 -->
                  <div
                    class="dimension-line bottom"
                    :style="getDimensionLineStyle('bottom', scope.row)"
                  ></div>
                  <!-- 左侧高度线 -->
                  <div
                    class="dimension-line left"
                    :style="getDimensionLineStyle('left', scope.row)"
                  ></div>
                  <!-- 右侧高度线 -->
                  <div
                    class="dimension-line right"
                    :style="getDimensionLineStyle('right', scope.row)"
                  ></div>
                </div>
              </div>
            </el-image>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="宽度" prop="width" width="100" />
      <el-table-column label="高度" prop="height" width="100" />
      <el-table-column label="滚动宽度" prop="scrollWidth" width="120" />
      <el-table-column label="滚动高度" prop="scrollHeight" width="120" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editImage(scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑留白值" width="30%">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="顶部留白">
          <el-input-number
            v-model="editForm.marginTop"
            :min="0"
            :max="1000"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="底部留白">
          <el-input-number
            v-model="editForm.marginBottom"
            :min="0"
            :max="1000"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="左侧留白">
          <el-input-number
            v-model="editForm.marginLeft"
            :min="0"
            :max="1000"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="右侧留白">
          <el-input-number
            v-model="editForm.marginRight"
            :min="0"
            :max="1000"
            :step="10"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览弹窗组件 -->
    <ImagePreview
      :visible="previewVisible"
      :image="previewImage"
      @close="closePreview"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { calculateAnnotationStyles } from "./utils/imageProcessor.js";
import ImagePreview from "./components/ImagePreview.vue";

const fileInput = ref(null);
const imageList = ref([]);

// 预览相关状态
const previewVisible = ref(false);
const previewImage = ref({
  originalUrl: "",
  width: 0,
  height: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  scrollMidX: 0,
  scrollMidY: 0,
});

// 编辑相关状态
const dialogVisible = ref(false);
const editForm = ref({
  id: "",
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
});

const handleFileUpload = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          // 基础留白值
          let marginTop = 110;
          let marginBottom = 110;
          let marginLeft = 110;
          let marginRight = 110;

          // 横版图片底部留白230
          if (img.width > img.height) {
            marginBottom = 230;
          }

          const scrollWidth = img.width - (marginLeft + marginRight);
          const scrollHeight = img.height - (marginTop + marginBottom);

          imageList.value.push({
            id: Date.now() + Math.random(),
            originalUrl: e.target.result,
            width: img.width,
            height: img.height,
            scrollWidth: scrollWidth,
            scrollHeight: scrollHeight,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
            marginRight: marginRight,
            ...calculateAnnotationStyles(
              img.width,
              img.height,
              scrollWidth,
              scrollHeight,
              marginTop,
              marginBottom,
              marginLeft,
              marginRight,
            ),
          });
        };
      };
      reader.readAsDataURL(file);
    });
  }
};

// 预览相关方法
const showPreview = (image) => {
  previewImage.value = { ...image };
  previewVisible.value = true;
};

const closePreview = () => {
  previewVisible.value = false;
};

// 编辑相关方法
const editImage = (image) => {
  editForm.value = {
    id: image.id,
    marginTop: image.marginTop,
    marginBottom: image.marginBottom,
    marginLeft: image.marginLeft,
    marginRight: image.marginRight,
  };
  dialogVisible.value = true;
};

const saveEdit = () => {
  const index = imageList.value.findIndex(
    (item) => item.id === editForm.value.id,
  );
  if (index !== -1) {
    const image = imageList.value[index];
    // 更新margin值
    image.marginTop = editForm.value.marginTop;
    image.marginBottom = editForm.value.marginBottom;
    image.marginLeft = editForm.value.marginLeft;
    image.marginRight = editForm.value.marginRight;
    // 重新计算滚动区域尺寸
    image.scrollWidth = image.width - (image.marginLeft + image.marginRight);
    image.scrollHeight = image.height - (image.marginTop + image.marginBottom);
    // 重新计算标注样式
    Object.assign(
      image,
      calculateAnnotationStyles(
        image.width,
        image.height,
        image.scrollWidth,
        image.scrollHeight,
        image.marginTop,
        image.marginBottom,
        image.marginLeft,
        image.marginRight,
      ),
    );
  }
  dialogVisible.value = false;
};

const getImageStyle = (image) => {
  return {
    width: "100px",
    height: "100px",
    position: "relative",
    display: "block",
  };
};

const getOverlayStyle = (image) => {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  };
};

const getScrollAreaStyle = (image) => {
  return {
    position: "absolute",
    top: `${image.marginTop}px`,
    left: `${image.marginLeft}px`,
    width: `${image.scrollWidth}px`,
    height: `${image.scrollHeight}px`,
    border: "2px solid #0099FF",
    backgroundColor: "rgba(100, 181, 246, 0.3)",
    boxSizing: "border-box",
  };
};

const getDashedLineStyle = (position, image) => {
  const styles = {
    position: "absolute",
    pointerEvents: "none",
  };

  switch (position) {
    case "top":
      return {
        ...styles,
        top: 0,
        left: `${image.scrollMidX}px`,
        width: "2px",
        height: `${image.marginTop}px`,
        borderLeft: "2px dashed #0099FF",
      };
    case "bottom":
      return {
        ...styles,
        bottom: 0,
        left: `${image.scrollMidX}px`,
        width: "2px",
        height: `${image.marginBottom}px`,
        borderLeft: "2px dashed #0099FF",
      };
    case "left":
      return {
        ...styles,
        left: 0,
        top: `${image.scrollMidY}px`,
        width: `${image.marginLeft}px`,
        height: "2px",
        borderTop: "2px dashed #0099FF",
      };
    case "right":
      return {
        ...styles,
        right: 0,
        top: `${image.scrollMidY}px`,
        width: `${image.marginRight}px`,
        height: "2px",
        borderTop: "2px dashed #0099FF",
      };
    default:
      return styles;
  }
};

const getAnnotationStyle = (position, image) => {
  const styles = {
    position: "absolute",
    pointerEvents: "none",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#0099FF",
    whiteSpace: "nowrap",
  };

  switch (position) {
    case "top":
      return {
        ...styles,
        top: `${image.marginTop / 2 - 6}px`,
        left: `${image.scrollMidX + 5}px`,
      };
    case "bottom":
      return {
        ...styles,
        bottom: `${image.marginBottom / 2 - 6}px`,
        left: `${image.scrollMidX + 5}px`,
      };
    case "left":
      return {
        ...styles,
        left: `${image.marginLeft / 2 - 15}px`,
        top: `${image.scrollMidY + 5}px`,
      };
    case "right":
      return {
        ...styles,
        right: `${image.marginRight / 2 - 15}px`,
        top: `${image.scrollMidY + 5}px`,
      };
    default:
      return styles;
  }
};

const getWidthAnnotationStyle = (position, image) => {
  const styles = {
    position: "absolute",
    pointerEvents: "none",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#0099FF",
    whiteSpace: "nowrap",
  };

  switch (position) {
    case "top":
      return {
        ...styles,
        top: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "bottom":
      return {
        ...styles,
        bottom: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    default:
      return styles;
  }
};

const getHeightAnnotationStyle = (position, image) => {
  const styles = {
    position: "absolute",
    pointerEvents: "none",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#0099FF",
    whiteSpace: "nowrap",
  };

  switch (position) {
    case "left":
      return {
        ...styles,
        left: "-30px",
        top: "50%",
        transform: "translateY(-50%) rotate(-90deg)",
      };
    case "right":
      return {
        ...styles,
        right: "-30px",
        top: "50%",
        transform: "translateY(-50%) rotate(-90deg)",
      };
    default:
      return styles;
  }
};

const getDimensionLineStyle = (position, image) => {
  const styles = {
    position: "absolute",
    pointerEvents: "none",
  };

  switch (position) {
    case "top":
      return {
        ...styles,
        top: "-10px",
        left: "25px",
        right: "25px",
        height: "2px",
        borderTop: "2px solid #0099FF",
      };
    case "bottom":
      return {
        ...styles,
        bottom: "-10px",
        left: "25px",
        right: "25px",
        height: "2px",
        borderTop: "2px solid #0099FF",
      };
    case "left":
      return {
        ...styles,
        left: "-10px",
        top: "25px",
        bottom: "25px",
        width: "2px",
        borderLeft: "2px solid #0099FF",
      };
    case "right":
      return {
        ...styles,
        right: "-10px",
        top: "25px",
        bottom: "25px",
        width: "2px",
        borderLeft: "2px solid #0099FF",
      };
    default:
      return styles;
  }
};

// 生命周期
onMounted(() => {
  // 恢复滚动
  document.body.style.overflow = "";
});

onUnmounted(() => {
  // 恢复滚动
  document.body.style.overflow = "";
});
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  margin-bottom: 20px;
}

.file-label {
  display: inline-block;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.file-label:hover {
  background-color: #66b1ff;
}

input[type="file"] {
  display: inline-block;
}

.image-container {
  position: relative;
  display: inline-block;
}

.annotated-image {
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.annotation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
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
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  pointer-events: none;
}

.corner-line {
  position: absolute;
  border-color: #0099ff;
  pointer-events: none;
}

.top-left-h,
.top-right-h,
.bot-left-h,
.bot-right-h {
  width: 15px;
  height: 0;
  border-top: 2px solid;
}

.top-left-v,
.top-right-v,
.bot-left-v,
.bot-right-v {
  width: 0;
  height: 15px;
  border-left: 2px solid;
}

.top-left-h {
  top: 0;
  left: 0;
}

.top-left-v {
  top: 0;
  left: 0;
}

.top-right-h {
  top: 0;
  right: 0;
}

.top-right-v {
  top: 0;
  right: 0;
}

.bot-left-h {
  bottom: 0;
  left: 0;
}

.bot-left-v {
  bottom: 0;
  left: 0;
}

.bot-right-h {
  bottom: 0;
  right: 0;
}

.bot-right-v {
  bottom: 0;
  right: 0;
}

.dimension-lines {
  position: absolute;
  top: -30px;
  left: -30px;
  right: -30px;
  bottom: -30px;
  pointer-events: none;
}

.dimension-line {
  position: absolute;
  pointer-events: none;
}
</style>
