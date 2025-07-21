<template>
  <div class="techheader-component">
    <h2>TechHeader for technology</h2>
    <p>This is a technology-specific TechHeader component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TechHeader',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.techheader-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
