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
import ProtectedRoute from './components/auth/ProtectedRoute'
import CanvasDashboard from './pages/CanvasDashboard'
import DashboardRouter from './layout/DashboardRouter'
import ViewTaskDetails from './components/ViewTaskDetails'

function App() {
  const {authUser} = useContext(AuthContext)

  return (
    <>
    <div className='bg-gray-700'>
      <Toaster />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path='/dashboard' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path='/chat' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path='/files' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path='/team' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path='/team/task/:id' element={<ProtectedRoute><ViewTaskDetails /></ProtectedRoute>} />
        <Route path='/analytics' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path='/calendar' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path='/canvas' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        {/* <Route path="/canvas/:teamId" element={<ProtectedRoute><CanvasDashboard /></ProtectedRoute>} /> */}
        <Route path='/profile' element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      </Routes>
    </div>

    </>
  )
}

export default App
