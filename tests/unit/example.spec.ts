import { mount } from '@vue/test-utils'
import HomePage from '@/views/HomePage.vue'
import ProductsPage from '@/views/ProductsPage.vue'
import { describe, expect, test } from 'vitest'

const ionicCompilerOptions = {
  isCustomElement: (tag: string) => tag.startsWith('ion-')
}

describe('HomePage.vue', () => {
  test('renders the shop landing content', () => {
    const wrapper = mount(HomePage, {
      global: {
        compilerOptions: ionicCompilerOptions
      }
    })
    expect(wrapper.text()).toContain('Welcome!')
    expect(wrapper.text()).toContain('Browse Products')
  })
})

describe('ProductsPage.vue', () => {
  test('shows the add product form', () => {
    const wrapper = mount(ProductsPage, {
      global: {
        compilerOptions: ionicCompilerOptions
      }
    })
    expect(wrapper.text()).toContain('Add Product')
    expect(wrapper.text()).toContain('Product name')
  })
})
