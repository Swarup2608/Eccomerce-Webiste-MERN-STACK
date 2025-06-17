import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '$';
    const delivery_fee = 10;
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error("Select product size!!!");
            return;
        }
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        if (token) {
            try {

                console.log("Verified")
                await axios.post(backendURL + '/api/cart/add', { itemId, size }, { headers: { token } });

                console.log("Verified2")
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
        else {
            
            toast.error("Please login to add items to cart!")
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {

                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                }
                catch (error) {

                }
            }
        }
        return totalCount;
    }

    const getUserCart = async (token) =>{
        try {
            const response = await axios.post(backendURL+'/api/cart/get',{},{headers:{token}});
            if(response.data.success){
                setCartItems(response.data.cartData);
            }
            else{
                toast.error(response.data.message);
            }
        } catch (error) {
                console.log(error);
                toast.error(error.message);
        }
    }  

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
        if (token) {
            try {
                await axios.post(backendURL + '/api/cart/update', { itemId,size, quantity }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
        else {
            toast.error("Please login to add items to cart!")
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let iteminfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += iteminfo.price * cartItems[items][item];

                    }
                }
                catch (error) {

                }
            }
        }
        return totalAmount;
    }

    const getProductData = async () => {
        try {
            const response = await axios.get(backendURL + '/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products);
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
    useEffect(() => {
        getProductData();
        if(!token &&localStorage.getItem('token')){
            setToken(localStorage.getItem('token'));
            getUserCart(localStorage.getItem('token'));
        }
    }, [])
    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart, getCartCount, updateQuantity,
        getCartAmount, navigate, backendURL, token, setToken
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;