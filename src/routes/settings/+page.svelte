<script lang="ts">
    import Input from "@/components/ui/input/input.svelte";
    import Label from "@/components/ui/label/label.svelte";
    import { _$ } from "@/store.svelte";
    import { KeyRoundIcon } from "lucide-svelte";
</script>

<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-2">
    <div class="flex flex-col gap-4">
        <div class="text-sm text-muted-foreground italic">This is a prototype to help for demos.</div>
        <div class="text-sm text-muted-foreground italic mb-4">For question you can ask @Nico Javelaud on Slack.</div>
        <div class="flex gap-2">
            <KeyRoundIcon class="place-self-center ml-2" size={24}   />
            <Label for="name" class="font-bold">Paste your API Key here</Label>
        </div>
        <Input bind:value={_$.api_key} onchange={()=>localStorage.setItem("api_key", _$.api_key)} type="password" placeholder="API Key" />
    </div>
</main>
