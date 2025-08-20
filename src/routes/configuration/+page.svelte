<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { ArrowLeft, ArrowRight, CornerDownLeft, ImageUpIcon, LoaderCircleIcon, PlusCircleIcon, SaveIcon, Trash, Trash2Icon } from "lucide-svelte";
    import { _$ } from "@/store.svelte.ts";
    import { Progress } from "bits-ui";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    let fieldTypeOptions = ["string", "number", "boolean"];

    let schemas = $derived(_$.configuration.schemas ? [..._$.configuration.schemas.root, ..._$.configuration.schemas.custom] : []);
    let customOptions = $derived(_$.configuration.schemas.custom.map(schema => schema.name));
    let progress = $state();
    let loading = $state(false);
    let showSaveLoadDialog = $state(false);
    let configName = $state("");
    let localConfigs = $state(localStorage.getItem("configs") ? JSON.parse(localStorage.getItem("configs")) : []);

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
                    acc[current.name].required.push(field.name); // Add current field to the list of required fields
                    all[field.name] = {"title": field.name, "description": field.description};
                    if ( customOptions.includes(field.type) ) {
                        if( field.isArray ) { // If field is an array of objects
                            all[field.name].type = "array";
                            all[field.name].items = {"$ref": `#/$defs/${field.type}`};
                        } else { // If field is a simple nested object
                            all[field.name]["$ref"] = `#/$defs/${field.type}`;
                        }
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

    function parseObject(obj, parentName = "root", schemaTemp = { root: [{ name: "root", parent: null, fields: [], results: null }], custom: [] }) {
        for (const key in obj) {
            const isArray = Array.isArray(obj[key]);
            const isObject = typeof obj[key] === 'object' && !isArray;

            if (isArray) {
                handleArray(key, obj[key], parentName, schemaTemp);
            } else if (isObject) {
                handleObject(key, obj[key], parentName, schemaTemp);
            } else {
                handlePrimitive(key, obj[key], parentName, schemaTemp);
            }
        }

        // Deduplicate schemaTemp.custom
        const uniqueSchemas = [];
        const schemaMap = new Map();

        schemaTemp.custom.forEach(schema => {
            if (!schemaMap.has(schema.name)) {
                schemaMap.set(schema.name, schema);
                uniqueSchemas.push(schema);
            } else {
                // Merge fields if the schema already exists
                const existingSchema = schemaMap.get(schema.name);
                existingSchema.fields.push(...schema.fields);
            }
        });

        schemaTemp.custom = uniqueSchemas;

        return schemaTemp;
    }

    function handleArray(key, array, parentName, schemaTemp) {
        console.log(key, "array");

        // Add field to parent schema
        addFieldToParentSchema(key, key, Array.isArray(array), parentName, schemaTemp);

        const arrayItem = array[0];
        if (typeof arrayItem === 'object') {
            // Create a new schema for the array item
            schemaTemp.custom.push({
                name: key,
                parent: parentName,
                fields: []
            });
            // Recursively parse the object
            parseObject(arrayItem, key, schemaTemp);
        } else {
            // Add field to parent schema for primitive array items
            schemaTemp.custom.push({
                name: key,
                parent: parentName,
                fields: [{
                    name: key,
                    type: typeof arrayItem,
                    isArray: false,
                    description: ""
                }]
            });
        }
    }

    function handleObject(key, obj, parentName, schemaTemp) {
        console.log(key, "object");

        // Add field to parent schema
        addFieldToParentSchema(key, key, false, parentName, schemaTemp);

        // Create a new schema for the object
        schemaTemp.custom.push({
            name: key,
            parent: parentName,
            fields: []
        });

        // Recursively parse the object
        parseObject(obj, key, schemaTemp);
    }

    function handlePrimitive(key, value, parentName, schemaTemp) {
        console.log(key, "primitive");

        // Add field to parent schema
        addFieldToParentSchema(key, typeof value, false, parentName, schemaTemp);
    }

    function addFieldToParentSchema(name, type, isArray, parentName, schemaTemp) {
        if (parentName === "root") {
            schemaTemp.root[0].fields.push({
                name,
                type,
                isArray,
                description: ""
            });
        } else {
            const parentSchema = schemaTemp.custom.find(schema => schema.name === parentName);
            if (parentSchema) {
                parentSchema.fields.push({
                    name,
                    type,
                    isArray,
                    description: ""
                });
            }
        }
    }

    const llmSuggestSchema = async ( documentType ) => {
        const instructions = `
            Your task is to analyze the attached document and design a structured JSON schema for extracting its key information. The schema must specify the data type (between string, number, or boolean) for each attribute and indicate whether it is a single value or an array.
            Requirements:
                Use nested schemas to group related data logically (e.g., a passenger object with attributes like name, seat, etc.).
                For repeated or multi-entry data (e.g., a list of passengers), define the nested schema and include it as an array attribute (e.g., passengers: [passenger]).
                Limit nesting to a maximum of 3 levels to ensure clarity and scalability.
                The schema should be practical for automated extraction.

            Output Format:
                Provide your answer in JSON format with two top-level attributes:
                    schema: The proposed schema for extraction.
                    example: A sample output demonstrating how the extracted data would look using the schema.
                DO NOT include any other text in your response. Just the JSON.
            
            Outpout example:
            {
                "booking": {
                    "reference": "string",
                    "totalPrice": "number",
                    "currency": "string",
                    "url": "string"
                },
                "flights": [
                    {
                    "departure": {
                        "time": "string",
                        "airport": "string",
                        "city": "string"
                    },
                    "arrival": {
                        "time": "string",
                        "airport": "string",
                        "city": "string",
                        "terminal": "string"
                    },
                    "operator": "string",
                    "flightNumber": "string",
                    "aircraft": "string",
                    "duration": "string",
                    "class": "string",
                    "baggage": {
                        "handBaggage": "number",
                        "smallBag": "number",
                        "checkedBaggage": "number"
                    },
                    "transfer": {
                        "time": "string",
                        "terminal": "string"
                    },
                    "meals": [
                        {
                        "type": "string",
                        "quantity": "number"
                        }
                    ]
                    }
                ],
                "passengers": [
                    {
                    "code": "string",
                    "name": "string",
                    "ticketNumber": "string",
                    "missingDetails": "boolean"
                    }
                ]
            }
        `;
        const prompt = {
            "model": "mistral-medium-latest",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": instructions},
                        {"type": null}
                    ]
                }
            ]
        };
        if ( documentType == "pdf" ) {
            prompt.messages[0].content[1].type = "document_url";
            prompt.messages[0].content[1].document_url = `${_$.upload.signed_url}`;
        } else {
            prompt.messages[0].content[1].type = "image_url";
            prompt.messages[0].content[1].image_url = { "url": _$.upload.signed_url };
        }
        
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${_$.api_key}`);

        const requestOptions = {
            method: "POST",
            headers,
            body: JSON.stringify( prompt ),
            redirect: "follow"
        };
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", requestOptions)
        return await res.json();
    };

    const handleGetSuggestion = async () => {
        if(!_$.api_key) {
            toast.error("Please enter your API key first.");
            goto("/settings")
        } else {
            loading = true;
            // Check the MIME type of the uploaded file
            const file = _$.files.adhoc[0];
            const mimeType = file.type;

            if (!_$.upload) {
                progress = "Uploading file...";
                await uploadFileMistral();
            }
            if (!_$.upload.signed_url) {
                progress = "Getting signed URL...";
                await getSignedURL();
            }

            progress = "Sending file to LLM for suggestions...";
            let results;

            if (mimeType.startsWith('image/')) {
                // Handle image files
                results = await llmSuggestSchema(`image`);
            } else if (mimeType === 'application/pdf') {
                // Handle PDF files
                results = await llmSuggestSchema(`pdf`);
             } else {
                toast.error("Unsupported file type.");
                loading = false;
                return; // Exit the function if the file type is not supported
            }

            if (results.object == "error") {
                toast.error(results.message);
                loading = false;
                return;
            } else {
                const content = results.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "");
                console.log(content);
                const data = JSON.parse(content);
                console.log(data);
                const suggestedSchemas = parseObject(data.schema);
                _$.configuration.schemas = suggestedSchemas;
                progress = "Done!";
                loading = false;
                toast.success("Document analyzed successfully!");
            }
        }
    };

    const saveConfiguration = () => {
        if (configName === "") {
            toast.error("Please enter a configuration name.");
            return;
        }
        if (!localConfigs.includes(configName)) { 
            localStorage.setItem("configs", JSON.stringify([...localConfigs, configName]));
            localConfigs.push(configName);
        }
        localStorage.setItem(`config_${configName}`, JSON.stringify(_$.configuration));
        console.log(`Saved configuration ${configName}`);
        toast.success(`Configuration ${configName} saved successfully!`);
        showSaveLoadDialog = false;
    };

    const loadConfiguration = ( configName ) => {
        const configToLoad = JSON.parse(localStorage.getItem(`config_${configName}`));
        _$.configuration = configToLoad;
        console.log(`Loaded configuration ${configName}`);
        toast.success(`Configuration ${configName} loaded successfully!`);
        showSaveLoadDialog = false;
    };

    const deleteConfiguration = ( configName ) => {
        localStorage.removeItem(`config_${configName}`);
        localConfigs = localConfigs.filter(config => config !== configName);
        localStorage.setItem("configs", JSON.stringify(localConfigs));
        console.log(`Deleted configuration ${configName}`);
        toast.success(`Configuration ${configName} deleted successfully!`);
    };

    $effect(() => {
        if (_$.files.adhoc && _$.files.adhoc.length > 0) {
            console.log(_$.files.adhoc);
            _$.document = URL.createObjectURL(_$.files.adhoc[0]);
        }
    });

</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-3">
    <div class="flex flex-col gap-4">
        <div class="flex justify-between gap-2 items-center">
            <div class="flex gap-2 place-self-center border rounded-lg px-2 py-2 text-sm">
                <span class="text-xs font-medium shadow-xs place-self-center">OCR Only</span>
                <Switch bind:checked={_$.ocrOnly} class="cursor-pointer" />
            </div>
            <Button variant="outline" onclick={handleGetSuggestion} class="cursor-pointer text-sm">
                Suggest schema
                <Badge variant="secondary" class="bg-teal-500 text-white italic text-xs" >
                    alpha
                </Badge>
            </Button>
            <Button variant="outline" onclick={()=>showSaveLoadDialog = true} class="cursor-pointer text-sm">Save/Load</Button>
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

<!-- Job in progress dialog - Show current states -->
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

<!-- Save/Load dialog -->
<Dialog.Root bind:open={showSaveLoadDialog}>
  <Dialog.Content>
    <Dialog.Header>
        <Dialog.Title>Save/Load configuration</Dialog.Title>
        <Dialog.Description>
            Save new configuration below or load an existing one.
        </Dialog.Description>
        <div class="flex flex-col gap-4">
            <div class=" mt-4 flex gap-4 justify-between">
                <Input id="configName" type="text" placeholder="Configuration name" bind:value={configName} />
                <SaveIcon onclick={saveConfiguration} class="size-5 cursor-pointer text-primary m-auto hover:text-muted-foreground"/>
                <!-- <Button onclick={saveConfiguration}>Save</Button> -->
            </div>
            <div class="font-medium text-sm mt-4">Config saved locally</div>
            <ScrollArea class="h-[196px]">
                <div class="flex flex-col gap-4">
                    {#each localConfigs as config}
                        <div class="flex gap-4 justify-between">
                            <Button class="grow" variant="outline" onclick={()=>loadConfiguration(config)}>{config}</Button>
                            <Trash2Icon onclick={()=>deleteConfiguration(config)} class="size-5 cursor-pointer text-muted m-auto hover:text-destructive" />
                        </div>
                    {/each}
                </div>
            </ScrollArea>
        </div>
    </Dialog.Header>

  </Dialog.Content>
</Dialog.Root>