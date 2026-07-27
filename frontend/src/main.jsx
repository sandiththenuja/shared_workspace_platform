import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import { TeamProvider } from './context/TeamContext.jsx'
import { FileProvider } from './context/FileContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <TaskProvider>
          <TeamProvider>
            <FileProvider>
              <App />
            </FileProvider>
          </TeamProvider>
        </TaskProvider>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
    </StrictMode>,
)
