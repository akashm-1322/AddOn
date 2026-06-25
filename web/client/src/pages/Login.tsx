import React from 'react'
import { Container, Box, Button, Typography } from '@mui/material'
import { io } from 'socket.io-client'

export default function Login() {
  const handleGoogle = async () => {
    // This is a stub: in production you'd do OAuth flow
    const res = await fetch('/v1/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_token: 'stub' }) })
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    window.location.href = '/chat'
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center', backdropFilter: 'blur(6px)', p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>Welcome to AddOn (dev)</Typography>
        <Button variant="contained" onClick={handleGoogle}>Sign in with Google (stub)</Button>
      </Box>
    </Container>
  )
}
