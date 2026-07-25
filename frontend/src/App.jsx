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

function App() {
  const {authUser} = useContext(AuthContext)

  return (
    <>
    <div className='bg-gray-700'>
      <Toaster />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        {/* <Route path='/' element={<LandingPage />} /> */}
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        {/* <Route path='/dashboard' element={!authUser ? <LoginPage /> : <Navigate to="/" />} /> */}
        <Route path='/dashboard' element={<Dashboard /> } />
        <Route path='/chat' element={<Chat /> } />
        <Route path='/files' element={<Files /> } />
        <Route path='/team' element={<Team /> } />
        <Route path='/analytics' element={<Analytics /> } />
        <Route path='/calendar' element={<Calendar /> } />
        <Route path='/settings' element={<Settings /> } />
        <Route path='/dashboard' element={<Dashboard /> } />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>

    </>
  )
}

export default App
