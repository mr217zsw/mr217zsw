/**
 * 处理图片标注的工具函数
 * @param {string} imageUrl - 图片URL
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {number} scrollWidth - 滚动区域宽度
 * @param {number} scrollHeight - 滚动区域高度
 * @returns {Promise<string>} 处理后的图片URL
 */
export const processImage = (imageUrl, width, height, scrollWidth, scrollHeight) => {
  return new Promise((resolve) => {
    // 创建一个临时的图片对象
    const img = new Image()
    img.src = imageUrl

    img.onload = () => {
      // 判断图片类型并计算留白
      let marginTop = 110
      let marginBottom = 110
      let marginLeft = 110
      let marginRight = 110
      
      if (width > height) {
        // 横版图片：底部留白230
        marginBottom = 230
      }
      // 创建Canvas，添加足够的额外空间用于绘制延长线和标注
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 添加额外的边距用于绘制延长线和标注
      const padding = 100
      canvas.width = width + padding * 2
      canvas.height = height + padding * 2

      // 绘制原始图片（居中）
      ctx.drawImage(img, padding, padding)

      // 计算标注区域坐标（相对于canvas的左上角）
      const scrollLeft = padding + marginLeft
      const scrollTop = padding + marginTop
      
      // 绘制滚动区域（带蓝色填充底色）
      ctx.fillStyle = 'rgba(0, 191, 255, 0.3)'
      ctx.fillRect(scrollLeft, scrollTop, scrollWidth, scrollHeight)
      ctx.strokeStyle = '#00BFFF'
      ctx.lineWidth = 3
      ctx.strokeRect(scrollLeft, scrollTop, scrollWidth, scrollHeight)
      
      // 绘制留白间隙的尺寸标注（亮红色，更醒目）
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = '#FF3300'
      
      // 顶部留白
      ctx.fillText(`${marginTop}px`, padding + width/2 - 20, scrollTop - 20)
      
      // 底部留白
      ctx.fillText(`${marginBottom}px`, padding + width/2 - 20, scrollTop + scrollHeight + 40)
      
      // 左侧留白
      ctx.save()
      ctx.translate(scrollLeft - 40, padding + height/2)
      ctx.rotate(-Math.PI/2)
      ctx.fillText(`${marginLeft}px`, -30, 5)
      ctx.restore()
      
      // 右侧留白
      ctx.save()
      ctx.translate(scrollLeft + scrollWidth + 40, padding + height/2)
      ctx.rotate(-Math.PI/2)
      ctx.fillText(`${marginRight}px`, -30, 5)
      ctx.restore()
      
      // 绘制图片四个角的延长线（亮红色）
      ctx.strokeStyle = '#FF3300'
      ctx.lineWidth = 3
      
      // 左上角延长线
      ctx.beginPath()
      ctx.moveTo(padding - 30, padding)
      ctx.lineTo(padding, padding)
      ctx.moveTo(padding, padding - 30)
      ctx.lineTo(padding, padding)
      ctx.stroke()
      
      // 右上角延长线
      ctx.beginPath()
      ctx.moveTo(padding + width + 30, padding)
      ctx.lineTo(padding + width, padding)
      ctx.moveTo(padding + width, padding - 30)
      ctx.lineTo(padding + width, padding)
      ctx.stroke()
      
      // 左下角延长线
      ctx.beginPath()
      ctx.moveTo(padding - 30, padding + height)
      ctx.lineTo(padding, padding + height)
      ctx.moveTo(padding, padding + height + 30)
      ctx.lineTo(padding, padding + height)
      ctx.stroke()
      
      // 右下角延长线
      ctx.beginPath()
      ctx.moveTo(padding + width + 30, padding + height)
      ctx.lineTo(padding + width, padding + height)
      ctx.moveTo(padding + width, padding + height + 30)
      ctx.lineTo(padding + width, padding + height)
      ctx.stroke()
      
      // 绘制图片宽度标注（在图片区域外顶部，亮红色）
      ctx.strokeStyle = '#FF3300'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(padding + 50, padding - 50)
      ctx.lineTo(padding + width - 50, padding - 50)
      ctx.stroke()
      ctx.fillText(`${width}px`, padding + width/2 - 30, padding - 60)
      
      // 绘制图片高度标注（在图片区域外左侧，亮红色）
      ctx.beginPath()
      ctx.moveTo(padding - 50, padding + 50)
      ctx.lineTo(padding - 50, padding + height - 50)
      ctx.stroke()
      ctx.save()
      ctx.translate(padding - 70, padding + height/2)
      ctx.rotate(-Math.PI/2)
      ctx.fillText(`${height}px`, -35, 5)
      ctx.restore()
      
      // 绘制图片底部宽度标注（在图片区域外底部，亮红色）
      ctx.beginPath()
      ctx.moveTo(padding + 50, padding + height + 50)
      ctx.lineTo(padding + width - 50, padding + height + 50)
      ctx.stroke()
      ctx.fillText(`${width}px`, padding + width/2 - 30, padding + height + 70)
      
      // 绘制图片右侧高度标注（在图片区域外右侧，亮红色）
      ctx.beginPath()
      ctx.moveTo(padding + width + 50, padding + 50)
      ctx.lineTo(padding + width + 50, padding + height - 50)
      ctx.stroke()
      ctx.save()
      ctx.translate(padding + width + 70, padding + height/2)
      ctx.rotate(-Math.PI/2)
      ctx.fillText(`${height}px`, -35, 5)
      ctx.restore()

      // 将Canvas转换为图片URL
      const dataUrl = canvas.toDataURL('image/png')
      resolve(dataUrl)
    }
  })
}
