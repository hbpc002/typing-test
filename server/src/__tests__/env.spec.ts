// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { requireEnv } from '../env'

describe('requireEnv', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    for (const k of Object.keys(process.env)) {
      if (k !== 'PATH' && k !== 'HOME' && k !== 'NODE_ENV' && !k.startsWith('npm_')) {
        delete process.env[k]
      }
    }
  })

  afterEach(() => {
    for (const k of Object.keys(process.env)) delete process.env[k]
    Object.assign(process.env, originalEnv)
    vi.restoreAllMocks()
  })

  it('环境变量存在时返回其值', () => {
    process.env.TEST_VAR = 'hello'
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('should not exit')
    }) as never)
    expect(requireEnv('TEST_VAR')).toBe('hello')
    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('环境变量不存在时打印错误并退出', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((((code?: number) => {
      throw new Error(`exit_${code}`)
    }) as never))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => requireEnv('MISSING_VAR')).toThrow(/exit_1/)
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errSpy.mock.calls[0][0]).toContain('Missing required environment variable: MISSING_VAR')
  })

  it('环境变量为空字符串时也视为缺失', () => {
    process.env.EMPTY_VAR = '   '
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((((code?: number) => {
      throw new Error(`exit_${code}`)
    }) as never))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => requireEnv('EMPTY_VAR')).toThrow(/exit_1/)
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('长度小于 minLength 时打印错误并退出', () => {
    process.env.SHORT_VAR = 'abc'
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((((code?: number) => {
      throw new Error(`exit_${code}`)
    }) as never))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => requireEnv('SHORT_VAR', { minLength: 8 })).toThrow(/exit_1/)
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errSpy.mock.calls[0][0]).toContain('must be at least 8 characters')
  })

  it('长度等于 minLength 时合法', () => {
    process.env.LONG_VAR = '12345678'
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('should not exit')
    }) as never)

    expect(requireEnv('LONG_VAR', { minLength: 8 })).toBe('12345678')
    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('长度大于 minLength 时合法', () => {
    process.env.LONG_VAR = 'this_is_a_long_enough_value'
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('should not exit')
    }) as never)

    expect(requireEnv('LONG_VAR', { minLength: 8 })).toBe('this_is_a_long_enough_value')
    expect(exitSpy).not.toHaveBeenCalled()
  })
})
