import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
        <div>
            <img src={assets.exchange_icon} alt="Exchange" className='w-12 m-auto mb-5' />
            <p className='font-semi-bold'>Easy Exhange Policy</p>
            <p className='text-gray-400'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
        <div>
            <img src={assets.quality_icon} alt="Exchange" className='w-12 m-auto mb-5' />
            <p className='font-semi-bold'>7 Days Return Policy</p>
            <p className='text-gray-400'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
        <div>
            <img src={assets.support_img} alt="Exchange" className='w-12 m-auto mb-5' />
            <p className='font-semi-bold'>Best Customer Support</p>
            <p className='text-gray-400'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
      
    </div>
  )
}

export default OurPolicy
