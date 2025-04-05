# WIP

TODO : make a better readme someday 🙂

In gist: this repo is meant to house web app(s) for filling, loading, & saving TTRPG character sheets. Mostly for me & my games/tables to avoid needing to use comprehensive VTTs or paid options when ppl simply wanna manage a character on their phone...

Intended game systems to support:

1. D&D 5e 2014
1. Level Up Advanced 5e (a5e)
1. Shadowdark RPG
1. Cairn v1
1. Cairn v2
1. D&D 5e 2024
1. other? (atla, numenara, daggerheart, etc.?)

Core Intents / Philosophies

- TTRPG gaming should be essentially free and easy for players
- TTRPG gaming should allow for you & your table to do _whatever_ it wants (within & without the official rule system)
  - Character sheets should be less opinionated overall, providing guidance but flexibility to the player
- Managing TTRPG characters should be straightforward from a phone or computer

Initial approach...

1. [ ] design a flexible & mobile UI for...
   1. [x] 5e 2014
   1. [ ] a5e
   1. [ ] shadowdark
   1. [ ] etc.
1. [ ] consider how to be intentional with UI implementations to make character sheet data & components modular across systems
1. [ ] implement after deciding on a lib/framework
   - vanilla html, css, js is attractive to enable custom & local hosting
   - component based frameworks such as React or Svelte are attractive to augment modular code design...
1. [ ] host on github pages
   - client-based integration to import & export data (preferably to dropbox or drive etc. eventually)
   - supporting markdown import/export may be a goal as well

The rest of the readme is generated / WIP etc. as i play with UI frameworks etc.

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in ez-chars
npx sv create ez-chars
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Tailwind?

```bash
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

```bash
npx @tailwindcss/cli -o tailwind4.min.css --minify
```
