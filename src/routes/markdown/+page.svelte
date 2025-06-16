<script lang="ts">
    import  { marked }  from 'marked';
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { ArrowLeft, ArrowRight, CornerDownLeft, FileUpIcon, Trash } from "lucide-svelte";

    interface DbItem {
        filename: string;
        json: Record<string, any>; // You can replace `any` with a more specific type if you know the structure of the JSON objects
        image: string;
    }
    const jsons = import.meta.glob('@/assets/demo/json/*.json');

    let db = $state<DbItem[]>([]);

    for (const path in jsons) {
        jsons[path]().then((mod) => {
            if(mod) {
                // /src/lib/assets/demo/json/cvs_sample_7a.json - Sample path
                const filename = typeof path === 'string' ? path.split('/').pop().split('.')[0] : "";
                const json = JSON.parse(JSON.stringify(mod.default));
                const image = `demo/images/${filename}.pdf`;
                console.log(filename);
                
                db.push({
                    filename,
                    json,
                    image
                });
            } else {
                console.error('Module export is undefined');
            }
        })
    }
    
    let index = $state(0);
    let current = $derived(db[index]);

</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-2">
    {#if db.length === 0}
    <div class="flex flex-col justify-center items-center col-span-2 gap-2">
         <FileUpIcon class="size-12" />
         <p class="text-2xl">No demo data found.</p>
         <div class="text-muted-foreground italic">Start by adding PDFs in /static/demo/images and JSONs in /src/lib/assets/demo/jsons.</div>
         <div class="text-muted-foreground italic">Make sure the filenames of the PDFs and JSONs are matching.</div>

    </div>
    
       
    {:else}
        <ScrollArea class="h-[800px] w-full">
            <div class="flex flex-col gap-6">
                {#if current}
                    {#each current.json.pages as page, index}
                    <fieldset class="grid gap-6 rounded-lg border p-4">
                        <legend class="-ml-1 px-1 text-sm font-medium capitalize"> Page {index + 1} / {current.json.pages.length} </legend>
                        <div>{@html marked.parse(page.markdown)}</div>
                    </fieldset>
                    {/each}
                {/if}
            </div>
        </ScrollArea>
        <ScrollArea
            class="bg-muted/50 relative flex h-[800px] min-h-[50vh] flex-col rounded-xl p-4"
            >
            <Badge variant="outline" class="absolute right-3 top-3 bg-foreground text-background">{current?.filename}</Badge>
            
            <embed
                src={current?.image}
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