import React, { useState, useEffect } from 'react'
import pandaNormal from './assets/images/panda-normal.png'
import pandaWalking from './assets/images/panda-walking.png'
import pandaYawning from './assets/images/panda-yawning.png'
import './App.css'

function DebugApp() {
  const [images, setImages] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const imageUrls = {
      normal: pandaNormal,
      walking: pandaWalking,
      yawning: pandaYawning
    }
    
    console.log('图片URLs:', imageUrls)
    setImages(imageUrls)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="desktop-pet">
        <div className="loading-container">
          <div className="loading-panda">🐼</div>
          <div className="loading-text">调试模式：加载图片中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="desktop-pet">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        margin: '20px'
      }}>
        <h2>🐼 小竹子调试模式</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>正常状态</h3>
            <img 
              src={images.normal} 
              alt="正常熊猫" 
              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              onLoad={() => console.log('正常熊猫图片加载成功')}
              onError={(e) => console.error('正常熊猫图片加载失败:', e)}
            />
            <p>URL: {images.normal}</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h3>走路状态</h3>
            <img 
              src={images.walking} 
              alt="走路熊猫" 
              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              onLoad={() => console.log('走路熊猫图片加载成功')}
              onError={(e) => console.error('走路熊猫图片加载失败:', e)}
            />
            <p>URL: {images.walking}</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h3>打哈欠状态</h3>
            <img 
              src={images.yawning} 
              alt="打哈欠熊猫" 
              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              onLoad={() => console.log('打哈欠熊猫图片加载成功')}
              onError={(e) => console.error('打哈欠熊猫图片加载失败:', e)}
            />
            <p>URL: {images.yawning}</p>
          </div>
        </div>
        
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          maxWidth: '600px',
          wordBreak: 'break-all'
        }}>
          <strong>调试信息：</strong><br/>
          正常图片: {images.normal}<br/>
          走路图片: {images.walking}<br/>
          打哈欠图片: {images.yawning}
        </div>
      </div>
    </div>
  )
}

export default DebugApp
