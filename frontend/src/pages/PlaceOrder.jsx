import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');

  const { navigate, products, backendURL, token, cartItems, setCartItems, delivery_fee, getCartAmount } = useContext(ShopContext)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) =>{
              console.log(response)
              try {
                  const {data} =  await axios.post(backendURL+'/api/order/verifyRazorPay',response,{headers:{token}})
                  if(data.success){
                    setCartItems({})
                    navigate("/orders")
                    toast.success(data.message)
                  }
                  else{
                    console.log(data.message);
                    toast.error(data.message);
                  }
              } catch (error) {
                  console.log(error);
                  toast.error(error.message);
                  
              }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee

      }
      console.log(method)
      switch (method) {

        // API CALLING FOR COD
        case 'cod':
          const response = await axios.post(backendURL + '/api/order/place', orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            toast.success(response.data.message);
            navigate('/orders')
          }
          else {
            toast.error(response.data.message);
          }
          break;

        case 'stripe':

          const stripe = await axios.post(backendURL + '/api/order/stripe', orderData, { headers: { token } });
          if (stripe.data.success) {
            const session_url = stripe.data.url;
            window.location.replace(session_url);
            // console.log(session_url);
          }
          else {
            toast.error(stripe.data.message);
          }
          break;

        case "razorpay":
          const razorpay = await axios.post(backendURL + '/api/order/razorpay', orderData, { headers: { token } })
          if (razorpay.data.success) {
            initPay(razorpay.data.order)
          }
          else{
            toast.error(razorpay.data.message)
          }
          break;

        default:
          toast.error("Select a payment method!");
          break;

      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* --------- Left Side ---------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"Delivery"} text2={"Information"} />
        </div>
        <div className="flex gap-3">
          <input onChange={onChangeHandler} name='firstName' required value={formData.firstName} type="text" placeholder='First Name' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
          <input onChange={onChangeHandler} name='lastName' required value={formData.lastName} type="text" placeholder='Last Name' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        </div>
        <input onChange={onChangeHandler} name='email' required value={formData.email} type="email" placeholder='Email Address' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        <input onChange={onChangeHandler} name='street' required value={formData.street} type="text" placeholder='Street' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        <div className="flex gap-3">
          <input onChange={onChangeHandler} name='city' required value={formData.city} type="text" placeholder='City' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
          <input onChange={onChangeHandler} name='state' required value={formData.state} type="text" placeholder='State / Province' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        </div>
        <div className="flex gap-3">
          <input onChange={onChangeHandler} name='zipcode' value={formData.zipcode} type="number" placeholder='ZipCode' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
          <input onChange={onChangeHandler} name='country' required value={formData.country} type="text" placeholder='Country' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        </div>
        <input onChange={onChangeHandler} name='phone' required value={formData.phone} type="tel" placeholder='Phone Number' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
      </div>
      {/* ----------- Right Side -------------- */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"Payment"} text2={"Methods"} />
          {/* -------- Payment METHOD Selection ---------- */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod('stripe')} className={`flex items-center gap-3 border-1  p-2 px-3 cursor-pointer ${method === 'stripe' ? 'border-gray-600' : 'border-gray-300'}`}>
              <p className={`min-w-3.5 h-3.5 border  rounded-full ${method === 'stripe' ? 'bg-red-400 border-gray-300' : 'border-gray-400'}`}></p>
              <img src={assets.stripe_logo} className='h-5 mx-4' alt="" />
            </div>
            <div onClick={() => setMethod('razorpay')} className={`flex items-center gap-3 border-1  p-2 px-3 cursor-pointer ${method === 'razorpay' ? 'border-gray-600' : 'border-gray-300'}`} >
              <p className={`min-w-3.5 h-3.5 border  rounded-full ${method === 'razorpay' ? 'bg-red-400 border-gray-300' : 'border-gray-400'}`}></p>
              <img src={assets.razorpay_logo} className='h-5 mx-4' alt="" />
            </div>
            <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border-1  p-2 px-3 cursor-pointer ${method === 'cod' ? 'border-gray-600' : 'border-gray-300'}`}>
              <p className={`min-w-3.5 h-3.5 border  rounded-full ${method === 'cod' ? 'bg-red-400 border-gray-300' : 'border-gray-400'}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>Cash On Delivery</p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button className='cursor-pointer bg-black text-white px-16 py-3 text-sm'>Place Order</button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
