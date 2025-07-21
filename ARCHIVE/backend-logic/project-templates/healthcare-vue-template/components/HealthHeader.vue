<template>
  <div class="healthheader-component">
    <h2>HealthHeader for healthcare</h2>
    <p>This is a healthcare-specific HealthHeader component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HealthHeader',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.healthheader-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
