import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios, { all } from 'axios';
import { toast } from 'react-toastify';


const Orders = () => {
  const { backendURL,token, currency } = useContext(ShopContext);
  
  const [orderData,setOrderData] = useState([]);

  const loadOrderData = async () =>{
    
    try {
      if(!token){
        return null;
      }
      const response = await axios.post(backendURL+'/api/order/userorders',{},{headers:{token}});
      if(response.data.success){
        let allOrderItem = [ ];
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrderItem.push(item)
          })
        })
        setOrderData(allOrderItem.reverse())
      }else{
        toast.error(response.data.message);
      }
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    loadOrderData();
  },[token])

  return (
    <div className='border-top pt-16'>

      <div className='text-2xl'>
        <Title text1={"My"} text2={"Orders"} />
      </div>

      <div className=''>
        {
          orderData.map((items, index) => (
            <div className='py-4 border-t border-b border-gray-300 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={items.image[0]} alt={items.name} />
                <div className=''>
                  <p className='sm:text-base font-medium'>{items.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p className='text-lg'>{currency} {items.price}</p>
                    <p>Quantity : {items.quantity}</p>
                    <p>Size : {items.size}</p>
                  </div>
                  <p className='mt-1'>Date : <span className='text-gray-400'> {new Date(items.date).toDateString()} </span></p>
                  <p className='mt-1'>Payment Method : <span className='text-gray-400'> {items.paymentMethod} </span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-300'></p>
                  <p className='text-sm md:text-base'>{items.status}</p>
                </div>
                <button onClick={loadOrderData} className='cursor-pointer border px-4 py-4 text-sm font-medium rounded-sm '>Track Order</button>
              </div>
            </div>
          ))
        }
      </div>

    </div>
  )
}

export default Orders
