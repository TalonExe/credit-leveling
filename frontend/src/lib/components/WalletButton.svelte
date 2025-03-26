<script>
	import { onMount } from 'svelte';
	import {
		walletAddress,
		isConnected,
		connectWallet,
		updateWalletState
	} from '$lib/stores/walletStore';

	// Check if the wallet is already connected
	onMount(async () => {
		if (window.ethereum) {
			try {
				// Check if already connected
				const accounts = await window.ethereum.request({ method: 'eth_accounts' });
				await updateWalletState(accounts);

				// Listen for account changes
				window.ethereum.on('accountsChanged', async (accounts) => {
					await updateWalletState(accounts);
				});

				// Listen for chain changes
				window.ethereum.on('chainChanged', () => {
					window.location.reload();
				});
			} catch (error) {
				console.error('Error checking wallet connection:', error);
			}
		}
	});
</script>

<button
	class="absolute end-full right-10 z-20 rounded-full bg-yellow-500 px-4 py-2 text-black transition-colors hover:bg-yellow-600"
	on:click={connectWallet}
>
	{#if $isConnected}
		{$walletAddress.slice(0, 6)}...{$walletAddress.slice(-4)}
	{:else}
		Connect Wallet
	{/if}
</button>
