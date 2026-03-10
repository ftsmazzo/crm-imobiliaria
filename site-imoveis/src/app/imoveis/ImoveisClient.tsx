'use client';

import { useEffect, useState, useMemo } from 'react';
import { getImoveis } from '@/lib/api';
import type { ImovelPublic } from '@/lib/api';
import ImovelCard from '@/components/ImovelCard';

const TIPOS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'casa_condominio', label: 'Casa em condomínio' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'terreno_condominio', label: 'Terreno em condomínio' },
  { value: 'comercial', label: 'Comercial' },
];

type Props = {
  imoveisIniciais: ImovelPublic[];
  initialCidade?: string;
  initialBairro?: string;
  initialTipo?: string;
  initialFinalidade?: string;
};

export default function ImoveisClient({
  imoveisIniciais,
  initialCidade = '',
  initialBairro = '',
  initialTipo = '',
  initialFinalidade = '',
}: Props) {
  const [imoveis, setImoveis] = useState<ImovelPublic[]>(imoveisIniciais);
  const [loading, setLoading] = useState(false);
  const [cidade, setCidade] = useState(initialCidade);
  const [bairro, setBairro] = useState(initialBairro);
  const [tipo, setTipo] = useState(initialTipo);
  const [finalidade, setFinalidade] = useState(initialFinalidade);

  useEffect(() => {
    setCidade(initialCidade);
    setBairro(initialBairro);
    setTipo(initialTipo);
    setFinalidade(initialFinalidade);
  }, [initialCidade, initialBairro, initialTipo, initialFinalidade]);

  useEffect(() => {
    const temFiltro = !!(cidade || bairro || tipo);
    if (temFiltro) setLoading(true);
    getImoveis({
      status: 'disponivel',
      cidade: cidade || undefined,
      bairro: bairro || undefined,
      tipo: tipo || undefined,
    })
      .then(setImoveis)
      .finally(() => setLoading(false));
  }, [cidade, bairro, tipo]);

  const imoveisFiltrados = useMemo(() => {
    if (finalidade === 'venda') return imoveis.filter((i) => i.valorVenda);
    if (finalidade === 'aluguel') return imoveis.filter((i) => i.valorAluguel);
    return imoveis;
  }, [imoveis, finalidade]);

  return (
    <>
      <div className="filtros-portal">
        <div className="form-group">
          <label htmlFor="filtro-cidade">Cidade</label>
          <input
            id="filtro-cidade"
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex: São Paulo"
          />
        </div>
        <div className="form-group">
          <label htmlFor="filtro-bairro">Bairro</label>
          <input
            id="filtro-bairro"
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Ex: Centro"
          />
        </div>
        <div className="form-group">
          <label htmlFor="filtro-tipo">Tipo</label>
          <select id="filtro-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t.value || 'all'} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="filtro-finalidade">Finalidade</label>
          <select id="filtro-finalidade" value={finalidade} onChange={(e) => setFinalidade(e.target.value)}>
            <option value="">Todos</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Locação</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: '80px' }}>
          <label>&nbsp;</label>
          <span style={{ fontSize: '0.875rem', color: 'var(--site-muted)' }}>
            {imoveisFiltrados.length} imóvel(is)
          </span>
        </div>
      </div>

      {loading && <p className="imoveis-loading">Buscando…</p>}
      {!loading && imoveisFiltrados.length === 0 && (
        <p className="imoveis-empty-msg">Nenhum imóvel encontrado com os filtros informados.</p>
      )}
      {!loading && imoveisFiltrados.length > 0 && (
        <div className="imovel-grid">
          {imoveisFiltrados.map((i) => (
            <ImovelCard key={i.id} imovel={i} />
          ))}
        </div>
      )}
    </>
  );
}
