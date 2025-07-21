<template>
  <div class="healthcard-component">
    <h2>HealthCard for healthcare</h2>
    <p>This is a healthcare-specific HealthCard component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HealthCard',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.healthcard-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
