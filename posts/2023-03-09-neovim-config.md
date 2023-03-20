---
title: neovim config
date: 2023-03-13
author: gabe dunn
gravatar: 0bff633cc9cae2c7f75c8688ce8ae526
twitter: '@gabedunn_'
---

hello friends! i have recently revamped my [neovim configuration][0] from the ground up (again...), so i've decided to make a new post here about it!

---

## intro

ever since i first started using vim, i've continually been making changes to my setup, whether i'm adding some useful hotkeys, or restarting from scratch.

in this post, i will be going over what i'm using in my current configuration, why i made those choices, and how it differs from what i had in my previous configurations.

although i'm currently very happy with how my neovim functions as of now, i cannot guarantee that it won't change in the future. in order to preserve the relevance of this post, i will be including a [link to the specific commit that is in use at the time of publishing][1].

## table of contents

[[toc]]

## main goals

when setting up this configuration i had a few objectives in mind:

- ide replacement level of features.
- (mostly) mnemonic keybinds for ease of use.
- super fast startup time.
- pure lua configuration.
- ease of maintenance.

## core

> plugin manager & organization

if you're as much of a fiend for plugins as i am, the plugin manager is likely the foundation of your configuration. in the last few years, a lot of new options for this have popped up. having tried out a few, i've happily landed on one of the newest arrivals: [lazy.nvim][2]. some of the main benefits it brings include: similar config style to [packer.nvim][5] (which i used for my previous configuration), defining a plug spec (for easy modularization of plugins), and most importantly, lazy loading. this was possible with previous plugin managers, but `lazy.nvim` makes it super easy to implement - to the point where i don't have to think about it at all. this is what allows me to install as many plugins as i like, without any penalties to my startup time.

here's how it works:

in your `init.lua` file, you just need a few things:

the bootstrap (clones the `lazy` repo if it isn't installed yet):

```lua
-- lua/init.lua
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    'git',
    'clone',
    '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git',
    '--branch=stable', -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)
```

mapping your leader keys (`lazy` requires this to set accurate keybinds):

```lua
vim.g.mapleader = ' ' -- set the leader key to <space>
```

and the initialization:

```lua
-- lua/init.lua
require('lazy').setup({
  'folke/which-key.nvim',
  { 'folke/neoconf.nvim', cmd = 'Neoconf' },
  'folke/neodev.nvim',
})
```

this will get everything initialized, and will load in three plugins: `which-key.nvim`, `neoconf.nvim`, and
`neodev.nvim`. these are just the default plugins shown in `lazy`'s readme, in order to show the syntax
for specifying plugins. what they do is not immediately important, so we will get to that later.

as you can see, plugins are specified very similar to how you would do it with `packer`, just without the call to `use`. this is because `lazy` uses a defined spec for plugins, allowing us to provide a table of our choice, without restrictions on how it is created. for a complete look at this spec, you can find it in the project's [readme][2].

while this is great, i want to be able to break up my config, and put everything in its own file. that way it's more obvious what each file does, allowing for better maintainability. lucky for us, `lazy` makes this super easy!

instead of specifying the plugins in the `setup` function like we did above, i'm going to pass an additional argument first: `'plugins'`. this will tell `lazy` to search the `lua/plugins` folder for files that return the plugin spec, and load them all:

```lua
-- lua/init.lua
require('lazy').setup('plugins')
```

now, i can separate concerns into their own files! `plugins/lsp.lua` can contain all my plugins relating to language servers and their configuration, while `plugins/toggleterm.lua` handles the toggleable terminal window.

```lua
-- lua/plugins/lsp.lua (abbreviated, there's more needed to get it working properly)
return {
  {
    'nvim-treesitter/nvim-treesitter',
    opts = function(_, opts)
      if type(opts.ensure_installed) == 'table' then
        vim.list_extend(opts.ensure_installed, { 'typescript', 'python', 'bash', 'vue' })
      end
    end
  },
  {
    'neovim/nvim-lspconfig',
    opts = {
      servers = {
        tsserver = {},
        pyright = {},
        bashls = {},
        volar = {},
      }
    }
  }
}

-- lua/plugins/toggleterm.lua
return {
  {
    'akinsho/nvim-toggleterm.lua',
    event = 'VeryLazy',
    opts = {
      open_mapping = [[<C-\>]]
    }
  }
}
```

now, you may be wondering why i'm not calling `.setup({})` on each of these plugins, right? they do require that in order to function, but guess what - `lazy` handles this for us as well! if an `opts` key exists on the plugin (even if it's empty `{}`), `lazy` will call `.setup(opts)`, passing it your `opts`!

## lazy loading

now, i'm a big fan of adding plugins for new functionality, but sometimes if i go overboard this can lead to a noticeable delay in startup times. it's still only going to be a couple hundred ms, but it's enough to be noticeable.
how do we get around this without deleting all the plugins? by lazy loading them of course! with my current config, i've managed to get the load time down to ~20ms, with 72 plugins being active.

you might have noticed the `event = 'VeryLazy'` key on the toggleterm plugin spec just above, and wondered what it's doing. the `event` key, if specified, will tell `lazy` to not load in the plugin until a certain event fires. this can be any event, like `BufEnter`. the `VeryLazy` event is just a catchall event fired by `lazy` after startup, making it possible to load plugins that need to be active, but not on any specific event.

you can also use other triggers to load plugins, such as waiting for a command `cmd = 'ToggleTerm'`, or when a keybind is pressed `keys = { { '<C-\>', '<cmd>ToggleTerm<cr>' } }` or even more - all the options are documented in `lazy`'s [readme][2].

## lazy vim

now that we've established how `lazy` works, i'm going to pull something unexpected - i'm not using `lazy` as described above - instead, i'm using what is effectively a distro of neovim, called [LazyVim][3] - which is based around `lazy`, and is created by the same developer! as someone who has reinvented the wheel many times, i'm trying to be more concious of avoiding doing so, at least where possible. while i'm not usually a big fan of using premade neovim distros, lazyvim is different. instead of using its own configuration format like most of the other ones i've tried, it allows you to specify plugins and their configuration exactly as you would if you were just using `lazy`. it tells you to handle your plugins with the same plugin spec in `lua/plugins`, configure `lazy` in `lua/config/lazy.lua` and some neovim config in `lua/config/options.lua`, `lua/config/keymaps.lua`, and `lua/config/autocmds.lua`. these files will be loaded automatically by lazyvim, so you don't have to `require` them anywhere.

the main benefit that lazyvim provides is the plugins and configuration included by default. it provides a very solid base with tons of features, that are configured with very sane defaults, so in most cases, you won't have to change anything. if you do want to make changes, it's super easy as well! in any file in your `plugins` folder, you can just specify the plugin you want to configure, and your options, keybinds, etc. (full list in [lazyvim docs][4]) will be merged with the defaults, easy as that! if you want to disable a plugin, you can just use `enabled = false`.

```lua
-- lua/plugins/trouble.lua
return {
  -- disable trouble
  { 'folke/trouble.nvim', enabled = false },

  -- or, change trouble config
  {
    'folke/trouble.nvim',
    -- opts will be merged with the parent spec
    opts = { use_diagnostic_signs = true },
  }
}
```

## overview of features

the main features that lazyvim comes with include fully configured LSPs, a file browser (neo-tree, accessible with `<leader>e`), fuzzy finders (telescope, `<leader>ff`, `<leader><space>`, much more), which-key, auto-pair & surround, snippets, comment handling, auto-indent, search and replace (spectre, `<leader>sr`), diagnostics window (trouble, `<leader>xx`), ui elements (bufferline, notifications, lualine, startup page, other ui replacements), and more utilities, such as startup time, persistence, vim-repeat, and more.

### language servers

lazyvim comes preconfigured with a few language servers, and everything you need to set up any that aren't included by default. it also has default keybinds for working with lsps, such as `gd` for goto-definition, `gr` to show references, `K` for show function signature, `<leader>ca` to show available code actions, and a few more, shown on the [keybinds docs page][6].

by default, it has a language server for `lua`, and `null-ls` as a fallback for when certain tools don't have a language server to attach to. to add your own, you can modify the plugin spec for `nvim-lspconfig` and `nvim-treesitter`. the snippet below will ensure that `treesitter` has the necessary parsers installed, and that `mason` and `nvim-lspconfig` will install the server and enable it respectively:

```lua
-- lua/plugins/ts-lsp.lua
return {
  {
    'nvim-treesitter/nvim-treesitter',
    opts = function(_, opts)
      if type(opts.ensure_installed) == 'table' then
        -- add typescript filetypes to treesitter parsers
        vim.list_extend(opts.ensure_installed, { 'typescript', 'tsx' })
      end
    end
  },
  {
    'neovim/nvim-lspconfig',
    opts = {
      -- listing the server here will tell mason to install it, and it will be enabled for its matching filetypes
      servers = {
        tsserver = {}
      }
    }
  }
}
```

this can be changed to fit any filetype and language server, just swap out or add in new values as you please. that being said, lazyvim provides plugins to configure servers for `typescript` and `json`. you can enable these by importing them in your `lazy.lua` config file:

```lua
-- lua/config/lazy.lua
require('lazy').setup({
  spec = {
		-- add LazyVim and import its plugins (default)
		{ 'LazyVim/LazyVim', import = 'lazyvim.plugins' },

		-- import any extras modules here (these are the plugins mentioned above)
		{ import = 'lazyvim.plugins.extras.lang.typescript' },
		{ import = 'lazyvim.plugins.extras.lang.json' },

		-- import/override with your plugins (default - your lua/plugins folder would be ignored otherwise)
		{ import = 'plugins' },
  }
})
```

if you want to add more, you can use the format specified in those files to make your own. i did this to configure deno, which can benefit from using non-default language server. i can specify this by changing the setup function:

```lua
-- lua/plugins/deno.lua
local nvim_lsp = require('lspconfig')

return {
	-- correctly setup lspconfig
	{
		'neovim/nvim-lspconfig',
		dependencies = { 'sigmasd/deno-nvim' },
		opts = {
			-- make sure mason installs the servers
			servers = {
				denols = {},
			},
			setup = {
				denols = function(_, opts)
					require('deno-nvim').setup({ server = opts })
					return true
				end,
			},
		},
	},
}
```

### fuzzy finders

lazyvim come with fully configured fuzzy finders using telescope. it has binds for file picker (`<leader>ff`), git file picker (`<leader><space>`) switching buffer (`<leader>,`), live grep (`<leader>sg`), help pages (`<leader>sh`), keybinds (`<leader>sk`), and much more.

## my additions

since lazyvim provides almost everything i like to use the amount of manual config i had to do is very minimal - but there are a few things i had to either change or add. the `vim.opt` changes, keybind additions, and autocmds are nothing special, so i'll just go over the plugin changes (aside from the inclusion of the `lazyvim.plugins.extras`, from which i'm using `lang.typescript`, `lang.json`, `linting.eslint`, `formatting.prettier`, and `ui.mini-animate`.)

first and most importantly: the dracula colourscheme. if you couldn't tell by the colourscheme of the codeblocks on this page (at the time of publishing, of course), i'm a fan of the dracula colours. the perfect mix of vibrancy and contrast, without being too obnoxiously bright.

### utils

these are mostly smaller plugins i've included together, as they're small enough to not warrant a dedicated file for each of them.

the biggest change here is probably `goto-preview`, which adds the keybinds `gpd`, `gpi`, `gpr`, and `gpD`, to open up a floating window to show the definition, initiation, references, and declaration of the current variable respectively, instead of jumping to them, as the keybinds would usually do if omitting the `p` in the middle.

```lua
return {
	{ 'tpope/vim-eunuch', event = 'VeryLazy' }, -- unix tools, like :SudoWrite
	{ 'tpope/vim-endwise', event = 'VeryLazy' }, -- automatically add end pairs: if/fi, function/end, etc.
	{ 'andrewradev/tagalong.vim', event = 'VeryLazy' }, -- automatically edit matching html tag when one is changed
	{ 'ellisonleao/glow.nvim', opts = {}, cmd = 'Glow' }, -- preview markdown in nvim
	{ 'kovetskiy/sxhkd-vim', event = 'VeryLazy' }, -- syntax highlighting for sxhkd config files
	{ 'nacro90/numb.nvim', opts = {}, event = 'VeryLazy' }, -- preview jump location before committing to it
	{ 'max397574/better-escape.nvim', opts = {}, event = 'VeryLazy' }, -- escape insertion mode with `jj`, `jk` without the delay that usually happens
	{
    -- floating window to preview locations
		'rmagatti/goto-preview',
		event = 'VeryLazy',
		opts = {
			default_mappings = true,
			-- resizing_mappings = true,
			references = {
				telescope = require('telescope.themes').get_dropdown({ hide_preview = false }),
			},
		},
	},
	{
    -- show lightbulb icon in gutter to show code actions are available
		'kosayoda/nvim-lightbulb',
		event = 'BufReadPost',
		opts = {
			autocmd = {
				enabled = true,
			},
		},
	},
}
```

### deno

technically, as far as syntax goes, deno is covered by the typescript language server, but i was annoyed by the errors around unresolved imports and unknown globals, so i of course added deno's dedicated language server. the way i did this was actually pretty much copied and pasted from the `lang.typescript` plugin, since it's pretty much doing the exact same thing, without the treesitter languages, since that part is covered by the typescript plugin. with this code block, i am getting `lspconfig` and `mason` to configure the deno language server, and then changing the setup function to use a different plugin as the server to provide some extra features:

```lua
-- plugins/deno.lua
local nvim_lsp = require('lspconfig')

return {
	-- correctly setup lspconfig
	{
		'neovim/nvim-lspconfig',
		dependencies = { 'sigmasd/deno-nvim' },
		opts = {
			-- make sure mason installs the servers
			servers = {
				denols = {},
			},
			setup = {
				denols = function(_, opts)
					require('deno-nvim').setup({ server = opts })
					return true
				end,
			},
		},
	},
}
```

the one downside to having both the typescript and deno language servers configured is that by default, they both are active on all typescript buffers. this is problematic, as it will show `tsserver` errors in your deno projects, and `denols` errors in all your other projects. i have not yet figured a way to fix this automatically (i will update this post if/when i find a solution), however `neoconf` makes this very easy to do on a per-project basis. you can make a `.neoconf.json` file in the folder, and in your deno projects you can disable `tsserver`, and elsewhere you can disable `denols`.

```jsonc
// deno-project/.neoconf.json
{
  "lspconfig": {
    "tsserver": false,
  }
}
// ts-project/.neoconf.json
{
  "lspconfig": {
    "denols": false,
  }
}
```

### vue & tailwind

vue also has its own language server, called `volar`, so i of course had to include that as well. i frequently use tailwind, so adding a language server for that (as well as colour highlighting for class names) helps out greatly.

```lua
-- plugins/vue.lua
return {
	-- add vue to treesitter
	{
		'nvim-treesitter/nvim-treesitter',
		opts = function(_, opts)
			if type(opts.ensure_installed) == 'table' then
				vim.list_extend(opts.ensure_installed, { 'vue', 'tsx' })
			end
		end,
	},

	-- correctly setup lspconfig
	{
		'neovim/nvim-lspconfig',
		opts = {
			-- make sure mason installs the server
			servers = {
				volar = {},
			},
		},
	},
}
```

```lua
-- plugins/tailwind.lua
return {
  -- add tailwind language server
	{
		'neovim/nvim-lspconfig',
		opts = {
			servers = {
				tailwindcss = {},
			},
		},
	},
  -- colourize css colours, and also tailwind class names
	{
		'NvChad/nvim-colorizer.lua',
		event = 'VeryLazy',
		opts = {
			user_default_options = {
				tailwind = true,
			},
		},
	},
  -- add colourized tailwind classname completion
	{
		'hrsh7th/nvim-cmp',
		dependencies = {
			{ 'roobert/tailwindcss-colorizer-cmp.nvim', config = true },
		},
		opts = function(_, opts)
			-- keep original LazyVim kind icon formatter
			local format_kinds = opts.formatting.format
			opts.formatting.format = function(entry, item)
				format_kinds(entry, item) -- add icons
				return require('tailwindcss-colorizer-cmp').formatter(entry, item)
			end
		end,
	},
}
```

### toggleterm + overseer (task runner)

this one is fairly simple. the default terminal didn't allow me to start up a process and leave it running while hiding the terminal, so i brought in `toggleterm`, and just set the mapping. for task runners, i chose overseer, as it was able to automatically detect tasks from language specific files, such as `package.json`'s scripts, and `deno.json`'s tasks. for that i also just created some binds, and told it to run the tasks in a toggleterm buffer.

```lua
-- plugins/toggleterm.lua
return {
  'akinsho/nvim-toggleterm.lua',
  event = 'VeryLazy',
  opts = {
    open_mapping = [[<c-\>]],
  },
}
```

```lua
-- plugins/overseer.lua
return {
	'stevearc/overseer.nvim',
	event = 'VeryLazy',
	keys = {
		{ '<leader>ts', '<cmd>OverseerRun<cr>', { desc = 'Open task runner' } },
		{ '<leader>tt', '<cmd>OverseerToggle<cr>', { desc = 'Open task runner' } },
	},
	opts = {
		strategy = 'toggleterm',
	},
}
```

### projects

in order to keep track of projects and switch between them, i've included `telescope-project.nvim`. this adds a telescope picker for choosing a project. it has default binds that allow you to create and delete entries from the list as well.

```lua
return {
	'nvim-telescope/telescope-project.nvim',
	event = 'VeryLazy',
	keys = {
		{ '<C-p>', "<cmd>lua require('telescope').extensions.project.project({})<cr>" },
	},
	config = function()
		require('telescope').load_extension('project')
	end,
}
```

### github

in order to more easily work with github, i've included the `octo.nvim` plugin. this allows viewing and commenting on issues and pull requests while remaining in vim.

```lua
return {
	{
		'pwntester/octo.nvim',
		event = 'VeryLazy',
		dependencies = {
			'nvim-lua/plenary.nvim',
			'nvim-telescope/telescope.nvim',
			'nvim-tree/nvim-web-devicons',
		},
		opts = {},
	},
}
```

### obsidian

i've semi-recently started using obsidian to take notes. i'm a big fan of the graph style of notes, with all your ideas having links to other relevant pages. but naturally, as a vim user, i wondered if i could maintain the same notes format, just using vim as my editor instead. lucky for me, i wasn't the first person to have this thought, because `obsidian.nvim` exists! here i just create some binds and point it towards my notes folder.

```lua
return {
	{
		'epwalsh/obsidian.nvim',
		event = 'VeryLazy',
		keys = {
			{ '<leader>oo', '<cmd>ObsidianOpen<cr>' },
			{ '<leader>on', '<cmd>ObsidianNew<cr>' },
			{ '<leader>oT', '<cmd>ObsidianTemplate<cr>' },
			{ '<leader>ot', '<cmd>ObsidianToday<cr>' },
			{ '<leader>oy', '<cmd>ObsidianYesterday<cr>' },
			{ '<leader>ol', '<cmd>ObsidianLink<cr>' },
			{ '<leader>oL', '<cmd>ObsidianLinkNew<cr>' },
			{ '<leader>ob', '<cmd>ObsidianBacklinks<cr>' },
			{ '<leader>os', '<cmd>ObsidianSearch<cr>' },
			{ '<leader>oq', '<cmd>ObsidianQuickSwitch<cr>' },
		},
		opts = {
			dir = '~/Documents/Obsidian/Main',
			completion = {
				nvim_cmp = true, -- with this set to true, it automatically configures completion on its own
			},
		},
		config = function(_, opts)
			require('obsidian').setup(opts)

      -- if cursor is on a link in an obsidian file, gf will follow the reference, otherwise it will behave normally
			vim.keymap.set('n', 'gf', function()
				if require('obsidian').util.cursor_on_markdown_link() then
					return '<cmd>ObsidianFollowLink<CR>'
				else
					return 'gf'
				end
			end, { noremap = false, expr = true })
		end,
	},
}
```

### discord presence

a completely optional but fun plugin i like to include is `presence.nvim`, which shares your coding status on discord, using the game presence api. you can configure how much it shows, and how it displays as well.

```lua
return {
	'andweeb/presence.nvim',
	event = 'VeryLazy',
	opts = {
		-- rich presence text options
		editing_text = 'editing %s', -- format string rendered when an editable file is loaded in the buffer (either string or function(filename: string): string)
		file_explorer_text = 'browsing %s', -- format string rendered when browsing a file explorer (either string or function(file_explorer_name: string): string)
		git_commit_text = 'committing changes', -- format string rendered when committing changes in git (either string or function(filename: string): string)
		plugin_manager_text = 'managing plugins', -- format string rendered when managing plugins (either string or function(plugin_manager_name: string): string)
		reading_text = 'reading %s', -- format string rendered when a read-only or unmodifiable file is loaded in the buffer (either string or function(filename: string): string)
		workspace_text = 'working on %s', -- format string rendered when in a git repository (either string or function(project_name: string|nil, filename: string): string)
		line_number_text = 'line %s out of %s', -- format string rendered when `enable_line_number` is set to true (either string or function(line_number: number, line_count: number): string)
	},
}
```

## final words

after having gone through all my config, you should be able to make something great for yourself! just make sure to remember that while it's ok to copy elements from other people's configs, those are designed to be used by them, and they might not always apply to you, so make sure you know what you're copying, and don't be afraid to change it up if you think a different strategy would work best for you! my biggest recommendation would be to start small, and slowly add on plugins that you will use, rather than just throwing on anything that looks cool (i've been guilty of this and it can be a real pain when something breaks and i don't know which of my many plugins is the culprit).

thanks for reading, and best of luck with your own neovim config!

[0]: https://github.com/redxtech/dotfiles/tree/master/.config/nvim
[1]: https://github.com/redxtech/dotfiles/tree/393f8a5/.config/nvim
[2]: https://github.com/folke/lazy.nvim
[3]: https://github.com/LazyVim/LazyVim.nvim
[4]: https://lazyvim.org
[5]: https://github.com/wbthomason/packer.nvim
[6]: https://www.lazyvim.org/keymaps#lsp
