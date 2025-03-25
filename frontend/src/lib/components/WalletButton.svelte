<script>
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';

	let walletAddress = '';
	let isConnected = false;

	// Check if the wallet is already connected
	onMount(async () => {
		if (window.ethereum) {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const accounts = await provider.listAccounts();
			if (accounts.length > 0) {
				walletAddress = accounts[0].address;
				isConnected = true;
			}
		}
	});

	// Function to connect the wallet
	async function connectWallet() {
		if (window.ethereum) {
			try {
				const provider = new ethers.BrowserProvider(window.ethereum);
				const accounts = await provider.send('eth_requestAccounts', []);
				walletAddress = accounts[0];
				isConnected = true;
			} catch (error) {
				console.error('Error connecting wallet:', error);
			}
		} else {
			alert('Please install MetaMask or another Ethereum wallet.');
		}
	}
</script>

<button
	class="absolute end-full right-10 z-20 rounded-full bg-yellow-500 px-4 py-2 text-black"
	on:click={connectWallet}
>
	{#if isConnected}
		{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
	{:else}
		Connect Wallet
	{/if}
</button>
