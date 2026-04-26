import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/modules/auth/context/auth.context';
import { PageTransition } from '@/@common/components/PageTransition';
import { OfflineProvider } from '@/lib/offline/OfflineProvider';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const APP_NAME = 'CultivApp';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: 'Gestión de cultivos para cooperativas agrícolas',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#27ae60',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <OfflineProvider>
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </OfflineProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable={false}
          theme="light"
        />
      </body>
    </html>
  );
}
