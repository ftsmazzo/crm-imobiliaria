export const metadata = {
  title: 'Política de privacidade',
  description: 'Política de privacidade do site.',
};

export default function PoliticaPage() {
  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <h1>Política de privacidade</h1>
      <p className="lead" style={{ color: 'var(--site-muted)', marginBottom: '1.5rem' }}>
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </p>
      <p>
        Os dados informados nos formulários de contato e de interesse em imóveis são utilizados exclusivamente para
        retorno de sua solicitação e não serão compartilhados com terceiros sem seu consentimento.
      </p>
    </div>
  );
}
