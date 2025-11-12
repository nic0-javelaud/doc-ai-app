<script lang="ts">
	import '../app.css';
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { injectAnalytics } from '@vercel/analytics/sveltekit'

  import { page } from '$app/state';

  let bc = $state([null,null]);
  injectAnalytics({ mode: 'production' });

  $effect(() => {
    let path = page.url.pathname;
    const breadcrumbs = {
      '/': 'Home',
      '/settings': ['Adhoc jobs', 'Settings'],
      '/configuration': ['Adhoc jobs', 'Configuration'],
      '/results' : ['Adhoc jobs', 'Results'],
      '/demo': ['Side-by-side demo', 'Structured data'],
      '/samples': ['Side-by-side demo', 'Samples'],
      '/markdown': ['Side-by-side demo', 'Markdown']
    };
    bc=breadcrumbs[path];
  });
  
	let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="favicon.png" />
  <title>Mistral Doc AI Playground</title>
</svelte:head>

<Toaster position="top-right" />

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header
      class="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear"
    >
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item class="hidden md:block">
              <Breadcrumb.Link href="#">{bc[0]}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="hidden md:block" />
            <Breadcrumb.Item>
              <Breadcrumb.Page>{bc[1]}</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    	{@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>

