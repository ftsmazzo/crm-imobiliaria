export const metadata = {
  title: 'Quem somos',
  description: 'Conheça nossa imobiliária.',
};

export default function QuemSomosPage() {
  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <h1>Quem somos</h1>
      <p className="lead" style={{ color: 'var(--site-muted)', marginBottom: '1.5rem' }}>
        Sua parceira em negócios imobiliários.
      </p>
      <p>
        Atuamos no mercado com foco em atendimento personalizado, auxiliando na compra, venda e locação de imóveis.
      </p>
      <p>
        Entre em contato pelo formulário ou WhatsApp para conhecer nossas opções e tirar dúvidas.
      </p>
    </div>
  );
}
