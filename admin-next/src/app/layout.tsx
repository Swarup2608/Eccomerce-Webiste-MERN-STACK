import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { AdminContextProvider } from '@/context/AdminContext';
import AdminGate from '@/components/AdminGate';

export const metadata: Metadata = {
  title: 'EcoCart Admin',
  description: 'Staff panel for managing EcoCart products and orders.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminContextProvider>
          <div className="shell">
            <ToastContainer theme="dark" position="top-right" />
            <AdminGate>{children}</AdminGate>
          </div>
        </AdminContextProvider>
      </body>
    </html>
  );
}
