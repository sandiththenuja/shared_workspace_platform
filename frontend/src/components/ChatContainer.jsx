import React, { useEffect, useRef } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'

const ChatContainer = ({selectedUser, setSelectedUser}) => {
  const scrollEnd = useRef(null)

  useEffect(() => {
    if(scrollEnd.current){
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return selectedUser ? (
    <div>
      <div>
        <img src={assets.profile_martin} alt="" />
        <p>Abcd
          <span></span>
        </p>
        <img src={assets.arrow_icon} alt="" onClick={() => setSelectedUser(null)} />
        <img src={assets.help_icon} alt="" />
      </div>

      {/* char box */}
    <div>
      {messagesDummyData.map((msg, index) => (
        <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== '680f50e4f10f3cd28382ecf9' && 'flex-row-reverse'}`}>
          {msg.image ? (
            <img src={assets.image} alt="" />
          ) : (
            <p>{msg.text}</p>
          )}
          <div className="">
            <img src={msg.senderId === '680f50e4f10f3cd28382ecf9' ? assets.avatar_icon : assets.profile_martin} alt="" srcset="" />
            <p>{formatMessageTime(msg.createdAt)}</p>
          </div>
        </div>
      ))}

      <div ref={scrollEnd}></div>
    </div>

    {/* bottom area */}
      <div>
        <div>
          <input type="text" placeholder='Send a message' />
          <input type="file" id='image' accept='image/png, image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className='cursor-pointer' alt="" />
          </label>
        </div>
        <img src={assets.send_button} alt="" />
      </div>

    </div>
  ) : (
    <div>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime</p>
    </div>
  )
}

export default ChatContainer