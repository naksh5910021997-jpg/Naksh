import './globals.css';

export const metadata = {
  title: 'Naksh - Premium T-Shirts',
  description: 'Shop premium quality t-shirts, polos, and more',
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