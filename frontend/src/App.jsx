import { useContext, useState } from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import { AuthContext } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Files from './pages/Files'
import Team from './pages/Team'
import Analytics from './pages/Analytics'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const {authUser} = useContext(AuthContext)

  return (
    <>
    <div className='bg-gray-700'>
      <Toaster />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path='/files' element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path='/team' element={<ProtectedRoute><Team /></ProtectedRoute>} />
        <Route path='/analytics' element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path='/calendar' element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </div>

    </>
  )
}

export default App
