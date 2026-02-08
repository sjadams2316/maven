import './globals.css';

export const metadata = {
  title: 'Portfolio Optimizer',
  description: 'Side-by-side portfolio comparison with custom benchmarks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
