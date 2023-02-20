<template>
    <Suspense>
        <Robot></Robot>
    </Suspense>
</template>

<script>

  import Robot from "./components/Robot"

  export default {
    name: 'App',
    components: {Robot}
  }

</script>
