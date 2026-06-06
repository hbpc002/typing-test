import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WordInput from '../WordInput.vue'

vi.mock('@vueuse/core', () => ({
  useScroll: () => ({ y: vi.fn() })
}))

function waitForTick() {
  return new Promise(resolve => setTimeout(resolve, 50))
}

describe('WordInput IME composition handling', () => {
  const shortQuote = '你好'
  const longQuote = '你好世界'

  const mountComponent = async (strictMode = false, quote = longQuote) => {
    const wrapper = mount(WordInput, {
      props: {
        quote,
        isStrictMode: strictMode,
        showMask: false
      },
      attachTo: document.body
    })
    await waitForTick()
    return wrapper
  }

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('渲染 quote 字符', async () => {
    const wrapper = await mountComponent(false, shortQuote)
    const letters = wrapper.findAll('.y-word-input__quote .letter')
    expect(letters.length).toBe(2)
    expect(letters[0].text()).toBe('你')
    expect(letters[1].text()).toBe('好')
  })

  it('compositionEndEvent 后字符标记为已输入', async () => {
    const wrapper = await mountComponent(false, shortQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = '你好'
    inputArea.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    inputArea.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    await waitForTick()

    const letters = wrapper.findAll('.y-word-input__quote .letter')
    letters.forEach(letter => {
      expect(letter.classes()).toContain('is-input')
    })
  })

  it('严格模式下合成后不截断正确输入', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = '你好世界'
    inputArea.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    inputArea.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    await waitForTick()

    const letters = wrapper.findAll('.y-word-input__quote .letter')
    expect(letters.length).toBe(4)
    letters.forEach(letter => {
      expect(letter.classes()).toContain('is-input')
      expect(letter.classes()).not.toContain('is-wrong')
    })
  })

  it('严格模式下第二次合成也正常工作', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = '你好'
    inputArea.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    inputArea.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    await waitForTick()

    ;(inputArea.element as HTMLElement).innerText = '你好世界'
    inputArea.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    inputArea.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    await waitForTick()

    const letters = wrapper.findAll('.y-word-input__quote .letter')
    letters.forEach(letter => {
      expect(letter.classes()).toContain('is-input')
      expect(letter.classes()).not.toContain('is-wrong')
    })
  })

  it('严格模式下错误字符被标记', async () => {
    const wrapper = await mountComponent(true, shortQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = 'x'
    inputArea.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    inputArea.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    await waitForTick()

    const letter0 = wrapper.findAll('.y-word-input__quote .letter')[0]
    expect(letter0.classes()).toContain('is-input')
    expect(letter0.classes()).toContain('is-wrong')
  })

  it('严格模式下 IME 提交含错字时立即截断后续字符', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = 'xy'
    inputArea.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    inputArea.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))
    inputArea.element.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await waitForTick()

    expect((inputArea.element as HTMLElement).innerText).toBe('x')
  })

  it('严格模式下普通输入第二个错字后立即截断', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = 'xy'
    inputArea.element.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await waitForTick()

    expect((inputArea.element as HTMLElement).innerText).toBe('x')
  })

  it('严格模式下已有错字时 beforeinput(insertText) 调用 preventDefault', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    // 先制造一个错字
    ;(inputArea.element as HTMLElement).innerText = 'x'
    inputArea.element.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await waitForTick()

    const ev = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: 'y'
    })
    inputArea.element.dispatchEvent(ev)
    await waitForTick()

    expect(ev.defaultPrevented).toBe(true)
  })

  it('严格模式下已有错字时 beforeinput(insertCompositionText) 调用 preventDefault', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = 'x'
    inputArea.element.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await waitForTick()

    const ev = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertCompositionText',
      data: '你'
    })
    inputArea.element.dispatchEvent(ev)
    await waitForTick()

    expect(ev.defaultPrevented).toBe(true)
  })

  it('严格模式下无错字时 beforeinput 不被 preventDefault', async () => {
    const wrapper = await mountComponent(true, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    const ev = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: '你'
    })
    inputArea.element.dispatchEvent(ev)
    await waitForTick()

    expect(ev.defaultPrevented).toBe(false)
  })

  it('非严格模式下有错字时 beforeinput 也不被 preventDefault', async () => {
    const wrapper = await mountComponent(false, longQuote)
    const inputArea = wrapper.find('.y-word-input__input-area')

    ;(inputArea.element as HTMLElement).innerText = 'xy'
    inputArea.element.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await waitForTick()

    const ev = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: 'a'
    })
    inputArea.element.dispatchEvent(ev)
    await waitForTick()

    expect(ev.defaultPrevented).toBe(false)
  })
})
