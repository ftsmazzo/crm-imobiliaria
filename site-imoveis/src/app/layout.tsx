import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './site-tokens.css';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--site-font-heading',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--site-font-body',
});

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
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className={dmSans.className}>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
