<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { ArrowLeft, ArrowRight, CornerDownLeft, FileUpIcon, Trash } from "lucide-svelte";
    import { marked } from "marked";

    import { _$ } from "$lib/store.svelte";

    let db = $state([]);
    let pdfs = $state({}); 
    let index = $state(0);
    let current = $derived(db[index]);

    $effect(async () => {
        if (_$.files.demo && _$.files.demo.length > 0) {
            const files = Object.values(_$.files.demo);
            // console.log(jsons);
            
            for (const file of files) {
                console.log(file);
                const filename = file.name.split('.')[0];

                if( file.type === "application/json") {
                    const reader = new FileReader(); 
                    reader.onload = async (e) => {
                        const JSONcontent = await JSON.parse(e.target.result);
                        db=[...db, {...JSONcontent, filename}];
                    };
                    await reader.readAsText(file);
                } else if (file.type === "application/pdf") {
                    pdfs[filename] = URL.createObjectURL(file);
                }
            }
        }
    });
</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-3">
    {#if db.length === 0}
        <div class="flex flex-col justify-center items-center col-span-3 gap-2 text-muted-foreground">
            <FileUpIcon class="size-10" />
            <p class="text-xl">Upload demo data.</p>
            <Input id="jsons" class="w-96 mt-2" bind:files={_$.files.demo} webkitdirectory multiple type="file" accept=".json, .pdf" />
            <div class="text-muted-foreground italic text-xs">Note: Make sure the filenames of the PDFs and JSONs are matching.</div>
        </div> 
    {:else}
    <Accordion.Root type="single">
            <Accordion.Item value="markdown">
                <Accordion.Trigger>Markdown</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="h-[800px] w-full">
                        <div class="flex flex-col gap-6">
                            {#if current}
                                {#each current.pages as page, index}
                                <fieldset class="grid gap-6 rounded-lg border p-4">
                                    <legend class="-ml-1 px-1 text-sm font-medium capitalize"> Page {index + 1} / {current.pages.length} </legend>
                                    <div>{@html marked.parse(page.markdown)}</div>
                                </fieldset>
                                {/each}
                            {/if}
                        </div>
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="json">
                <Accordion.Trigger>Structrured output</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="h-[800px] w-full">
                        <div class="flex flex-col gap-6">
                            {#if current}
                            {#each Object.entries(JSON.parse(current.document_annotation)) as [field, value]}
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
                    </ScrollArea>
                </Accordion.Content>
        </Accordion.Item>
    </Accordion.Root>
                    <ScrollArea
            class="bg-muted/50 relative flex h-[800px] min-h-[50vh] flex-col rounded-xl p-4 col-span-2"
            >
            <Badge variant="outline" class="absolute right-3 top-3 bg-foreground text-background">{current?.filename}.pdf</Badge>
            
            <embed
                src={pdfs?.[current?.filename]}
                type="application/pdf"
                height="100%"
                width="100%"
            />   
            

            {#if index > 0}
                <Button onclick={()=>index--} type="submit" size="sm" class="absolute bottom-14 right-4 ml-auto gap-1.5">
                    <ArrowLeft class="size-3.5" />
                </Button>
            {/if}
            {#if index < db.length - 1}
                <Button onclick={()=>index++} type="submit" size="sm" class="absolute bottom-3 right-4 ml-auto gap-1.5">
                    <ArrowRight class="size-3.5" />
                </Button>
            {/if}
        </ScrollArea>
    {/if}
</main>