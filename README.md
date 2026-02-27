# WIP

TODO : make a better readme someday 🙂

In gist: this repo is meant to house web app(s) for filling, loading, & saving TTRPG character sheets. Mostly for me & my games/tables to avoid needing to use comprehensive VTTs or paid options when ppl simply wanna manage a character on their phone...

The preference is to leverage free rules only in-app with guidance, but support free-text/freeform inputs abound.

Intended game systems to support:

1. [D&D 5e 2014](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf)
   - [sidekicks](https://media.wizards.com/2018/dnd/downloads/UA_Sidekicks.pdf)
1. [Level Up Advanced 5e (a5e)](https://a5esrd.com/a5esrd)
1. [Shadowdark RPG](https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf?srsltid=AfmBOoo2tasd5Vmqw4pQUZeBqLUxPHC6KcsXaV30qGvyYOpLgMt2FQwu) (i.e. [shadowdarklings.net](https://shadowdarklings.net/characters#!))
1. [Cairn v1](https://cairnrpg.com/first-edition/cairn-srd/)
1. [Cairn v2](https://cairnrpg.com/second-edition/)
1. [D&D 5e 2024](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf)
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
   1. [x] shadowdark
   1. [x] cairn 1e
1. [x] consider how to be intentional with UI implementations to make character sheet data & components modular across systems
1. [ ] implement after deciding on a lib/framework
   - ~~vanilla html, css, js is attractive to enable custom & local hosting~~
   - component based frameworks such as ~~React or~~ Svelte are attractive to augment modular code design...
   - [ ] 5e 2014 sidekicks
   - [ ] 5e 2014
   - [ ] shadowdark
   - [ ] cairn v1
   - [ ] a5e
   - [ ] cairn v2
   - [ ] 5e 2024
1. [x] host somewhere...
   - [x] on github pages to start?
1. [ ] support import / export
   - client-based integration to start (preferably to dropbox or drive etc. eventually)
     - [ ] json
     - [ ] editable charsheet pdf would be lit
     - markdown import/export may be a goal as well?
   - support a backup tool
     - external cloud?: gdrive, dropbox?
     - integrated db?: mongo / postgres? (would likely require deployment migration to AWS, cloudflare, etc.)

The rest of the readme is WIP as i play with UI frameworks etc.

## maintaining

```bash
npm i  # prefer node 20
```

### running dev

```bash
npm run dev
```

### running "prod"

```bash
npm run build
```

Open build/index.html in local browser. May require disabling of CORS?

### deploying

```bash
npm run deploy
```

FTODO: use github actions for cicd instead of manual with gh-pages?
https://github.com/svelterust/counter/blob/main/.github/workflows/deploy.yml
