const dmxLength = 512 // DMX 数据长度
const totalLength = 18 + dmxLength // 总长度 = header + DMX 数据

const lengthMSB = (totalLength >> 8) & 0xff // 高字节
const lengthLSB = totalLength & 0xff // 低字节

const header = Buffer.from([
  0x41, // 'A'
  0x72, // 'r'
  0x74, // 't'
  0x2d, // '-'
  0x4e, // 'N'
  0x65, // 'e'
  0x74, // 't'
  0x00, // 't'
  0x00, // 低字节 OpCode (ArtDMX)
  0x50, // 高字节 OpCode (ArtDMX)
  0x00, // 协议版本 MSB
  0x0e, // 协议版本 LSB
  0x20, // 序列号 (0x20)
  0x00, // 物理通道
  0x00, // 宇宙号 LSB (0x00)
  0x00, // 宇宙号 MSB (0x00)
  lengthMSB, // 数据长度 MSB (计算得出)
  lengthLSB, // 数据长度 LSB (计算得出)
  0x00, // 未使用
  0x00, // 未使用
  0x00, // 未使用
  0x00 // 未使用
])

// 生成 DMX 数据
const dmxData = Buffer.alloc(dmxLength, 0) // 创建一个包含 512 字节的 DMX 数据缓冲区

// 连接 header 和 DMX 数据
const message = Buffer.concat([header, dmxData])

console.log('Sending message:', message.toString('hex'))

// 发送 Art-Net 数据包
client.send(message, 0, message.length, 6454, '192.168.3.95', (err) => {
  if (err) {
    console.error('Error sending message:', err)
  } else {
    console.log('Message sent successfully')
  }
})
