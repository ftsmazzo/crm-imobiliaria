import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './site-tokens.css';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: 'Imóveis', template: '%s | Imóveis' },
  description: 'Encontre imóveis para venda e locação com atendimento personalizado.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={plusJakarta.variable}>
      <body className={plusJakarta.className} style={{ fontFamily: 'var(--font-heading)' }}>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
