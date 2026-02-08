import './globals.css';

export const metadata = {
  title: 'Concentrated Position Optimizer',
  description: 'Model strategies for managing concentrated stock positions tax-efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
