<template>
  <div class="sample-component">
    <h2>Sample Component</h2>
    <p>This is a sample Vue component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SampleComponent',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.sample-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
