import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {ShopContext} from '../context/ShopContext'
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const {productId} = useParams();
  const {products,currency,cartItems,addToCart} = useContext(ShopContext);
  const [productData,setProductData] = useState(false);
  const [image,setImage] = useState('');
  const [size,setSize] = useState('');

  const fetchProduct = async () =>{
    products.map((item)=>{
      if(item._id === productId){
        setProductData(item);
        setImage(item.image[0])
        return null;
      }
    })
  }

  useEffect(()=>{
    fetchProduct();
  },[products,productId])
  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex images-scroll sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {
              productData.image.map((item,index)=>(
                <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex flex-shrink-0 cursor-pointer' />
              ))
            }
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className='w-full h-auto' alt="" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className='font-bold text-2xl mt-2'>{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} className='w-3 5' alt="" />
            <img src={assets.star_icon} className='w-3 5' alt="" />
            <img src={assets.star_icon} className='w-3 5' alt="" />
            <img src={assets.star_icon} className='w-3 5' alt="" />
            <img src={assets.star_dull_icon} className='w-3 5' alt="" />
            <p className="pl-2">{122}</p>
          </div>
          <p className="mt-5 text-3xl font-medium">{currency}{productData.price}</p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size :</p>
            <div className="flex gap-2">
              {
                productData.sizes.map((item,index)=>(
                  <button key={index} onClick={()=>setSize(item)} className={`cursor-pointer px-4 py-2 bg-gray-200 border-2  ${item === size ? 'border-orange-500 bg-orange-200':'border-transparent'}`}>{item} </button>
                ))
              }
            </div>
          </div>
          <button onClick={()=>addToCart(productData._id,size)} className="bg-black text-white px-8 py-3 text-sm cursor-pointer active:bg-gray-700">Add to Cart</button>
          <hr className='mt-8 border-0 sm:2-4/5 h-0.5 bg-gray-300' />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Orginal Product.</p>
            <p>Cash on delivery availble on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>
      {/* Description & Review Section */}
      <div className="mt-20">
        <div className="flex">
          <b className="border border-gray-300 px-5 py-3 text-sm">Description</b>
          <b className="border border-gray-300 px-5 py-3 text-sm">Reviews {122}</b>
        </div>
        <div className="flex flex-col gap-4 border-gray-300 border px-6 py-6 text-sm text-gray-500">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus consequatur unde esse eum. Quod consequatur aut tempore minima, harum illo ex qui adipisci voluptates dolorum excepturi asperiores labore mollitia delectus?</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea accusantium vitae debitis? Voluptate nesciunt optio molestiae tempora at nobis repudiandae ducimus laborum asperiores iure. Soluta quo maiores obcaecati tempore corrupti.</p>
        </div>
      </div>
      {/* Display Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}  />
    </div>
  ) : <div className='opacity-0'></div>
}

export default Product
