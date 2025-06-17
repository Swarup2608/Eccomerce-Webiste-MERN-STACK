import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Collection from './pages/Collection'
import Product from './pages/Product'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Verify from './pages/verify'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer  />
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/about' element={<About />}/>
        <Route path='/collections' element={<Collection />}/>
        <Route path='/product/:productId' element={<Product />}/>
        <Route path='/contact' element={<Contact />}/>
        <Route path='/cart' element={<Cart />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/place-order' element={<PlaceOrder />}/>
        <Route path='/orders' element={<Orders />}/>
        <Route path='/verify' element={<Verify />}/>
        
      </Routes>
      <Footer />
    </div>
  )
}

export default App
