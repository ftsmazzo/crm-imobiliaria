import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: { default: 'Imóveis', template: '%s | Imóveis' },
  description: 'Encontre imóveis para venda e locação.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
