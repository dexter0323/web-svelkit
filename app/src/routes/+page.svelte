<script>
	import { onMount } from 'svelte';
	let message = '';
	let isLoading = false;
	let isLoggedIn = false;

	onMount(async () => {
		const response = await fetch('http://localhost:3000/login', {
			credentials: 'include'
		});
		const data = await response.json();
		message = await data.message;
		isLoggedIn = data.isLoggedIn;
	});

	async function login() {
		isLoading = true;
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
		message = await data.message;
		isLoggedIn = data.isLoggedIn;
	}
</script>

<h1>GPC Apps Web</h1>
{#if isLoggedIn}
	<p>You are logged in!</p>
	<p>{message}</p>
{/if}

<button on:click={login} disabled={isLoading}>
	{isLoading ? 'Loading...' : 'Login'}
</button>
