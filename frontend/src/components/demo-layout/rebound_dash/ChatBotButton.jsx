import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setShowGPT,
} from '../../../redux/reducers/gpt.reducer';

const ChatBotButton = () => {
  const messages = useSelector((state) => state.gpt.messages)
  const dispatch = useDispatch();

  return (
    <div
      className='z-20 fixed right-[10px] bottom-[10px] cursor-pointer'
      onClick={() => dispatch(setShowGPT(true))}
    >
      <div className='bg-blue-100 w-[60px] h-[60px] rounded-full flex z-30 justify-center items-center'>
        <div className='bg-blue-200 w-[52px] h-[52px] rounded-full justify-center items-center z-[52] flex'>
          <div className='relative bg-blue-300 w-[44px] h-[44px] rounded-full justify-center items-center z-[53] flex'>
            <div className='absolute right-0 top-0 z-[54] bg-blue-100 border-2 border-white rounded-full w-[20px] h-[20px] text-center align-middle text-[10px]'>
              {messages.length}
            </div>
            <img src="/logo_sm.svg" className='top-0 left-0 w-[36px] h-[36px]' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBotButton;