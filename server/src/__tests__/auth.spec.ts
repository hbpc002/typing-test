// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest'

interface AuthExports {
  validateAdminPassword: (password: string) => boolean
  signToken: () => string
  verifyToken: (token: string) => boolean
}

const hoisted = vi.hoisted(async (): Promise<AuthExports> => {
  process.env.ADMIN_PASSWORD = 'test-admin-password'
  process.env.JWT_SECRET = 'a'.repeat(40)
  const auth = await import('../auth')
  return {
    validateAdminPassword: auth.validateAdminPassword,
    signToken: auth.signToken,
    verifyToken: auth.verifyToken
  }
})

let auth!: AuthExports
let jwtModule: typeof import('jsonwebtoken')

beforeAll(async () => {
  auth = await hoisted
  jwtModule = await import('jsonwebtoken')
})

describe('auth module', () => {
  it('validateAdminPassword: 正确密码返回 true', () => {
    expect(auth.validateAdminPassword('test-admin-password')).toBe(true)
  })

  it('validateAdminPassword: 错误密码返回 false', () => {
    expect(auth.validateAdminPassword('wrong-password')).toBe(false)
    expect(auth.validateAdminPassword('')).toBe(false)
  })

  it('signToken 返回一个非空字符串', () => {
    const token = auth.signToken()
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
  })

  it('verifyToken 接受 signToken 签发的 token', () => {
    const token = auth.signToken()
    expect(auth.verifyToken(token)).toBe(true)
  })

  it('verifyToken 拒绝无效的 token', () => {
    expect(auth.verifyToken('invalid.token.here')).toBe(false)
    expect(auth.verifyToken('garbage')).toBe(false)
    expect(auth.verifyToken('')).toBe(false)
  })

  it('verifyToken 拒绝使用不同密钥签发的 token', () => {
    const otherToken = jwtModule.sign({ role: 'admin' }, 'a-different-secret-32-chars-long-xx', { expiresIn: '1h' })
    expect(auth.verifyToken(otherToken)).toBe(false)
  })
})
