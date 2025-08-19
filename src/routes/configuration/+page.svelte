<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { ArrowLeft, ArrowRight, CornerDownLeft, ImageUpIcon, LoaderCircleIcon, PlusCircleIcon, Trash, Trash2Icon } from "lucide-svelte";
    import { _$ } from "@/store.svelte.ts";
    import { Progress } from "bits-ui";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    let fieldTypeOptions = ["string", "number", "boolean"];

    let schemas = $derived([..._$.configuration.schemas.root, ..._$.configuration.schemas.custom]);
    let customOptions = $derived(_$.configuration.schemas.custom.map(schema => schema.name));
    let progress = $state();
    let loading = $state(false);

    const clearDocument = () => {
        _$.document = null;
        _$.files.adhoc = null;
        _$.upload = null;
        _$.ocrOnly = false;
    };

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

    const uploadFileMistral = async () => {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${_$.api_key}`);
        const body = new FormData();
        body.append("purpose", "ocr");
        body.append("file", _$.files.adhoc[0], _$.files.adhoc[0].name);
        const response = await fetch("https://api.mistral.ai/v1/files", {
            method: "POST",
            headers,
            body,
            redirect: "follow"
        });
        const data = await response.json();
        console.log(data);
        _$.upload = data;
        return data;
    };

    const getSignedURL = async () => {
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${_$.api_key}`);
        const response = await fetch(`https://api.mistral.ai/v1/files/${_$.upload.id}/url?expiry=24`, {
            method: "GET",
            headers,
            redirect: "follow"
        });
        const data = await response.json();
        console.log(data);
        _$.upload.signed_url = data.url;
        return data;
    };

    const getDocAiResults = async () => {        
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${_$.api_key}`);

        const body = JSON.stringify( convertConfigToPayload() );
        
        const requestOptions = {
            method: "POST",
            headers,
            body,
            redirect: "follow"
        };

        const res = await fetch("https://api.mistral.ai/v1/ocr", requestOptions)
        return await res.json(); 
    };

    const handleSubmit = async () => {
        console.log(convertConfigToSchema());
        if(!_$.api_key) {
            toast.error("Please enter your API key first.");
            goto("/settings")
        } else {
            console.log(_$.upload);
            loading = true;
            if (!_$.upload) {
                progress = "Uploading file...";
                await uploadFileMistral();
            }
            if (!_$.upload.signed_url) {
                progress = "Getting signed URL...";
                await getSignedURL();
            }
            progress = "Processing file through DocAI...";
            const results = await getDocAiResults();
            if(results.object == "error") {
                toast.error(results.message);
                loading = false;
                return;
            } else {
                 _$.results = results;
                console.log(results);
                progress = "Done!";
                loading = false;
                toast.success("Document processed successfully! You're redirected to the results tab.");
                goto("/results");
            }
           
        }
    };

    const loadConfiguration = ( config ) => {
        const configToLoad = JSON.parse(localStorage.getItem(`config_${config}`));
        _$.configuration = configToLoad;
        console.log(`Loaded configuration ${config}`);
    };

    $effect(() => {
        if (_$.files.adhoc && _$.files.adhoc.length > 0) {
            console.log(_$.files.adhoc);
            _$.document = URL.createObjectURL(_$.files.adhoc[0]);
        }
    });

</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-3">
    <div class="flex flex-col justify-between gap-4">
        <div class="flex justify-between gap-4 items-center">
            <div class="flex gap-4 place-self-center border rounded-lg px-4 py-2">
                <span class="text-sm font-medium shadow-xs place-self-center">OCR Only</span>
                <Switch bind:checked={_$.ocrOnly} class="cursor-pointer" />
            </div>
            <Button variant="outline" disabled class="cursor-pointer">Suggest schema</Button>
            <Button variant="outline" disabled class="cursor-pointer">Save/Load</Button>
        </div>
        <ScrollArea class="h-[725px] w-full">
            <div class="flex flex-col gap-6">
                <!-- Action panel -->
                {#if !_$.ocrOnly}
                    {#each schemas  as schema, index}
                        <fieldset class="grid gap-6 rounded-lg border p-4">
                            {#if schema.name == "root"}
                                <legend class="-ml-1 px-1 text-sm font-medium capitalize"> {schema.name} </legend>
                            {:else}
                                <div class="flex justify-between gap-6 items-center">
                                    <Input id="schema" type="text" placeholder="Type schema name here" bind:value={schema.name} />
                                    <Trash2Icon onclick={()=> _$.configuration.schemas.custom.splice(index -1 , 1)} class="size-5 cursor-pointer text-muted-foreground m-auto" /> 
                                </div>
                            {/if}
                            {#each schema.fields as field, index}
                                <fieldset class="grid gap-4 rounded-lg border p-4">
                                    <div class="grid grid-cols-5 gap-4">
                                        <Label for="name" class="col-span-2">Field name</Label>
                                        <Label for="type" class="col-span-2">Field type</Label>
                                        <Label for="isArray" class="text-center">Is Array</Label>

                                        <Input id="name" class="col-span-2" type="text" placeholder="Field name" bind:value={field.name} />
                                        <Select.Root class="" bind:value={field.type} type="single">
                                            <Select.Trigger class="col-span-2 w-full"><span class="capitalize">{field.type}</span></Select.Trigger>
                                            <Select.Content>
                                                {#each fieldTypeOptions as option}
                                                    <Select.Item value={option}><span class="capitalize">{option}</span></Select.Item>
                                                {/each}
                                                {#if _$.configuration.schemas.custom.length > 0}
                                                    <Select.Separator/>
                                                    <Select.Label>Custom schemas</Select.Label>
                                                {/if}
                                                {#each _$.configuration.schemas.custom as option}
                                                    <Select.Item value={option.name}><span class="capitalize">{option.name}</span></Select.Item>
                                                {/each}
                                            </Select.Content>
                                        </Select.Root>
                                        <Checkbox id="isArray" class="place-self-center m-auto" bind:checked={field.isArray} />
                                    </div> 
                                    <Label for="description">Description <span class="italic text-sm font-normal text-muted-foreground">(optional)</span></Label>
                                    <Input id="description" type="text" placeholder="Field description" bind:value={field.description} />
                                    <Trash2Icon onclick={()=>schema.fields.splice(index, 1)} class="size-4 cursor-pointer text-muted-foreground place-self-end" /> 

                                </fieldset>
                            {/each}
                            <Button onclick={()=>schema.fields.push({name: "", type: "string", isArray:false, description: ""})} variant="outline" size="sm">
                                <PlusCircleIcon />
                                Add new field
                            </Button>
                        </fieldset>
                    {/each}
                    <Button onclick={()=>_$.configuration.schemas.custom.push({name: "", parent: null, fields: []})} variant="outline" size="sm">
                        <PlusCircleIcon />
                        Add new schema
                    </Button>
                {/if}
                <Button onclick={handleSubmit} size="sm" class="cursor-pointer">
                    <!-- <PlusCircleIcon /> -->
                    Submit
                </Button>
            </div>
        </ScrollArea>
    </div>
    
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
        {:else}
            <div class="flex flex-col h-full items-center justify-center self gap-1 text-muted-foreground">
                <ImageUpIcon class="size-6" />
                <p onclick={()=>fileSelector.click()} class="text-sm">Select a document below</p>
                <Input id="picture" class="w-96 mt-2" bind:files={_$.files.adhoc} type="file" />
            </div>
        {/if}
        
        <Button type="submit" onclick={clearDocument} size="sm" class="absolute bottom-3 right-4 ml-auto gap-1.5">
            <Trash2Icon class="size-3.5" />
        </Button>
    </ScrollArea>
</main>

<Dialog.Root bind:open={loading}>
  <Dialog.Content>
    <Dialog.Header>
        <Dialog.Title>
            <div class="flex animate-pulse">
                <LoaderCircleIcon class="size-6 animate-spin" />
                <span class="ml-2 place-self-center">{progress}</span>
            </div>
        </Dialog.Title>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>