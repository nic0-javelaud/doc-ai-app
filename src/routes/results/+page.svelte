<script lang="ts">
    
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { ArrowLeft, ArrowRight, CornerDownLeft, Trash } from "lucide-svelte";
    import { _$ } from "@/store.svelte";
    import { marked } from "marked";
    import { toast } from "svelte-sonner";
    

    let ocr_pages = _$.results?.pages;
    let structured_data = _$.results? JSON.parse(_$.results.document_annotation) : null;

    const export_data = async () => {
        await navigator.clipboard.writeText(JSON.stringify(_$.results));
        console.log("Data copied to clipboard");
        toast.success("Data copied to clipboard");
    }
    const export_http = () => {
        console.log("Export HTTP");
    }
    // const export_python = () => {
    //     console.log("Export Python");
    // }
    
    
</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-3">
    <ScrollArea class="h-[800px] w-full">
        <div class="grid grid-cols-3 gap-4">
            <Button variant="outline" class="w-full mb-4 cursor-pointer" onclick={export_data}>Export data</Button>
            <Button disabled variant="outline" class="w-full mb-4">Export Curl</Button>
            <Button disabled variant="outline" class="w-full mb-4">Export Python</Button>
        </div>
        
        <Accordion.Root type="single">
            <Accordion.Item value="markdown">
                <Accordion.Trigger>Markdown</Accordion.Trigger>
                <Accordion.Content>
                    <div class="flex flex-col gap-6">
                        {#if ocr_pages}
                            {#each ocr_pages as page, index}
                            <fieldset class="grid gap-6 rounded-lg border p-4">
                                <legend class="-ml-1 px-1 text-sm font-medium capitalize"> Page {index + 1} / {ocr_pages.length} </legend>
                                <div>{@html marked.parse(page.markdown)}</div>
                            </fieldset>
                            {/each}
                        {/if}
                    </div>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="structured">
                <Accordion.Trigger>Structured data</Accordion.Trigger>
                <Accordion.Content>
                    <div class="flex flex-col gap-6">
                        {#if structured_data}
                        {#each Object.entries(structured_data) as [field, value]}
                            <!-- The field is a string - Show value in text input -->
                            {#if typeof value === "string"}
                                <div class="grid gap-3">
                                <Label for="top-p"><span class="capitalize">{field}</span></Label>
                                <Input id="top-p" value={value} type="text" placeholder="" />
                            </div>
                            <!-- The field is a boolean - Show value as checkbox -->
                            {:else if typeof value === "boolean"}
                                <div class="grid gap-3">
                                    <Label for="top-p capitalize">{field}</Label>
                                    <Checkbox checked={value} id="top-p" placeholder="" />
                                </div>
                            <!-- The field is a number - Show value in number input -->
                            {:else if typeof value === "number"}
                                <div class="grid gap-3">
                                    <Label for="top-p capitalize">{field}</Label>
                                    <Input id="top-p" value={value} type="number" placeholder="" />
                                </div>
                            <!-- The field is an Array - Check if array of values or objects -->
                            {:else if Array.isArray(value)}
                                <!-- The field is an Array of objects - Show value in text input -->
                                {#if typeof value[0] === "object"}
                                    <fieldset class="grid gap-6 rounded-lg border p-4">
                                        <legend class="-ml-1 px-1 text-sm font-medium capitalize"> {field} </legend>
                                        {#each value as entry,index}
                                            <fieldset class="grid gap-6 rounded-lg border p-4">
                                            <legend class="-ml-1 px-1 text-sm font-medium">Entry {index + 1} / {value.length} </legend>
                                                {#each Object.entries(entry) as [subfield, subvalue]}
                                                    {#if typeof subvalue === "string"}
                                                        <div class="grid gap-3">
                                                            <Label for="top-p">{subfield}</Label>
                                                            <Input id="top-p" value={subvalue} type="text" placeholder="" />
                                                        </div>
                                                    <!-- The field is a boolean - Show value as checkbox -->
                                                    {:else if typeof subvalue === "boolean"}
                                                        <div class="grid gap-3">
                                                            <Label for="top-p">{subfield}</Label>
                                                            <Checkbox checked={subvalue} id="top-p" placeholder="" />
                                                        </div>
                                                    <!-- The field is a number - Show value in number input -->
                                                    {:else if typeof subvalue === "number"}
                                                        <div class="grid gap-3">
                                                            <Label for="top-p">{subfield}</Label>
                                                            <Input id="top-p" value={subvalue} type="number" placeholder="" />
                                                        </div>
                                                    {/if}
                                                {/each}
                                            </fieldset>
                                        {/each}
                                    </fieldset>
                                {:else}
                                    <fieldset class="grid gap-6 rounded-lg border p-4">
                                        <legend class="-ml-1 px-1 text-sm font-medium"> {field} </legend>
                                        {#each value as item}
                                            <div class="flex items-center gap-2">
                                                <Input id="top-p" value={item} type="text" placeholder="" />
                                            </div>
                                        {/each}
                                    </fieldset>
                                {/if}
                            {/if}
                        {/each}
                        {/if}
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
        
    </ScrollArea>
    <ScrollArea
        class="bg-muted/50 relative flex h-[800px] min-h-[50vh] flex-col rounded-xl p-4 col-span-2"
        >
        
        {#if _$.document}
            <embed
                src={_$.document}
                type="application/pdf"
                height="100%"
                width="100%"
            />   
        {/if}
    </ScrollArea>
</main>