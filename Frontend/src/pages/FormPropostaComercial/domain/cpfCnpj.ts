type DocumentType = 'cpf' | 'cnpj'

type DocumentValidation = DocumentType | 'invalid' | 'empty'

const CPF_LENGTH = 11
const CNPJ_LENGTH = 14

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function detectDocumentType(value: string): DocumentType | null {
  const digits = onlyDigits(value)

  if (digits.length === 0) {
    return null
  }

  return digits.length <= CPF_LENGTH ? 'cpf' : 'cnpj'
}

function formatCpf(digits: string): string {
  const limited = digits.slice(0, CPF_LENGTH)

  return limited
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function formatCnpj(digits: string): string {
  const limited = digits.slice(0, CNPJ_LENGTH)

  return limited
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value)

  return detectDocumentType(digits) === 'cnpj' ? formatCnpj(digits) : formatCpf(digits)
}

function hasRepeatedDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits)
}

function isValidCpf(digits: string): boolean {
  if (digits.length !== CPF_LENGTH || hasRepeatedDigits(digits)) {
    return false
  }

  const numbers = digits.split('').map(Number)

  for (let checkDigit = 9; checkDigit < CPF_LENGTH; checkDigit += 1) {
    let sum = 0
    for (let position = 0; position < checkDigit; position += 1) {
      sum += numbers[position] * (checkDigit + 1 - position)
    }
    const remainder = (sum * 10) % 11 % 10
    if (remainder !== numbers[checkDigit]) {
      return false
    }
  }

  return true
}

function isValidCnpj(digits: string): boolean {
  if (digits.length !== CNPJ_LENGTH || hasRepeatedDigits(digits)) {
    return false
  }

  const numbers = digits.split('').map(Number)
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondWeights = [6, ...firstWeights]

  for (const weights of [firstWeights, secondWeights]) {
    const offset = weights.length
    const sum = weights.reduce((acc, weight, index) => acc + numbers[index] * weight, 0)
    const remainder = sum % 11
    const expected = remainder < 2 ? 0 : 11 - remainder
    if (expected !== numbers[offset]) {
      return false
    }
  }

  return true
}

function validateCpfCnpj(value: string): DocumentValidation {
  const digits = onlyDigits(value)

  if (digits.length === 0) {
    return 'empty'
  }

  if (digits.length === CPF_LENGTH && isValidCpf(digits)) {
    return 'cpf'
  }

  if (digits.length === CNPJ_LENGTH && isValidCnpj(digits)) {
    return 'cnpj'
  }

  return 'invalid'
}

export {
  detectDocumentType,
  formatCpfCnpj,
  isValidCnpj,
  isValidCpf,
  onlyDigits,
  validateCpfCnpj,
}
export type { DocumentType, DocumentValidation }
