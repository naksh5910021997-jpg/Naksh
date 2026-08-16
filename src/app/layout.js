import './globals.css';

export const metadata = {
  title: 'Naksh - Premium Clothing',
  description: 'Shop premium quality T-shirts, trousers, polos, and more',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
