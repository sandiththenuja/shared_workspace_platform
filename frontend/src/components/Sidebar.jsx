import React, { useContext } from 'react'
import assets, { userDummyData } from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Sidebar = ({selectedUser, setSelectedUser}) => {
    const {logout} = useContext(AuthContext)
    const navigate = useNavigate()

  return (
    <div>
        <div>
            <img src={assets.logo} alt="" />
            <div>
                <img src={assets.menu_icon} alt="" />
                <div>
                    <p onClick={() => navigate('/profile')}>Edit profile</p>
                    <p onClick={() => logout()} className='cursor-pointer'>Logout</p>
                </div>
            </div>

            <div>
                <img src={assets.search_icon} alt="Search" />
                <input type="text" placeholder='Search' />
            </div>
        </div>

        <div className="flex flex-col">
            {userDummyData.map((user, index) => (
                <div key={index} className={`relative flex items-center gap-2 p-2 pl-4 rounded-2xl cursor-pointer ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`} onClick={() => setSelectedUser(user)}>
                    <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-8.75 rounded-full' />
                    <div>
                    <p>{user.fullName}</p>
                    {index < 3 
                    ? <span>Online</span>
                    : <span>Offline</span>
                    }
                        
                    </div>
                {index > 2 && <p>{index}</p>}
                </div>
            ))}
        </div>
    </div>
  )
}

export default Sidebar