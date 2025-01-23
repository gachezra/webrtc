import SocketProvider from './providers/SocketProvider'
import Main from './pages/Main'
import { BrowserRouter } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Main/>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App
