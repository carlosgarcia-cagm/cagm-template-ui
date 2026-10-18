<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import type { Component } from 'vue'
import AuthLayout from '@/components/templates/AuthLayout.vue'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

type LoginLayout = 'card' | 'split'

// Demo-only toggle between the two login variants (not part of the form).
const layout = ref<LoginLayout>('split')

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isError = ref(false)

function onSubmit() {
  isError.value = !isError.value
}

/**
 * Structural shell for the split variant. The shared form arrives through the
 * default slot, so both variants keep a single source of form markup/logic.
 */
const SplitShell = defineComponent({
  name: 'LoginSplitShell',
  props: {
    title: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'login-split' }, [
        h('aside', { class: 'login-split__brand' }, [
          h('span', { class: 'login-split__mark' }, [
            h('span', { class: 'login-split__mark-glyph', 'aria-hidden': 'true' }, '◆'),
            'cagm-template-ui',
          ]),
          h('div', { class: 'login-split__brand-copy' }, [
            h('p', { class: 'login-split__headline' }, 'Todo tu contenido, en un solo lugar.'),
            h(
              'p',
              { class: 'login-split__lede' },
              'Componentes accesibles, tokens de diseño y plantillas listas para producción en una única base.',
            ),
          ]),
          h('p', { class: 'login-split__copyright' }, '© 2026 cagm-template-ui'),
        ]),
        h('section', { class: 'login-split__panel' }, [
          h('div', { class: 'login-split__card' }, [
            props.title ? h('h1', { class: 'login-split__title' }, props.title) : null,
            ...(slots.default?.() ?? []),
          ]),
        ]),
      ])
  },
})

const activeShell = computed<Component>(() =>
  layout.value === 'split' ? SplitShell : AuthLayout,
)
</script>

<template>
  <div class="login-view">
    <!-- Demo-only layout switch (mirrors how the Playground demos variants). -->
    <div class="login-view__demo-toggle" role="group" aria-label="Login layout (demo)">
      <Button
        size="sm"
        :variant="layout === 'card' ? 'primary' : 'ghost'"
        :aria-pressed="layout === 'card'"
        @click="layout = 'card'"
      >
        Card
      </Button>
      <Button
        size="sm"
        :variant="layout === 'split' ? 'primary' : 'ghost'"
        :aria-pressed="layout === 'split'"
        @click="layout = 'split'"
      >
        Split
      </Button>
    </div>

    <!-- Shared form: rendered once, used by both layout shells. -->
    <component :is="activeShell" title="Sign in">
      <!-- Card variant only: logo mark sits directly below the "Sign in" heading. -->
      <div v-if="layout === 'card'" class="login-view__mark">
        <span class="login-view__mark-badge" aria-hidden="true">◆</span>
        <span class="login-view__mark-name">cagm</span>
      </div>

      <form class="login-form" @submit.prevent="onSubmit">
        <FormField
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
        />
        <FormField
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
        />

        <label class="login-form__remember">
          <input v-model="rememberMe" type="checkbox" class="login-form__checkbox" />
          Remember me
        </label>

        <Badge v-if="isError" variant="negative" class="login-form__error-badge">
          Invalid credentials
        </Badge>

        <Button variant="primary" size="md" class="login-form__submit" @click="onSubmit">
          Sign in
        </Button>

        <Button variant="ghost" size="sm" class="login-form__forgot" @click.prevent>
          Forgot password?
        </Button>
      </form>
    </component>
  </div>
</template>

<style scoped>
.login-view {
  position: relative;
}

.login-view__demo-toggle {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: var(--z-dropdown);
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: var(--surface-border-width) solid var(--surface-border-color);
  border-radius: calc(var(--radius-button) + 0.25rem);
  background: color-mix(in srgb, var(--surface-tonal-bg) 88%, transparent);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(6px);
}

/* ---- Card variant: logo mark (rendered in the AuthLayout slot, under the title) ---- */
.login-view__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  margin: 0 0 1.5rem;
}

.login-view__mark-badge {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-button);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1;
}

.login-view__mark-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* ---- Split variant (structural shell rendered by SplitShell) ---- */
.login-split {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  min-height: 100vh;
}

.login-split :deep(.login-split__brand) {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2.5rem;
  padding: clamp(2rem, 4vw, 3.5rem);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.login-split :deep(.login-split__mark) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.login-split :deep(.login-split__mark-glyph) {
  font-size: 0.75rem;
  line-height: 1;
}

.login-split :deep(.login-split__brand-copy) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-split :deep(.login-split__headline) {
  margin: 0;
  max-width: 20ch;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 2.8vw, 2.5rem);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.01em;
}

.login-split :deep(.login-split__lede) {
  margin: 0;
  max-width: 38ch;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-on-accent) 78%, transparent);
}

.login-split :deep(.login-split__copyright) {
  margin: 0;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--color-on-accent) 65%, transparent);
}

.login-split :deep(.login-split__panel) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: var(--color-bg);
  border-left: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
}

.login-split :deep(.login-split__card) {
  width: 100%;
  max-width: 400px;
}

.login-split :deep(.login-split__title) {
  margin: 0 0 1.5rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* ---- Shared form ---- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.login-form__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-accent);
}

.login-form__error-badge {
  align-self: flex-start;
}

.login-form__submit {
  width: 100%;
}

.login-form__forgot {
  align-self: center;
}

/* ---- Responsive: stack the brand panel above the form ---- */
@media (max-width: 900px) {
  .login-split {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto;
    min-height: auto;
  }

  .login-split :deep(.login-split__brand) {
    gap: 1.5rem;
    padding: 2rem 1.5rem 2.25rem;
  }

  .login-split :deep(.login-split__headline) {
    max-width: none;
    font-size: 1.625rem;
  }

  .login-split :deep(.login-split__lede) {
    max-width: none;
  }

  .login-split :deep(.login-split__panel) {
    padding: 2.5rem 1.5rem 3rem;
    border-left: none;
    border-top: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  }
}
</style>
