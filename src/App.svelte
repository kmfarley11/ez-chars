<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'

  import charmderp2 from './assets/charmderp2.png'
  import charmderp from './assets/charmderp.png'
  import charmderp3 from './assets/derpchars.png'
</script>

<main>
  <div class="even-container">
    <a href="https://www.deviantart.com/jellythetangrowth/art/That-s-an-odd-Charmeleon-328017160" target="_blank">
      <img src={charmderp} class="logo" alt="ch1 logo"/>
    </a>
    <a href="https://www.reddit.com/r/pokemon/comments/hi9gxm/found_funny_charmeleon_face_when_rewatching/" target="_blank">
      <img src={charmderp3} class="logo" alt="chfam logo">
    </a>
    <a href="https://wall.alphacoders.com/big.php?i=669898" target="_blank">
      <img src={charmderp2} class="logo" alt="ch2 logo"/>
    </a>
  </div>

  <div>
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }

  .even-container {
    display: inline-flex;
    justify-content: space-evenly;
    max-width: 100%;
    gap: 10px;
  }
  .even-container>a {
    /* height: 300px; */
      flex: 1 1 auto;  /* shorthand for flex-grow, flex-shrink, flex-basis */
  }
  .even-container>a>img {
    object-fit: cover;
    flex: 0 1 auto;
    width: 100%;
    height: 100%;
    vertical-align: middle;
  }
</style>
