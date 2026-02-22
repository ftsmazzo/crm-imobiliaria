'use client';

import { useState } from 'react';
import { enviarLead } from '@/lib/api';

export default function FormInteresse({ imovelId }: { imovelId: string }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      await enviarLead({
        nome,
        email,
        telefone: telefone || undefined,
        mensagem: mensagem || undefined,
        imovelId,
        origem: 'site',
      });
      setEnviado(true);
      setNome('');
      setEmail('');
      setTelefone('');
      setMensagem('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar');
    }
  }

  if (enviado) {
    return (
      <div className="form-sucesso">
        <p>Mensagem enviada com sucesso! Entraremos em contato em breve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-lead">
      {erro && <p className="form-erro">{erro}</p>}
      <div className="form-group">
        <label htmlFor="nome">Nome *</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="mensagem">Mensagem</label>
        <textarea
          id="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Enviar
      </button>
    </form>
  );
}
