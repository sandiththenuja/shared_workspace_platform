import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const {login} = useContext(AuthContext)

  const onSubmitHandler =  (event) => {
    event.preventDefault()

    if(currState === 'Sign up' && !isDataSubmitted){
      setIsDataSubmitted(true)
      return
    }

    login(currState === "Sign up" ? 'signup' : 'login', {fullName, email, password, bio})
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>

      {/* left */}
      <img src={assets.logo_big} className='w-[min(30vw, 250px)]' alt="" />

      {/* right */}
      <form onSubmit={onSubmitHandler} action="" className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2>{currState}
          {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" /> }
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input type="text" name="" id="" placeholder='Full Name' value={fullName} onChange={(e) => setEmail(e.target.value)}  />
        )}

        {!isDataSubmitted && (
          <>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} placeholder='Enter a bio' required></textarea>
        )}

        <button type='submit'>
          {currState === "Sign up" ? "Create Account" : "Login"}
        </button>

        <div>
          <input type="checkbox" name="" id="" />
          <p>Agree to terms and privacy policy</p>
        </div>

        <div>
          {currState === "Sign up" ? (
            <p>Already have an account? <span onClick={() => {setCurrState("Login"); setIsDataSubmitted(false)}}>Login here</span></p>
          ) : (
            <p>Create an account <span onClick={() => setCurrState("Sign up")}>here</span></p>
          )}
        </div>
      </form>

    </div>
  )
}

export default LoginPage