<script lang="ts">
  import { goto } from "$app/navigation";
    import { onMount } from "svelte";
  onMount(async () => {
    await goto('settings');
  });
</script>
<h1 class="text-3xl font-bold underline">Redirecting to settings</h1>

