<template>
  <slot />
</template>

<script setup lang="ts">
import { useTheme } from './useTheme'

useTheme()
</script>
