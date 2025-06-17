import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products,search,showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType,setSortType] = useState('relavent');

  const ToggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item != e.target.value));
    }
    else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const ToggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item != e.target.value));
    }
    else {
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();
    if(showSearch && search){
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }
    setFilterProducts(productsCopy)
  }

  const sortProduct = () =>{
    let fpCopy = filterProducts.slice()

    switch(sortType){
      case 'low-high' :
        setFilterProducts(fpCopy.sort((a,b) => (a.price - b.price)));
        break;
      case 'high-low' :
        setFilterProducts(fpCopy.sort((a,b) => (b.price - a.price)));
        break;
      
      default :
        applyFilter();
        break;
    }
  }

  useEffect(() => {
    setLoading(true);
    applyFilter();
    setLoading(false);
  }, [category, subCategory,search,showSearch,products]);

  useEffect(()=>{
    setLoading(true);
    sortProduct();
    setLoading(false);
  },[sortType]);

  return (

    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t border-gray-300'>

      {/* Filters */}
      <div className='min-w-60 '>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          Filters <img src={assets.dropdown_icon} className={`h-3 ml-2 sm:hidden ${showFilter ? 'rotate-90' : ''}`} alt="" />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className='mb-3 text-sm font-medium'>Categories</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Men'} onChange={ToggleCategory} /> Men
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Women'} onChange={ToggleCategory} /> Women
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Kids'} onChange={ToggleCategory} /> Kids
            </p>
          </div>
        </div>
        {/* Sub Categories */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className='mb-3 text-sm font-medium'>Type</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Topwear'} onChange={ToggleSubCategory} /> Top wear
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Bottomwear'} onChange={ToggleSubCategory} /> Bottom wear
            </p>
            <p className='flex gap-2'>
              <input type="checkbox" className='w-3' value={'Winterwear'} onChange={ToggleSubCategory} /> Winter wear
            </p>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={'All'} text2={'Collections'} />
          <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2' name="" id="">
            <option value="relavent">Sort by : Relavent</option>
            <option value="low-high">Sort by : Low to High</option>
            <option value="high-low">Sort by : High to Low</option>
          </select>
        </div>
        {/* Map Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {
            loading ?
              <p className="text-center col-span-full text-gray-500">Loading...</p>
              :
              filterProducts.length === 0 ?
                <p className="text-center col-span-full text-gray-500">No products available.</p>
                :
                filterProducts.map((item, index) =>
                  <ProductItem key={item._id || index} name={item.name} id={item._id} image={item.image} price={item.price} />
                )}

        </div>
      </div>
    </div>
  )
}

export default Collection
