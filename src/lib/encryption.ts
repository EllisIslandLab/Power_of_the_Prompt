import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    'CREDENTIALS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
    'Generate one with: openssl rand -hex 32'
  )
}

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

/**
 * Encrypt sensitive data (API keys, tokens, etc.)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Return IV:encrypted format
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypt sensitive data
 */
export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':')

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )

  let decrypted = decipher.update(encrypted, undefined, 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Hash data for comparison (one-way, cannot decrypt)
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * Generate a secure random string
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}
