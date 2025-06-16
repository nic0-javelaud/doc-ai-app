<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { PUBLIC_MISTRAL_API_KEY } from "$env/static/public";

    let files = $state();
    let image = $state(); // To store the image data

    const handleSubmit = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${PUBLIC_MISTRAL_API_KEY}`);
        const formData = new FormData();
        formData.append("purpose", "ocr");
        formData.append("file", files[0], files[0].name);
        const response = await fetch("https://api.mistral.ai/v1/files", {
            method: "POST",
            headers: myHeaders,
            body: formData,
            redirect: "follow"
        });
        console.log(response);
        console.log(await response.text());
    };

    const id = "e0cbeaaf-697c-47e6-b720-9b0bb0b22305";
    const handleGetFile = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${PUBLIC_MISTRAL_API_KEY}`);
        const response = await fetch(`https://api.mistral.ai/v1/files/${id}/content`, {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        });
        console.log(response);
        console.log(await response.text());
    };
    $effect(() => {
        console.log(files);
        if (files && files.length > 0) {
            // const file = files[0];
            // const reader = new FileReader();
            // reader.onload = (e) => {
            //     image = e.target.result;
            // };
            // reader.readAsDataURL(file);
            image = URL.createObjectURL(files[0]); // Create a URL for the file for embeddin
        }
    });
</script>
 
<div class="grid w-full items-center gap-1.5">
 <Label for="picture">Picture</Label>
 <Input id="picture" class="w-full" bind:files  type="file" />
 <Button onclick={handleSubmit}>Submit</Button>
 <Button onclick={handleGetFile}>Get File</Button>
 {#if image}
 <embed
    src={image}
    type="application/pdf"
    height="100%"
    width="100%"
/> 
 {/if}
 
</div>