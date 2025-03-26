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

<div class="wallet-info-container">
	<h2>Wallet Information</h2>
	<div class="info-grid">
		<div class="info-item">
			<span class="label">Wallet Address:</span>
			<span class="value"> {walletAddress}</span>
		</div>
		<div class="info-item">
			<span class="label">Credit Score:</span>
			<span class="value highlight-gold">{creditScore}</span>
		</div>
	</div>
</div>

<style>
	.wallet-info-container {
		background: rgba(0, 0, 0, 0.6);
		padding: 20px;
		border-radius: 10px;
		max-width: 90%;
		margin: 20px auto;
		color: white;
	}

	h2 {
		text-align: center;
		color: white;
		margin-bottom: 20px;
	}

	.info-grid {
		display: grid;
		gap: 15px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.label {
		color: rgba(255, 255, 255, 0.8);
	}

	.value {
		font-weight: bold;
	}

	.highlight-gold {
		color: gold;
	}
</style>
