import React, { useEffect, useState, useRef } from 'react'
import { Container, Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import { io, Socket } from 'socket.io-client'

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io((import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'))
    socketRef.current = socket
    socket.on('connect', () => console.log('connected to gateway', socket.id))
    socket.emit('join', { room: 'global' })
    socket.on('message', (msg: any) => setMessages((m) => [...m, msg]))
    socket.on('system', (s: any) => console.log('system', s))
    return () => { socket.disconnect() }
  }, [])

  const send = () => {
    if (!text) return
    socketRef.current?.emit('message', { room: 'global', text })
    setText('')
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <List sx={{ height: 400, overflow: 'auto', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1 }}>
          {messages.map((m, i) => (
            <ListItem key={i}><ListItemText primary={m.text || m.message} secondary={new Date(m.ts).toLocaleTimeString()} /></ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField fullWidth value={text} onChange={(e) => setText(e.target.value)} />
          <Button variant="contained" onClick={send}>Send</Button>
        </Box>
      </Box>
    </Container>
  )
}
