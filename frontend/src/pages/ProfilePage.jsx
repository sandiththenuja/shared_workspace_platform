import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../context/AuthContext'

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate()
  const [name, setName] = useState(authUser.fullName)
  const [bio, setBio] = useState(authUser.bio)

  const {authUser, updateProfile} = useContext(AuthContext)

  const handleSubmit = async(e) => {
    e.preventDefault()
    if(!selectedImg){
      await updateProfile({fullName: name, bio})
      navigate('/')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(selectedImg)
    reader.onload = async() => {
      const base64Image = reader.result
      await updateProfile({profilePic: base64Image, fullName: name, bio})
      navigate('/')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Profile Details</h3>
        <label htmlFor="avatar">
          <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
          <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" />
          upload image
        </label>

        <input type="text" placeholder='Name' onChange={(e) => setName(e.target.value)} value={name} />

        <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4}></textarea>

        <button type='submit'>Save</button>
      </form>

      <img src={authUser?.profilePic || assets.logo_icon} alt="" />
    </div>
  )
}

export default ProfilePage