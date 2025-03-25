<script>
	import { onMount } from 'svelte';
	import { getCreditData } from '../utils/contractUtils'; // Import your contract interaction functions

	let walletAddress = '';
	let creditScore = 0;

	onMount(async () => {
		if (window.ethereum) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			walletAddress = accounts[0];
			const creditData = await getCreditData(walletAddress);
			creditScore = creditData.score; // Assuming the credit data has a 'score' field
		}
	});
</script>

<div class="flex w-fit flex-col items-center justify-center rounded-3xl bg-blue-700 px-4 py-16">
	<h2>Wallet Information</h2>
	<p><strong>Wallet Address:</strong> {walletAddress}</p>
	<p><strong>Credit Score:</strong> {creditScore}</p>
</div>
