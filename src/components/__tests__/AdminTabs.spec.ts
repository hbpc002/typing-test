import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import AdminTabs from '../AdminTabs.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/articles', name: 'AdminArticles', component: { template: '<div />' } },
      { path: '/admin/scores', name: 'AdminScores', component: { template: '<div />' } }
    ]
  })
}

describe('AdminTabs', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('渲染两个 tab：文章管理、成绩查询', async () => {
    const router = makeRouter()
    router.push({ name: 'AdminArticles' })
    await router.isReady()

    const wrapper = mount(AdminTabs, {
      global: { plugins: [router] }
    })
    await flushPromises()

    const items = wrapper.findAll('.y-admin-tabs__item')
    expect(items.length).toBe(2)
    expect(items[0].text()).toBe('文章管理')
    expect(items[1].text()).toBe('成绩查询')
  })

  it('当前路由为 AdminArticles 时，文章管理 tab 处于激活态', async () => {
    const router = makeRouter()
    router.push({ name: 'AdminArticles' })
    await router.isReady()

    const wrapper = mount(AdminTabs, {
      global: { plugins: [router] }
    })
    await flushPromises()

    const items = wrapper.findAll('.y-admin-tabs__item')
    expect(items[0].classes()).toContain('y-admin-tabs__item--active')
    expect(items[1].classes()).not.toContain('y-admin-tabs__item--active')
  })

  it('当前路由为 AdminScores 时，成绩查询 tab 处于激活态', async () => {
    const router = makeRouter()
    router.push({ name: 'AdminScores' })
    await router.isReady()

    const wrapper = mount(AdminTabs, {
      global: { plugins: [router] }
    })
    await flushPromises()

    const items = wrapper.findAll('.y-admin-tabs__item')
    expect(items[0].classes()).not.toContain('y-admin-tabs__item--active')
    expect(items[1].classes()).toContain('y-admin-tabs__item--active')
  })

  it('两个 tab 都是 router-link，点击会切换路由', async () => {
    const router = makeRouter()
    router.push({ name: 'AdminArticles' })
    await router.isReady()

    const wrapper = mount(AdminTabs, {
      global: { plugins: [router] }
    })
    await flushPromises()

    const items = wrapper.findAll('.y-admin-tabs__item')
    expect(items[0].element.tagName).toBe('A')
    expect(items[1].element.tagName).toBe('A')

    await items[1].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('AdminScores')
    const updatedItems = wrapper.findAll('.y-admin-tabs__item')
    expect(updatedItems[1].classes()).toContain('y-admin-tabs__item--active')
  })
})
