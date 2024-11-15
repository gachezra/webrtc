import { useState, useEffect, useCallback, useContext } from 'react'
import cx from 'classnames'
import { ChatContext } from './ChatProvider'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const { streams } = useContext(ChatContext)

  const startRecording = useCallback(() => {
    const audioTracks = Object.values(streams).reduce((tracks, stream) => {
      return tracks.concat(stream.getAudioTracks())
    }, [])

    if (audioTracks.length === 0) {
      console.warn('No audio tracks available to record')
      return
    }

    const combinedStream = new MediaStream(audioTracks)
    const recorder = new MediaRecorder(combinedStream)
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setAudioChunks(chunks => [...chunks, event.data])
      }
    }

    recorder.start(1000)
    setMediaRecorder(recorder)
    setIsRecording(true)
  }, [streams])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }, [mediaRecorder])

  const saveRecording = useCallback(() => {
    if (audioChunks.length === 0) return

    const blob = new Blob(audioChunks, { type: 'audio/webm' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-recording-${new Date().toISOString()}.webm`
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    setAudioChunks([])
  }, [audioChunks])

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
    }
  }, [mediaRecorder])

  return {
    isRecording,
    startRecording,
    stopRecording,
    saveRecording,
    hasRecording: audioChunks.length > 0
  }
}

const style = document.createElement('style')
style.textContent = `
  .recorder-controls {
    display: flex
    gap: 8px
    align-items: center
  }

  .record-button.recording {
    background-color: #ff4444
  }

  .record-button.recording:hover {
    background-color: #cc3333
  }

  .save-button {
    background-color: #4CAF50
  }

  .save-button:hover {
    background-color: #45a049
  }
`
document.head.appendChild(style)

export default function AudioRecorder() {
  const {
    isRecording,
    startRecording,
    stopRecording,
    saveRecording,
    hasRecording
  } = useAudioRecorder()

  return (
    <div className="recorder-controls">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className={cx('button', 'record-button')}
          type="button"
        >
          Record
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className={cx('button', 'record-button', 'recording')}
          type="button"
        >
          Stop
        </button>
      )}
      
      {hasRecording && !isRecording && (
        <button
          onClick={saveRecording}
          className={cx('button', 'save-button')}
          type="button"
        >
          Save
        </button>
      )}
    </div>
  )
}