/**
 * Importação de imóveis via CSV.
 * Oferece modelo com colunas fixas e mapeamento flexível de nomes de colunas.
 */

export type ImovelCsvRow = {
  tipo?: string;
  codigo?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  valorVenda?: number;
  valorAluguel?: number;
  status?: string;
  descricao?: string;
  qtdQuartos?: number;
  qtdBanheiros?: number;
  area?: number;
};

/** Colunas do modelo oficial (para download). */
export const COLUNAS_MODELO = [
  'tipo',
  'codigo',
  'rua',
  'numero',
  'bairro',
  'cidade',
  'cep',
  'valorVenda',
  'valorAluguel',
  'status',
  'descricao',
  'qtdQuartos',
  'qtdBanheiros',
  'area',
] as const;

/** Gera o conteúdo do CSV modelo com cabeçalho e uma linha de exemplo. */
export function gerarModeloCsv(): string {
  const header = COLUNAS_MODELO.join(';');
  const exemplo =
    'apartamento;APT-001;Rua das Flores;100;Centro;São Paulo;01310-100;500000;2500;disponivel;Ótimo imóvel;3;2;85';
  return [header, exemplo].join('\n');
}

/** Mapeamento: variações de nome de coluna (normalizado) -> campo do imóvel. */
const MAPEAMENTO_COLUNAS: Record<string, keyof ImovelCsvRow> = {
  tipo: 'tipo',
  type: 'tipo',
  codigo: 'codigo',
  cod: 'codigo',
  código: 'codigo',
  rua: 'rua',
  logradouro: 'rua',
  endereco: 'rua',
  endereço: 'rua',
  numero: 'numero',
  número: 'numero',
  num: 'numero',
  number: 'numero',
  bairro: 'bairro',
  cidade: 'cidade',
  localidade: 'cidade',
  city: 'cidade',
  cep: 'cep',
  valorvenda: 'valorVenda',
  valor_venda: 'valorVenda',
  'valor venda': 'valorVenda',
  venda: 'valorVenda',
  precovenda: 'valorVenda',
  valoraluguel: 'valorAluguel',
  valor_aluguel: 'valorAluguel',
  'valor aluguel': 'valorAluguel',
  aluguel: 'valorAluguel',
  status: 'status',
  descricao: 'descricao',
  descrição: 'descricao',
  observacoes: 'descricao',
  observações: 'descricao',
  qtdquartos: 'qtdQuartos',
  quartos: 'qtdQuartos',
  quarto: 'qtdQuartos',
  qtd_quartos: 'qtdQuartos',
  qtdbanheiros: 'qtdBanheiros',
  banheiros: 'qtdBanheiros',
  banheiro: 'qtdBanheiros',
  qtd_banheiros: 'qtdBanheiros',
  area: 'area',
  área: 'area',
  area_m2: 'area',
  'area m2': 'area',
  m2: 'area',
  metragem: 'area',
};

function normalizarNomeColuna(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Separa campos de uma linha CSV (suporta ; ou , e campos entre aspas). */
function parseCsvLine(line: string, separator: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && c === separator) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

/** Detecta separador (; ou ,) pela primeira linha. */
function detectarSeparador(firstLine: string): string {
  const semicolon = (firstLine.match(/;/g) ?? []).length;
  const comma = (firstLine.match(/,/g) ?? []).length;
  return semicolon >= comma ? ';' : ',';
}

/** Converte valor para número quando o campo é numérico. */
function toNumber(val: string | undefined): number | undefined {
  if (val == null || val === '') return undefined;
  const s = String(val).replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isNaN(n) ? undefined : n;
}

/** Valores aceitos para tipo e status (normalizados). */
const TIPOS_VALIDOS = new Set(['apartamento', 'casa', 'terreno', 'comercial']);
const STATUS_VALIDOS = new Set(['disponivel', 'indisponivel', 'reservado', 'vendido', 'alugado']);

export type ResultadoParse = {
  rows: ImovelCsvRow[];
  headers: string[];
  mapaColunas: Record<number, keyof ImovelCsvRow>; // índice da coluna -> campo
  errosLinha: Array<{ linha: number; mensagem: string }>;
};

/**
 * Parse do CSV: primeira linha = cabeçalho.
 * Detecta separador, mapeia colunas por nomes flexíveis e retorna linhas normalizadas.
 */
export function parseCsvImoveis(csvText: string): ResultadoParse {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errosLinha: Array<{ linha: number; mensagem: string }> = [];
  const rows: ImovelCsvRow[] = [];
  const mapaColunas: Record<number, keyof ImovelCsvRow> = {};

  if (lines.length === 0) {
    return { rows: [], headers: [], mapaColunas: {}, errosLinha: [{ linha: 1, mensagem: 'Arquivo vazio' }] };
  }

  const separator = detectarSeparador(lines[0]);
  const headerCells = parseCsvLine(lines[0], separator);
  const headers = headerCells;

  headerCells.forEach((h, idx) => {
    const norm = normalizarNomeColuna(h);
    const campo = MAPEAMENTO_COLUNAS[norm];
    if (campo) mapaColunas[idx] = campo;
  });

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], separator);
    const row: Record<string, string | number | undefined> = {};
    for (let c = 0; c < cells.length; c++) {
      const campo = mapaColunas[c];
      if (campo) row[campo] = cells[c];
    }

    const tipo = String(row.tipo ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') || 'apartamento';
    const status = String(row.status ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') || 'disponivel';

    if (row.tipo !== undefined && row.tipo !== '' && !TIPOS_VALIDOS.has(tipo)) {
      errosLinha.push({ linha: i + 1, mensagem: `Tipo inválido: ${row.tipo}. Use: apartamento, casa, terreno, comercial` });
    }
    if (row.status !== undefined && row.status !== '' && !STATUS_VALIDOS.has(status)) {
      errosLinha.push({ linha: i + 1, mensagem: `Status inválido: ${row.status}. Use: disponivel, indisponivel, reservado, vendido, alugado` });
    }

    const imovel: ImovelCsvRow = {
      tipo: tipo || 'apartamento',
      codigo: row.codigo != null && String(row.codigo).trim() !== '' ? String(row.codigo).trim() : undefined,
      rua: row.rua != null && String(row.rua).trim() !== '' ? String(row.rua).trim() : undefined,
      numero: row.numero != null && String(row.numero).trim() !== '' ? String(row.numero).trim() : undefined,
      bairro: row.bairro != null && String(row.bairro).trim() !== '' ? String(row.bairro).trim() : undefined,
      cidade: row.cidade != null && String(row.cidade).trim() !== '' ? String(row.cidade).trim() : undefined,
      cep: row.cep != null && String(row.cep).trim() !== '' ? String(row.cep).trim().replace(/\D/g, '').length === 8 ? String(row.cep).trim() : undefined : undefined,
      valorVenda: toNumber(String(row.valorVenda ?? '')),
      valorAluguel: toNumber(String(row.valorAluguel ?? '')),
      status: status || 'disponivel',
      descricao: row.descricao != null && String(row.descricao).trim() !== '' ? String(row.descricao).trim() : undefined,
      qtdQuartos: toNumber(String(row.qtdQuartos ?? '')) ?? undefined,
      qtdBanheiros: toNumber(String(row.qtdBanheiros ?? '')) ?? undefined,
      area: toNumber(String(row.area ?? '')) ?? undefined,
    };

    rows.push(imovel);
  }

  return { rows, headers, mapaColunas, errosLinha };
}

/** Converte ImovelCsvRow para o payload da API (Partial<Imovel>). */
export function rowToPayload(row: ImovelCsvRow): Partial<ImovelCsvRow> & { tipo: string } {
  return {
    tipo: row.tipo ?? 'apartamento',
    codigo: row.codigo ?? undefined,
    rua: row.rua ?? undefined,
    numero: row.numero ?? undefined,
    bairro: row.bairro ?? undefined,
    cidade: row.cidade ?? undefined,
    cep: row.cep ?? undefined,
    valorVenda: row.valorVenda ?? undefined,
    valorAluguel: row.valorAluguel ?? undefined,
    status: row.status ?? 'disponivel',
    descricao: row.descricao ?? undefined,
    qtdQuartos: row.qtdQuartos ?? undefined,
    qtdBanheiros: row.qtdBanheiros ?? undefined,
    area: row.area ?? undefined,
  };
}
