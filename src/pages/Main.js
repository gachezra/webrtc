import { useEffect, useState } from 'react'
import useSocket from '../providers/useSocket'
import ChatProvider from '../providers/ChatProvider'
import AudioChat from '../components/AudioChat'
import { useSearchParams } from 'react-router-dom'

export default function Main() {
  const socket = useSocket()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const extractedUsername = searchParams.get('username')
    if (extractedUsername) {
      setUsername(extractedUsername)
      socket.login = extractedUsername
      socket.emit('join', { login: extractedUsername })
    }
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    return () => {
      socket.login = undefined
    }
  }, []) // eslint-disable-line

  if (loading) {
    return <div>Loading.</div>
  }

  return (
    <>
      {username ? (
        <ChatProvider>
          <AudioChat />
        </ChatProvider>
      ) : (
        <div>No username provided in the URL.</div>
      )}
    </>
  )
}
