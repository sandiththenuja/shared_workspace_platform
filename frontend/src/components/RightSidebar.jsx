import React from 'react'
import assets, { imagesDummyData } from '../assets/assets'

const RightSidebar = ({selecteduser}) => {
  return selecteduser && (
    <div>
      <div>
        <img src={selecteduser?.profilePic || assets.avatar_icon} alt="" />
        <h1>{selecteduser.fullName}</h1>
        <p>{selecteduser.bio}</p>
      </div>

      <hr />

      <div>
        <p>Media</p>
        <div>
          {imagesDummyData.map((url, index) => (
            <div key={index} onClick={() => window.open(url)} className='cursor-pointer'>
              <img src={url} alt="" />
            </div>
          ))}
        </div>
      </div>

      <button>Logout</button>
    </div>
  )
}

export default RightSidebar