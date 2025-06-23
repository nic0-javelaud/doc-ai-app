<script lang="ts">
    
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { _$ } from "@/store.svelte";
    import { marked } from "marked";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    let fieldTypeOptions = ["string", "number", "boolean"];

    let schemas = $derived([..._$.configuration.schemas.root, ..._$.configuration.schemas.custom]);
    let customOptions = $derived(_$.configuration.schemas.custom.map(schema => schema.name));

    let ocr_pages = _$.results?.pages;
    let structured_data = _$.results? JSON.parse(_$.results.document_annotation) : null;

    const convertConfigToSchema = () => {
        console.log(`Schemas:`, _$.configuration.schemas);
        
        const schema = {
            "required": [],
            "title": "DocumentAnnotation",
            "type": "object",
            "additionalProperties": false
        };
        
        if ( _$.configuration.schemas.custom.length > 0 ) {
            const defs = _$.configuration.schemas.custom.reduce((acc, current) => {
                acc[current.name] = {
                    "properties": {},
                    "required": [],
                    "title": current.name,
                    "type": "object",
                    "additionalProperties": false
                };
                acc[current.name].properties = current.fields.reduce((all, field) => {
                    all[field.name] = {"title": field.name, "description": field.description};
                    if ( customOptions.includes(field.type) ) {
                        all[field.name].type = "array";
                        all[field.name].items = {"$ref": `#/$defs/${field.type}`};
                    } else if (field.isArray) {
                        all[field.name].type = "array";
                        all[field.name].items = {"type": field.type};
                    } else {
                        all[field.name].type = field.type;
                    }
                    return all;
                },{});
                return acc;
            }, {});
            schema["$defs"] = defs;
        }  

        const properties = _$.configuration.schemas.root[0].fields.reduce((acc, field) => {                
            acc[field.name] = {"title": field.name, "description": field.description};

            if ( customOptions.includes(field.type) ) {
                acc[field.name].type = "array";
                acc[field.name].items = {"$ref": `#/$defs/${field.type}`};
            } else if (field.isArray) {
                acc[field.name].type = "array";
                acc[field.name].items = {"type": field.type};
            } else {
                acc[field.name].type = field.type;
            }
            return acc;
        }, {});
        schema.properties = properties;
        
        return schema;
    };
    const convertConfigToPayload = () => {
        let payload = {
            "model": "mistral-ocr-latest",
            "document": {
                // "document_url": _$.upload.signed_url
                "document_url": "url"
            },
            "document_annotation_format": {
                "type": "json_schema",
                "json_schema": {
                    "schema": convertConfigToSchema(),
                    "name": "document_annotation",
                    "strict": true
                }
            },
            "include_image_base64": false
        };

        return payload;
    };

    const export_data = async () => {
        if(!_$.api_key) {
            toast.error("Please enter your API key first.");
            goto("/settings")
        } else {
            await navigator.clipboard.writeText(JSON.stringify(_$.results));
            console.log("Data copied to clipboard");
            toast.success("Data copied to clipboard");
        }
    }
    const export_http = async () => {
        console.log("Export HTTP");
        const payload = convertConfigToPayload();
        const curl = `curl -X POST https://api.mistral.ai/v1/ocr -H "Content-Type: application/json" -H "Authorization: Bearer ${_$.api_key}" -d '${JSON.stringify(payload)}'`;
        await navigator.clipboard.writeText(JSON.stringify(curl));
    }
    // const export_python = () => {
    //     console.log("Export Python");
    // }
    
    
</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-3">
    <ScrollArea class="h-[800px] w-full">
        <div class="grid grid-cols-3 gap-4">
            <Button variant="outline" class="w-full mb-4 cursor-pointer" onclick={export_data}>Export data</Button>
            <Button variant="outline" class="w-full mb-4 cursor-pointer" onclick={export_http}>Export Curl</Button>
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