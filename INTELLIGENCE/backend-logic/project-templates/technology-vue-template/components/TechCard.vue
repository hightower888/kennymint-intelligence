<template>
  <div class="techcard-component">
    <h2>TechCard for technology</h2>
    <p>This is a technology-specific TechCard component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TechCard',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.techcard-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
