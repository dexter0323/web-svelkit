<script>
	import { onMount } from 'svelte';
	let message = '';
	let isLoading = false;
	let isLoggedIn = false;

	// Define a reactive statement that runs when the component first renders
	onMount(async () => {
		const response = await fetch('http://localhost:3000/login', {
			credentials: 'include'
		});
		const data = await response.json();
		// Update the message and isLoggedIn variables with the data from the response
		message = await data.message;
		isLoggedIn = data.isLoggedIn;
	});

	async function login() {
		// Set isLoading to true to indicate that the login process has started
		isLoading = true;
		// Fetch data from the server
		const response = await fetch('http://localhost:3000/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: 'username',
				password: 'password'
			}),
			credentials: 'include'
		});

		const data = await response.json();
		// Update the message and isLoggedIn variables with the data from the response
		message = await data.message;
		isLoggedIn = data.isLoggedIn;
	}
</script>

<h1>GPC Desktop Web</h1>
{#if isLoggedIn}
	<p>You are logged in!</p>
	<p>{message}</p>
{/if}

<button on:click={login} disabled={isLoading}>
	{isLoading ? 'Loading...' : 'Login'}
</button>
