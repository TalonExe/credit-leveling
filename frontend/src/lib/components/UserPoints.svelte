<script>
	import { onMount } from 'svelte';
	import { getCreditData } from '../utils/contractUtils'; // Import your contract interaction functions

	let walletAddress = '';
	let points = 0;

	onMount(async () => {
		if (window.ethereum) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			walletAddress = accounts[0];
			const creditData = await getCreditData(walletAddress);
			points = creditData.score; // Assuming the credit data has a 'points' field
		}
	});
</script>

<div class="flex w-fit flex-col items-center justify-center rounded-3xl bg-blue-800 px-16 py-4">
	<h2>Your Points</h2>
	<p class="text-4xl">{points}</p>
</div>
