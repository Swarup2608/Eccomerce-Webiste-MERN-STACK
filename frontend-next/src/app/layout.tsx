import type { Metadata } from 'next';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { ShopContextProvider } from '@/context/ShopContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'EcoCart — Buy less. Buy things that stay.',
  description: 'A marketplace for apparel, home goods, skincare, electronics and print — every listing carries its materials, repairability and footprint on the label.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <ShopContextProvider>
          <div className="shell">
            <ToastContainer theme="dark" position="top-right" />
            <Navbar />
            {children}
            <Footer />
          </div>
        </ShopContextProvider>
      </body>
    </html>
  );
}
