<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { ArrowLeft, ArrowRight, Check, Circle, CircleSmall, CornerDownLeft, FileUpIcon, HeartPulse, IdCard, List, Receipt, Signature, Star, Trash, Workflow } from "lucide-svelte";
    import NestedField from "$lib/components/nested-field.svelte";
    import { marked } from "marked";
    import handwritting_json from "$lib/assets/demo/json/handwritting.json";
    import handritting_image from "$lib/assets/demo/images/handwritting.jpg";
    import passport_json from "$lib/assets/demo/json/passport.json";
    import passport_image from "$lib/assets/demo/images/passport.jpg";
    import medicalClaim_json from "$lib/assets/demo/json/medical_claim.json";
    import medicalClaim_image from "$lib/assets/demo/images/medical_claim.pdf";

    import { _$ } from "$lib/store.svelte";
    import { Title } from "@/components/ui/dialog";

    const options = [
        // { value: "invoice", label: "Invoices", icon: Receipt, image: handritting_image, data: handwritting_json  },
        // { value: "ids", label: "IDs", icon: IdCard, image: passport_image, data: passport_json },
        { value: "kyc", label: "KYC process", icon: Workflow, image: passport_image, data: passport_json, highlights: { 
            title: "Automate KYC Processes with Document AI",
            description: "For **financial institutions**, **healthcare providers**, and **regulated industries**, Document AI accelerates identity verification by **extracting**, **validating**, and **structuring** data from identity documents (e.g., passports) while ensuring compliance with regulatory standards.",
            key_capabilities: [
                "**Document Classification**: Automatically identifies document types (e.g., passport, ID card).",
                "**Flexible Input Support**: Processes both scanned documents and photos with high accuracy.",
                "**Structured Data Output**: Delivers clean, machine-readable data for seamless validation.",
                "**Visual Data Extraction**: Uses bounding boxes (BBox) to pinpoint and extract critical fields."
            ],
            zooming_out: [
                // "Cross-check now contextualized data against internal and external databases for identity verification and fraud detection.",
                // "Automatically generate reports and alerts for suspicious activities or discrepancies.",
                // "Human-in-the-loop review and approval workflows when needed.",
                // "Integrate with existing systems and workflows for seamless adoption.",
                // "Couple with LLM to assess risk profiles and guide decision-making."
                "**Enhanced Fraud Detection**: Cross-references extracted data against internal/external databases.",
                "**Automated Alerts**: Flags discrepancies or suspicious activities in real time.",
                "**Human-in-the-Loop Reviews**: Escalates edge cases for manual verification.",
                "**Risk Assessment**: Combines with LLMs to analyze risk profiles and support decision-making.",
                "**Seamless Adoption**: Plugs into existing workflows for minimal disruption."
            ]
        }},
        { value: "medical_claims", label: "Medical Claims", icon: HeartPulse, image: medicalClaim_image, data: medicalClaim_json, highlights: {
            title: "Automate Claims Processing with Document AI",
            description: "For **healthcare providers**, **insurers**, and **administrators**, Document AI streamlines medical claims processing by extracting, validating, and structuring data from complex forms while reducing manual errors and accelerating reimbursements.",
            key_capabilities: [
                "**Handles Complex Forms**: Processes nested fields, tables, and hierarchical data (e.g., patient details, provider charges).",
                "**Detects Checkboxes & Toggles**: Interprets selected options (e.g., gender, payment preferences).",
                "**Extracts Lists & Tables**: Captures itemized charges (e.g., services, dates, costs) into structured data.",
                "**Spots Fraud**: Identifies anomalies like duplicate bills or conflicting dates."
            ],
            zooming_out: [
                "**Faster Adjudication**: Auto-populates claims systems with structured data, cutting processing time by up to 80%.",
                "**Automated Compliance Checks**: Validates required fields (e.g., signatures, itemized bills) and ensures adherence to payer rules.",
                "**Seamless Handoffs**: Routes claims to the correct queue, Triggers notifications for missing documents.",
                "**Integration with Downstream Systems**: Links to payment processors for direct payouts.",
                "**Human-in-the-Loop**: Escalates edge cases (e.g., unclear handwriting, conflicting details)."
            ]
        }},
        { value: "handwritting", label: "Handwritting", icon: Signature, image: handritting_image, data: handwritting_json, highlights: {
            title: "Automate Service Order Processing with Document AI",
            description: "For field service teams, Document AI eliminates manual data entry by intelligently reading handwritten service orders—like the HexaConnect work order—alongside printed forms. It converts handwritten notes, signatures, and tables into structured data, slashing processing time, minimizing errors, and boosting operational efficiency.",
            key_capabilities: [
                "**Handwriting & Signature Detection**: Captures handwritten notes and validates signatures for approval.",
                "**Structured Table Extraction**: Parses labor, parts, and costs into actionable data arrays.",
                "**Smart Validation**: Confirms work authorization, checks calculations, and flags discrepancies (e.g., missing signatures, tax errors).",
                "**Context-Aware Extraction**: Pulls only relevant data (e.g., parts/labor used) and links related fields (e.g., service tasks to charges)."
            ],
            zooming_out: [
                "**Accelerate Invoicing**: Cuts processing time by 60% with auto-populated billing data.",
                "**Automate Checks**: Validates required fields (approvals, totals) and triggers alerts for missing info.",
                "**Streamline Integrations**: Syncs with ERP/CRM for inventory updates and cost tracking.",
                "**Reduce Errors**: Detects anomalies to prevent billing disputes and unauthorized work."
            ]
        }  },
    ];
    let selection = $state(options[0].value);
    let selected = $derived(options.find((o) => o.value === selection) );

    const saveAsJson = (filename: string, dataObjToWrite: any) => {
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
        link.remove();
    };
</script>
<main class="grid flex-1 gap-4 overflow-auto p-4 grid-cols-2">
    <div class="flex flex-col gap-4">
        <div class="flex gap-4 w-full justify-between">
            <Select.Root type="single" bind:value={selection}>
                <Select.Trigger class="w-full">
                    {#if selected?.icon}
                        <selected.icon class="mr-2 h-4 w-4" />
                    {/if}
                    {selected?.label}
                </Select.Trigger>
                <Select.Content>
                    {#each options as option}
                        <Select.Item value={option.value}>
                            {#if option.icon}
                                <option.icon />
                            {/if}
                            {option.label}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
            <Button variant="outline" onclick={()=>saveAsJson(`${selected?.value}.json`, selected?.data)} class="cursor-pointer text-sm">Export JSON</Button>
            <Button variant="outline" disabled onclick={()=>console.log(`BING!`)} class="cursor-pointer text-sm">See Request</Button>
        </div>
        
        <Accordion.Root type="single" class="w-full" value="highlights">
            <Accordion.Item value="highlights">
                <Accordion.Trigger>Use case</Accordion.Trigger>
                <Accordion.Content class="flex flex-col gap-4">
                    <!-- Use case description -->
                      <h2 class="text-xl font-bold">{selected?.highlights.title}</h2>
                    {@html marked(selected?.highlights.description)}
                    <p class="font-medium text-lg">Key benefits</p>
                    <div class="flex flex-col gap-4">
                        {#each selected?.highlights.key_capabilities as capability }
                        <div class="flex">
                            <CircleSmall class="mx-2 h-4 w-4 inline text-muted-foreground/50 fill-muted-foreground/50 place-self-center" />{@html marked(capability)}
                        </div>
                        {/each}
                    </div>
                    <div class="flex flex-col gap-4">
                        <!-- <p class="font-semibold text-lg">Value in larger workflow</p> -->
                        <p>When integrated into broader systems—such as <strong>Mistral AI Studio</strong>—Document AI unlocks:</p>
                        {#each selected?.highlights.zooming_out as zooming_out }
                         <div class="flex">
                            <Check class="mx-2 h-4 w-4 inline text-emerald-500 place-self-center" /> {@html marked(zooming_out)}
                        </div>
                        {/each}
                    </div>
                    
                    <!-- List of features used -->
                        <!-- Scanned document -->
                        <!-- Image BBox -->
                    <!-- the bigger story / next steps -->
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="markdown">
                <Accordion.Trigger>Markdown</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="h-[550px] w-full">
                        <div class="flex flex-col gap-6">
                            {#if selected}
                                {#each selected.data.pages as page, index}
                                <fieldset class="grid gap-6 rounded-lg border p-4">
                                    <legend class="-ml-1 px-1 text-sm font-medium capitalize"> Page {index + 1} / {selected.data.pages.length} </legend>
                                    <div>{@html marked(page.markdown)}</div>
                                </fieldset>
                                {/each}
                            {/if}
                        </div>
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="structured">
                <Accordion.Trigger>Structured output</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="h-[550px] w-full">
                        <div class="flex flex-col gap-6">
                            {#if selected}
                                {#each Object.entries(JSON.parse(selected.data.document_annotation)) as [field, value]}
                                    <NestedField field={field} value={value} />
                                {/each}
                            {/if}
                        </div>
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </div>
    <ScrollArea
        class="bg-muted/50 relative flex h-[760px] min-h-[50vh] flex-col rounded-xl p-4"
    >  
        <embed
            src={selected?.image}
            type="application/pdf"
            height="100%"
            width="100%"
        />
    </ScrollArea>
</main>