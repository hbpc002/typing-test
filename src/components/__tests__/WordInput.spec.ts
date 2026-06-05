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
})
