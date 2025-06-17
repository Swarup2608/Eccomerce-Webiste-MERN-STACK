import React from 'react'
import Title from '../components/Title';
import NewsLetter from '../components/NewsLetter';
import {assets} from '../assets/assets';

const Contact = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-10 border-t">
        <Title text1={"Contact"} text2={"Us"} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="Contact Image" />
        <div className="flex-col flex justify-center items-start gap-6">
          <p className="font-semibold font-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">54709 Willims Station <br /> Suite 350, Washington</p>
          <p className="text-gray-500">Tel : (515) 555-0123 <br /> Email : admin@forever.com</p>
          <p className="font-semibold text-xl text-gray-600">Carrers At Forever</p>
          <p className="text-gray-500">Learn more about our teams and job openings.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black cursor-pointer hover:text-white transition-all duration-500'>Explore Jobs</button>
        </div>
      </div>
      <NewsLetter />
    </div>
  )
}

export default Contact
