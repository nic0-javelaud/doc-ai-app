<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import NestedField from "$lib/components/nested-field.svelte";
    import { _$ } from "@/store.svelte";
    import { marked } from "marked";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";

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
                    acc[current.name].required.push(field.name); // Add current field to the list of required fields
                    all[field.name] = {"title": field.name, "description": field.description};
                    if ( customOptions.includes(field.type) ) {
                        if( field.isArray ) { // If field is an array of objects
                            all[field.name].type = "array";
                            all[field.name].items = {"$ref": `#/$defs/${field.type}`};
                        } else { // If field is a simple nested object
                            all[field.name]["$ref"] = `#/$defs/${field.type}`;
                        }
                        // all[field.name].type = "array";
                        // all[field.name].items = {"$ref": `#/$defs/${field.type}`};
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
            schema.required.push(field.name); // Add current field to the list of required fields for the root schema            
            acc[field.name] = {"title": field.name, "description": field.description};

            // If field type is a custom schema, then checks if it's as an array of objects or simple nested object
            if ( customOptions.includes(field.type) ) {
                if( field.isArray ) { // If field is an array of objects
                    acc[field.name].type = "array";
                    acc[field.name].items = {"$ref": `#/$defs/${field.type}`};
                } else { // If field is a simple nested object
                    acc[field.name]["$ref"] = `#/$defs/${field.type}`;
                }
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
        let payload;
        if(_$.ocrOnly) {
            payload = {
                "model": "mistral-ocr-latest",
                "document": {
                    "document_url": _$.upload.signed_url
                },
                "include_image_base64": true
            };
        } else {
            payload = {
                "model": "mistral-ocr-latest",
                "document": {
                    "document_url": _$.upload.signed_url
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
        }

        return payload;
    };


    const saveAsJson = (filename, dataObjToWrite) => {
        const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
        const link = document.createElement("a");

        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(evt);
        link.remove()
    };

    const saveAsText = (filename, dataObjToWrite) => {
        const blob = new Blob([dataObjToWrite], { type: "text/plain" });
        const link = document.createElement("a");

        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["text/plain", link.download, link.href].join(":");

        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(evt);
        link.remove()
    };

    const export_data = async () => {
        if(!_$.api_key) {
            toast.error("Please enter your API key first.");
            goto("/settings")
        } else {
            saveAsJson("results.json", _$.results);
            toast.success("JSON downloaded successfully");
        }
    };

    const export_http = async () => {
        console.log("Export HTTP");
        const payload = convertConfigToPayload();
        const curl = `curl -X POST https://api.mistral.ai/v1/ocr -H "Content-Type: application/json" -H "Authorization: Bearer ${_$.api_key}" -d '${JSON.stringify(payload)}'`;
        await navigator.clipboard.writeText(JSON.stringify(curl));
        saveAsText("curl.txt", curl);
        toast.success("Curl command downloaded successfully");
    };
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
                                <NestedField field={field} value={value} />
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