<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import NestedField from "./nested-field.svelte";

  export let field: string;
  export let value: any;
</script>

{#if typeof value === "string"}
  <div class="grid gap-3">
    <Label for={field}>{field}</Label>
    <Input id={field} value={value} type="text" placeholder="" />
  </div>
{:else if typeof value === "boolean"}
  <div class="grid gap-3">
    <Label for={field}>{field}</Label>
    <Checkbox checked={value} id={field} placeholder="" />
  </div>
{:else if typeof value === "number"}
  <div class="grid gap-3">
    <Label for={field}>{field}</Label>
    <Input id={field} value={value} type="number" placeholder="" />
  </div>
{:else if Array.isArray(value)}
  <fieldset class="grid gap-6 rounded-lg border p-4">
    <legend class="-ml-1 px-1 text-sm font-medium">{field}</legend>
    {#each value as item, index}
      {#if typeof item === "object"}
        <NestedField field={`Entry ${index + 1}`} value={item} />
      {:else}
        <div class="flex items-center gap-2">
          <Input id={field} value={item} type="text" placeholder="" />
        </div>
      {/if}
    {/each}
  </fieldset>
{:else if typeof value === "object"}
  <fieldset class="grid gap-6 rounded-lg border p-4">
    <legend class="-ml-1 px-1 text-sm font-medium capitalize">{field}</legend>
    {#each Object.entries(value) as [subfield, subvalue]}
      <NestedField field={subfield} value={subvalue} />
    {/each}
  </fieldset>
{/if}