<script lang="ts">
    import ImageUpIcon from "@lucide/svelte/icons/image-up";
    import FrameIcon from "@lucide/svelte/icons/frame";
    import Settings2Icon from "@lucide/svelte/icons/settings-2";
    import NavStandard from "./nav-standard.svelte";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import type { ComponentProps } from "svelte";
    import { FileJson2Icon, FileType2Icon, SettingsIcon } from "lucide-svelte";
    let {
        ref = $bindable(null),
        collapsible = "icon",
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> = $props();
    // This is sample data.
    const data = {
        adhoc: [
        {
            name: "API Settings",
            url: "/settings",
            icon: SettingsIcon,
        },
        {
            name: "Config",
            url: "/configuration",
            icon: Settings2Icon,
        },
        {
            name: "Results",
            url: "/results",
            icon: FrameIcon,
        }
        ],
        demo: [
            {
                name: "Side-by-side",
                url: "/demo",
                icon: FileJson2Icon,
            }
        ]
    }; 
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <Sidebar.MenuButton
        size="lg"
        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
        <div
            class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
        >
            <img src="/mistral-color.svg" alt="Mistral" class="size-5" />
        </div>
        <div class="grid flex-1 text-left leading-tight">
            <span class="truncate font-medium">
            Document AI Playground
            </span>
            <!-- <span class="truncate text-xs">Plan</span> -->
        </div>
    </Sidebar.MenuButton>
  </Sidebar.Header>
  <Sidebar.Content>
    <!-- <NavMain items={data.navMain} /> -->
    <NavStandard title="Adhoc jobs" items={data.adhoc} />
    <NavStandard title="Demos" items={data.demo} />
  </Sidebar.Content>
  <!-- <Sidebar.Footer class="p-4 text-xs text-muted-foreground">
    
  </Sidebar.Footer> -->
  <Sidebar.Rail />
</Sidebar.Root>