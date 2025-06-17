import React from 'react'
import Title from '../components/Title';
import NewsLetter from '../components/NewsLetter';
import {assets} from '../assets/assets';
const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t '>
        <Title text1={'About'} text2={'Us'} />
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet corrupti aperiam quibusdam asperiores necessitatibus, 
            nemo natus temporibus! Deleniti quia maiores autem dolorum quae. Nihil excepturi atque nobis tenetur animi ab!
            Id corporis reprehenderit illo at! Eveniet sequi repellendus similique, ducimus magnam corporis dolorum a minus? 
            Id sequi odit deserunt tenetur fuga.Quos id, officiis aut repudiandae veniam enim eum fugiat.</p>
            
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet corrupti aperiam quibusdam asperiores necessitatibus, 
            nemo natus temporibus! Deleniti quia maiores autem dolorum quae. Nihil excepturi atque nobis tenetur animi ab!
            Id corporis reprehenderit illo at! Eveniet sequi repellendus similique, ducimus magnam corporis dolorum a minus? 
            Id sequi odit deserunt tenetur fuga.Quos id, officiis aut repudiandae veniam enim eum fugiat.</p>

            <b className="text-gray-800">Our Mission</b>
           
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet corrupti aperiam quibusdam asperiores necessitatibus, 
            nemo natus temporibus! Deleniti quia maiores autem dolorum quae. Nihil excepturi atque nobis tenetur animi ab!
            Id corporis reprehenderit illo at! Eveniet sequi repellendus similique, ducimus magnam corporis dolorum a minus? 
            Id sequi odit deserunt tenetur fuga.Quos id, officiis aut repudiandae veniam enim eum fugiat.</p>

        </div>
      </div>
      <div className='text-xl pt-8'>
        <Title text1={'Why'} text2={'Choose Us'} />
      </div>
      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Quality Assurance : </b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet corrupti aperiam quibusdam asperiores necessitatibus, 
            Id sequi odit deserunt tenetur fuga.Quos id, officiis aut repudiandae veniam enim eum fugiat.</p>
        </div>
        <div className="border ml-3 border-gray-300 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Convenience : </b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet corrupti aperiam quibusdam asperiores necessitatibus, 
            Id sequi odit deserunt tenetur fuga.Quos id, officiis aut repudiandae veniam enim eum fugiat.</p>
        </div>
        <div className="border ml-3 border-gray-300 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Execptional Customer Service : </b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet corrupti aperiam quibusdam asperiores necessitatibus, 
            Id sequi odit deserunt tenetur fuga.Quos id, officiis aut repudiandae veniam enim eum fugiat.</p>
        </div>
      </div>
      <NewsLetter />
    </div>
  )
}

export default About
