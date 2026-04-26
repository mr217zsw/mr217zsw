/**
 * 计算标注样式
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {number} scrollWidth - 滚动区域宽度
 * @param {number} scrollHeight - 滚动区域高度
 * @param {number} marginTop - 顶部留白
 * @param {number} marginBottom - 底部留白
 * @param {number} marginLeft - 左侧留白
 * @param {number} marginRight - 右侧留白
 * @returns {Object} 计算后的样式对象
 */
export const calculateAnnotationStyles = (width, height, scrollWidth, scrollHeight, marginTop, marginBottom, marginLeft, marginRight) => {
  // 计算滚动区域中点
  const scrollMidX = marginLeft + scrollWidth / 2
  const scrollMidY = marginTop + scrollHeight / 2
  
  return {
    scrollMidX,
    scrollMidY
  }
}

/**
 * 计算缩略图标注样式
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {number} scrollWidth - 滚动区域宽度
 * @param {number} scrollHeight - 滚动区域高度
 * @param {number} marginTop - 顶部留白
 * @param {number} marginBottom - 底部留白
 * @param {number} marginLeft - 左侧留白
 * @param {number} marginRight - 右侧留白
 * @param {number} thumbWidth - 缩略图宽度
 * @param {number} thumbHeight - 缩略图高度
 * @returns {Object} 计算后的缩略图样式对象
 */
export const calculateThumbnailStyles = (width, height, scrollWidth, scrollHeight, marginTop, marginBottom, marginLeft, marginRight, thumbWidth = 100, thumbHeight = 100) => {
  // 计算缩放比例
  const scale = Math.min(thumbWidth / width, thumbHeight / height)
  
  // 计算缩放后的尺寸
  const scaledWidth = width * scale
  const scaledHeight = height * scale
  const scaledMarginTop = marginTop * scale
  const scaledMarginBottom = marginBottom * scale
  const scaledMarginLeft = marginLeft * scale
  const scaledMarginRight = marginRight * scale
  const scaledScrollWidth = scrollWidth * scale
  const scaledScrollHeight = scrollHeight * scale
  const scaledScrollMidX = scaledMarginLeft + scaledScrollWidth / 2
  const scaledScrollMidY = scaledMarginTop + scaledScrollHeight / 2
  
  return {
    scale,
    scaledWidth,
    scaledHeight,
    scaledMarginTop,
    scaledMarginBottom,
    scaledMarginLeft,
    scaledMarginRight,
    scaledScrollWidth,
    scaledScrollHeight,
    scaledScrollMidX,
    scaledScrollMidY
  }
}
