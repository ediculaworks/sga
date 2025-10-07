/**
 * Utilitários de validação
 */

/**
 * Valida CPF brasileiro
 */
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Valida placa de veículo (formato brasileiro)
 */
export function validarPlaca(placa: string): boolean {
  // Remove espaços e converte para maiúscula
  placa = placa.replace(/\s/g, '').toUpperCase();

  // Formato antigo: AAA-0000
  const formatoAntigo = /^[A-Z]{3}-?\d{4}$/;
  // Formato Mercosul: AAA0A00
  const formatoMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return formatoAntigo.test(placa) || formatoMercosul.test(placa);
}

/**
 * Valida CNH (Carteira Nacional de Habilitação)
 */
export function validarCNH(cnh: string): boolean {
  cnh = cnh.replace(/[^\d]/g, '');

  if (cnh.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cnh)) return false;

  let sum = 0;
  let dsc = 0;

  for (let i = 0, j = 9; i < 9; i++, j--) {
    sum += parseInt(cnh.charAt(i)) * j;
  }

  let digit1 = sum % 11;
  if (digit1 >= 10) digit1 = 0;

  sum = 0;
  for (let i = 0, j = 1; i < 9; i++, j++) {
    sum += parseInt(cnh.charAt(i)) * j;
  }

  const digit2 = sum % 11;
  const dv = digit2 >= 10 ? 0 : digit2;

  if (parseInt(cnh.charAt(9)) !== digit1 || parseInt(cnh.charAt(10)) !== dv) {
    return false;
  }

  return true;
}

/**
 * Valida email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro
 */
export function validarTelefone(telefone: string): boolean {
  const telefoneNumeros = telefone.replace(/[^\d]/g, '');

  // Aceita: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  return telefoneNumeros.length === 10 || telefoneNumeros.length === 11;
}

/**
 * Valida se é maior de idade
 */
export function validarMaiorIdade(dataNascimento: string): boolean {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    return idade - 1 >= 18;
  }

  return idade >= 18;
}

/**
 * Valida senha forte
 */
export function validarSenhaForte(senha: string): {
  valida: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  if (senha.length < 8) {
    erros.push('A senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(senha)) {
    erros.push('A senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    erros.push('A senha deve conter pelo menos um caractere especial');
  }

  return {
    valida: erros.length === 0,
    erros
  };
}
