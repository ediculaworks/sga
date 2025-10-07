/**
 * Utilitários de formatação
 */

/**
 * Formata CPF (000.000.000-00)
 */
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/[^\d]/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone brasileiro
 */
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/[^\d]/g, '');

  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
}

/**
 * Formata placa de veículo
 */
export function formatarPlaca(placa: string): string {
  const limpa = placa.replace(/[^\dA-Za-z]/g, '').toUpperCase();

  // Formato Mercosul: AAA0A00
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(limpa)) {
    return limpa.replace(/([A-Z]{3})(\d[A-Z]\d{2})/, '$1-$2');
  }

  // Formato antigo: AAA0000
  if (/^[A-Z]{3}\d{4}$/.test(limpa)) {
    return limpa.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }

  return placa;
}

/**
 * Formata CNH
 */
export function formatarCNH(cnh: string): string {
  const numeros = cnh.replace(/[^\d]/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata valor monetário em Real (R$)
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata data no padrão brasileiro (DD/MM/YYYY)
 */
export function formatarData(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dataObj);
}

/**
 * Formata data e hora no padrão brasileiro (DD/MM/YYYY HH:mm)
 */
export function formatarDataHora(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dataObj);
}

/**
 * Formata hora (HH:mm)
 */
export function formatarHora(hora: string): string {
  if (hora.includes(':')) {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  }
  return hora;
}

/**
 * Formata duração em minutos para formato legível
 */
export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (horas === 0) {
    return `${mins}min`;
  }

  if (mins === 0) {
    return `${horas}h`;
  }

  return `${horas}h ${mins}min`;
}

/**
 * Formata kilometragem
 */
export function formatarKilometragem(km: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(km) + ' km';
}

/**
 * Formata número de ocorrência
 */
export function formatarNumeroOcorrencia(numero: string): string {
  // OC202501-0001 -> OC 2025/01-0001
  if (/^OC\d{6}\d{4}$/.test(numero)) {
    return numero.replace(/^OC(\d{4})(\d{2})(\d{4})$/, 'OC $1/$2-$3');
  }
  return numero;
}

/**
 * Converte data do formato brasileiro para ISO (YYYY-MM-DD)
 */
export function dataParaISO(data: string): string {
  // DD/MM/YYYY -> YYYY-MM-DD
  const partes = data.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return data;
}

/**
 * Converte data do formato ISO para brasileiro (DD/MM/YYYY)
 */
export function dataISOParaBR(data: string): string {
  // YYYY-MM-DD -> DD/MM/YYYY
  const partes = data.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return data;
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

/**
 * Trunca texto com reticências
 */
export function truncarTexto(texto: string, tamanho: number): string {
  if (texto.length <= tamanho) return texto;
  return texto.substring(0, tamanho) + '...';
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizarPalavras(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}
