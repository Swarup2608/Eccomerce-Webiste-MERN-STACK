import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const bestProducts = products.filter((item) => (item.bestSeller))
        setBestSeller(bestProducts.slice(0, 5));

        setLoading(false);
    }, [products])
    return (
        <div className='my-10'>
            <div className="text-center text-3xl py-8">
                <Title text1={"Best"} text2={"Seller"} />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem ipsum dolor sit.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {
                    loading ?
                        <p className="text-center col-span-full text-gray-500">Loading...</p>
                        :
                        bestSeller.length === 0 ?
                            <p className="text-center col-span-full text-gray-500">No products available.</p>
                            :
                            bestSeller.map((item, index) =>
                                <ProductItem key={item._id || index} name={item.name} id={item._id} image={item.image} price={item.price} />
                            )}

            </div>
        </div>
    )
}

export default BestSeller
