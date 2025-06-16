<script lang="ts">
  import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  let {
    title,
    items,
  }: {
    title: string,
    items: {
      name: string;
      url: string;
      // This should be `Component` after @lucide/svelte updates types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: any;
    }[];
  } = $props();
  const sidebar = useSidebar();
</script>
<Sidebar.Group>
  <Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.name)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              <item.icon />
              <span>{item.name}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
        <!-- <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Sidebar.MenuAction showOnHover {...props}>
                <EllipsisIcon />
                <span class="sr-only">More</span>
              </Sidebar.MenuAction>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            class="w-48 rounded-lg"
            side={sidebar.isMobile ? "bottom" : "right"}
            align={sidebar.isMobile ? "end" : "start"}
          >
            <DropdownMenu.Item>
              <FolderIcon class="text-muted-foreground" />
              <span>View Project</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <ForwardIcon class="text-muted-foreground" />
              <span>Share Project</span>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
              <Trash2Icon class="text-muted-foreground" />
              <span>Delete Project</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root> -->
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>