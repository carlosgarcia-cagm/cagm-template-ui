<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Icon from '@/components/atoms/Icon'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isError = ref(false)

function onSubmit() {
  isError.value = !isError.value
}
</script>

<template>
  <div class="split-login">
    <!-- Brand panel: decorative column that collapses into a compact top
         band on narrow viewports (see the media query below). -->
    <aside class="split-login__brand">
      <div class="split-login__brand-inner">
        <div class="split-login__brand-mark">
          <span class="split-login__brand-badge" aria-hidden="true">◆</span>
          <span class="split-login__brand-name">cagm</span>
        </div>

        <div class="split-login__brand-copy">
          <p class="split-login__headline">Build interfaces that feel inevitable.</p>
          <p class="split-login__lede">
            A batteries-included Vue template with tokens, components and layouts
            already wired together — start at the finish line, not the drawing board.
          </p>
        </div>

        <p class="split-login__copyright">© 2026 Cagm UI. All rights reserved.</p>
      </div>
    </aside>

    <!-- Form panel -->
    <main class="split-login__form-panel">
      <div class="split-login__form-wrap">
        <h1 class="split-login__title">Welcome back</h1>
        <p class="split-login__subtitle">Sign in to continue to your workspace.</p>

        <form class="split-login__form" @submit.prevent="onSubmit">
          <FormField
            v-model="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <div class="split-login__password-field">
            <FormField
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
            />
            <Button
              variant="ghost"
              size="sm"
              class="split-login__toggle"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <Icon :size="16">
                <svg v-if="showPassword" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z"
                    clip-rule="evenodd"
                  />
                  <path
                    d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z"
                  />
                </svg>
                <svg v-else viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path
                    fill-rule="evenodd"
                    d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </Icon>
            </Button>
          </div>

          <div class="split-login__options">
            <label class="split-login__remember">
              <input v-model="rememberMe" type="checkbox" class="split-login__checkbox" />
              Remember me
            </label>
            <Button variant="ghost" size="sm" @click.prevent>Forgot password?</Button>
          </div>

          <Badge v-if="isError" variant="negative" class="split-login__error-badge">
            Invalid credentials
          </Badge>

          <Button variant="primary" size="md" class="split-login__submit" @click="onSubmit">
            Sign in
          </Button>
        </form>

        <RouterLink to="/login" class="split-login__variant-link">
          View the card variant
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.split-login {
  display: grid;
  grid-template-columns: 48fr 52fr;
  min-height: 100vh;
}

/* ---- Brand panel ---- */
.split-login__brand {
  position: relative;
  overflow: hidden;
  display: flex;
  padding: clamp(2rem, 4vw, 3.5rem);
  background: color-mix(in srgb, var(--color-accent) 18%, var(--gray-900));
  color: var(--gray-50);
}

/* Soft accent glows — decorative only. */
.split-login__brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      120% 90% at 12% 0%,
      color-mix(in srgb, var(--color-accent) 70%, transparent) 0%,
      transparent 58%
    ),
    radial-gradient(
      90% 75% at 100% 100%,
      color-mix(in srgb, var(--color-accent) 45%, transparent) 0%,
      transparent 55%
    );
  opacity: 0.6;
  pointer-events: none;
}

.split-login__brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2.5rem;
  width: 100%;
}

.split-login__brand-mark {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.split-login__brand-badge {
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

.split-login__brand-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.split-login__headline {
  margin: 0 0 1rem;
  max-width: 18ch;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 2.8vw, 2.5rem);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.01em;
}

.split-login__lede {
  margin: 0;
  max-width: 38ch;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--gray-50) 72%, transparent);
}

.split-login__copyright {
  margin: 0;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--gray-50) 55%, transparent);
}

/* ---- Form panel ---- */
.split-login__form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: var(--color-surface);
  border-left: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
}

.split-login__form-wrap {
  width: 100%;
  max-width: 400px;
}

.split-login__title {
  margin: 0 0 0.375rem;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.split-login__subtitle {
  margin: 0 0 2rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

.split-login__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.split-login__password-field {
  position: relative;
}

.split-login__password-field :deep(input) {
  padding-right: 2.75rem;
}

.split-login__password-field .split-login__toggle {
  position: absolute;
  right: 0.3125rem;
  bottom: 0.3125rem;
  padding: 0.25rem;
  color: var(--color-text-muted);
  border-radius: var(--radius-button);
}

.split-login__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.split-login__remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.split-login__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-accent);
}

.split-login__error-badge {
  align-self: flex-start;
}

.split-login__submit {
  width: 100%;
}

.split-login__variant-link {
  display: block;
  width: fit-content;
  margin: 1.75rem auto 0;
  padding-bottom: 1px;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--color-text-muted) 40%, transparent);
}

.split-login__variant-link:hover {
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
}

/* ---- Responsive: stack the brand panel above the form ---- */
@media (max-width: 900px) {
  .split-login {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .split-login__brand {
    padding: 2rem 1.5rem 2.25rem;
  }

  .split-login__brand-inner {
    gap: 1.25rem;
  }

  .split-login__headline {
    max-width: none;
    font-size: 1.625rem;
  }

  .split-login__lede {
    max-width: 52ch;
  }

  .split-login__form-panel {
    padding: 2.75rem 1.5rem 3rem;
    border-left: none;
    border-top: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  }
}
</style>
