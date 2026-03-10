'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TIPOS = [
  { value: '', label: 'Tipo' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'casa_condominio', label: 'Casa em condomínio' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
];

export default function HeroSearch() {
  const router = useRouter();
  const [cidade, setCidade] = useState('');
  const [tipo, setTipo] = useState('');
  const [finalidade, setFinalidade] = useState<'venda' | 'aluguel' | ''>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (cidade.trim()) params.set('cidade', cidade.trim());
    if (tipo) params.set('tipo', tipo);
    if (finalidade) params.set('finalidade', finalidade);
    router.push(`/imoveis${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <form className="hero-search" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="hero-cidade">Cidade</label>
        <input
          id="hero-cidade"
          type="text"
          placeholder="Ex: São Paulo"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="hero-tipo">Tipo</label>
        <select id="hero-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => (
            <option key={t.value || 'all'} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="hero-finalidade">Finalidade</label>
        <select id="hero-finalidade" value={finalidade} onChange={(e) => setFinalidade(e.target.value as 'venda' | 'aluguel' | '')}>
          <option value="">Venda ou locação</option>
          <option value="venda">Venda</option>
          <option value="aluguel">Locação</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Buscar
      </button>
    </form>
  );
}
