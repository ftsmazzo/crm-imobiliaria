import FormContato from './FormContato';

export const metadata = {
  title: 'Contato',
  description: 'Fale conosco.',
};

export default function ContatoPage() {
  return (
    <div className="container" style={{ maxWidth: '560px' }}>
      <h1>Fale conosco</h1>
      <p className="lead" style={{ marginBottom: '1.5rem', color: 'var(--site-muted)' }}>
        Envie sua mensagem que retornaremos em breve.
      </p>
      <FormContato />
    </div>
  );
}
