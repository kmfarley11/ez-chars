<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<script>
    let numbers = $state([1, 2, 3, 4]);
	let total = $derived(numbers.reduce((t, n) => t + n, 0));

	function addNumber() {
		numbers.push(numbers.length + 1);
		console.log(numbers);
	}

	function saveHtmlFile() {
		// const newDataRaw = `let numbers = $state([1, 2, 3, 4]);`
		// let htmlContent = document.documentElement.outerHTML.replace(
		// 		/"formData": \[([\s\S]*?)\]/,
		// 		newJSONDataRaw
		// );
		let htmlContent = document.documentElement.outerHTML;

		let blob = new Blob([htmlContent], { type: "text/html" });
		let a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "updated_form.html";
		a.click();
	}
</script>

<p>{numbers.join(' + ')} = {total}</p>

<button onclick={addNumber}>
	Add a number
</button>

<h3>Persist Changes to File</h3>
<button onclick={saveHtmlFile}>Save HTML File</button>
