'use client';

import { useEffect, useState } from 'react';
import { getImoveis } from '@/lib/api';
import type { ImovelPublic } from '@/lib/api';
import ImovelCard from '@/components/ImovelCard';

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
];

export default function ImoveisClient({ imoveisIniciais }: { imoveisIniciais: ImovelPublic[] }) {
  const [imoveis, setImoveis] = useState<ImovelPublic[]>(imoveisIniciais);
  const [loading, setLoading] = useState(false);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipo, setTipo] = useState('');

  useEffect(() => {
    if (!cidade && !bairro && !tipo) {
      setImoveis(imoveisIniciais);
      return;
    }
    setLoading(true);
    getImoveis({
      status: 'disponivel',
      cidade: cidade || undefined,
      bairro: bairro || undefined,
      tipo: tipo || undefined,
    })
      .then(setImoveis)
      .finally(() => setLoading(false));
  }, [cidade, bairro, tipo, imoveisIniciais]);

  return (
    <>
      <div className="filtros-form">
        <div className="form-group">
          <label>Cidade</label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex: São Paulo"
          />
        </div>
        <div className="form-group">
          <label>Bairro</label>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Ex: Centro"
          />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t.value || 'all'} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="imoveis-loading">Buscando…</p>}
      {!loading && imoveis.length === 0 && (
        <p className="imoveis-empty-msg">Nenhum imóvel encontrado com os filtros informados.</p>
      )}
      {!loading && imoveis.length > 0 && (
        <div className="imovel-grid">
          {imoveis.map((i) => (
            <ImovelCard key={i.id} imovel={i} />
          ))}
        </div>
      )}
    </>
  );
}
