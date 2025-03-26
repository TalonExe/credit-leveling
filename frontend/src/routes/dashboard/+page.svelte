<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import WalletInfo from '$lib/components/WalletInfo.svelte';
	import { getCreditData } from '$lib/utils/contractUtils';
	import { onMount } from 'svelte';
	import { walletAddress, updateWalletState } from '$lib/stores/walletStore';

	let supplyBalance = $state(100);
	let borrowBalance = $state(100);
	let netApy = $state(1.63);
	let borrowLimit = $state(192022.08);
	let currentBalance = $state(120000.05);
	let percentage = $derived((currentBalance / borrowLimit) * 100);
	let showBorrowPopup = $state(false);
	let borrowAmount = $state('');
	let maxBorrowAmount = $state(0);
	let creditScore = $state(0);
	let borrowPercentage = $state(70);
	const MAX_TOTAL_ETH = 10000;

	let supplyMarkets = $state([
		{ image: '', name: 'Dai', apy: '4.65%', wallet: '$1000', collateral: true },
		{ image: '', name: 'USD Coin', apy: '-4.7%', wallet: '$190', collateral: false },
		{ image: '', name: 'Tether', apy: '1.08%', wallet: '$1660', collateral: true }
	]);

	let borrowMarkets = $state([
		{ image: '', name: 'Wrapped BTC', apy: '4.65%', wallet: '$500', limit: '20' },
		{ image: '', name: 'Theter', apy: '2.65%', wallet: '$6904', limit: '20' }
	]);

	async function updateCreditData() {
		try {
			if ($walletAddress) {
				console.log('Wallet address:', $walletAddress);

				const creditData = await getCreditData($walletAddress);
				console.log('Raw credit data:', creditData);

				// Ensure we're getting a number
				creditScore = Number(creditData.score);
				console.log('Credit score (number):', creditScore);

				// Calculate values immediately
				borrowPercentage = 70 + creditScore / 200;
				console.log('Borrow percentage:', borrowPercentage);

				const calculatedAmount = ((creditScore / 100 + borrowPercentage) / 100) * 10000;
				console.log('Calculated amount before cap:', calculatedAmount);

				maxBorrowAmount = Math.min(calculatedAmount, MAX_TOTAL_ETH);
				console.log('Final max borrow amount:', maxBorrowAmount);
			}
		} catch (error) {
			console.error('Error updating credit data:', error);
		}
	}

	// Listen for account changes
	onMount(async () => {
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', async (accounts) => {
				await updateWalletState(accounts);
				await updateCreditData();
			});

			await updateCreditData();
			const interval = setInterval(updateCreditData, 30000);
			return () => clearInterval(interval);
		}
	});

	function toggleBorrowPopup() {
		showBorrowPopup = !showBorrowPopup;
	}

	function handleBorrow() {
		const amount = parseFloat(borrowAmount);
		if (amount >= 1 && amount <= maxBorrowAmount) {
			console.log('Borrowing:', amount);
			toggleBorrowPopup();
		}
	}
</script>

<div class="relative z-10 min-h-screen bg-black p-6 text-white">
	<video
		autoplay
		loop
		muted
		playsinline
		class="-z-5 fixed left-0 top-0 h-full w-full object-cover opacity-50"
	>
		<source src="src/lib/assets/background.mp4" type="video/mp4" />
	</video>
	<Navbar />
	<div class="ml-20 mr-20 mt-10 flex justify-between">
		<div class=" flex flex-col items-center">
			<span class="m-2 text-2xl font-semibold">Supply Balance:</span>
			<span class="m-4 text-3xl font-semibold text-green-400">${supplyBalance}</span>
			<button class="mt-2 rounded-full bg-yellow-500 px-4 py-2 text-black">Supply</button>
		</div>

		<div
			class="h-50 w-50 relative flex items-center justify-center rounded-full border-[10px] border-transparent text-lg font-bold text-white"
		>
			<span class="absolute m-10 flex justify-center p-10 text-center text-4xl font-bold"
				>Net APY: {netApy}%</span
			>
			<div
				class="absolute inset-0 rounded-full border-[10px] border-transparent"
				style="border-image: url('src/lib/assets/smallbackground.png') 30 round;"
			></div>
		</div>

		<div class="flex flex-col items-center">
			<span class="m-2 text-2xl font-semibold">Borrow Balance:</span>
			<span class="m-4 text-3xl font-semibold text-red-400">${borrowBalance}</span>
			<button
				class="mt-2 rounded-full bg-yellow-500 px-4 py-2 text-black"
				on:click={toggleBorrowPopup}>Borrow</button
			>
		</div>
	</div>

	{#if showBorrowPopup}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
			<div class="w-96 rounded-lg bg-gray-800 p-6 shadow-2xl">
				<h3 class="mb-4 text-xl font-bold">Borrow ETH</h3>
				<div class="mb-4">
					<p class="text-sm text-gray-400">Your Credit Score: {creditScore}</p>
					<p class="text-sm text-gray-400">Borrow Percentage: {borrowPercentage.toFixed(1)}%</p>
					<p class="text-sm text-gray-400">
						Maximum Borrow Amount: {maxBorrowAmount.toFixed(2)} ETH
					</p>
					<p class="text-sm text-gray-400">Minimum Borrow Amount: 1 ETH</p>
					<p class="text-sm text-gray-400">Maximum Total ETH: {MAX_TOTAL_ETH} ETH</p>
				</div>
				<input
					type="number"
					bind:value={borrowAmount}
					placeholder="Enter amount to borrow (min: 1 ETH)"
					class="mb-4 w-full rounded bg-gray-700 p-2 text-white"
					max={maxBorrowAmount}
					min="1"
					step="0.01"
				/>
				<div class="flex justify-end gap-2">
					<button
						class="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
						on:click={toggleBorrowPopup}
					>
						Cancel
					</button>
					<button
						class="rounded bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-600"
						on:click={handleBorrow}
						disabled={!borrowAmount ||
							parseFloat(borrowAmount) < 1 ||
							parseFloat(borrowAmount) > maxBorrowAmount}
					>
						Borrow
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="relative mt-4 h-2 w-full bg-gray-700">
		<div class="h-2 bg-green-400" style="width: {percentage}%;"></div>
		<span class="absolute left-0 text-xs text-gray-400">Current Balance: ${currentBalance}</span>
		<span class="absolute right-0 text-xs text-gray-400">${borrowLimit}</span>
	</div>

	<div class="mt-10 grid grid-cols-2 gap-6">
		<div class="rounded-lg bg-gray-800 p-6 opacity-80">
			<h2 class="text-xl font-bold">Supply Markets</h2>
			<div class="w-[80]% my-3 border-t border-gray-400"></div>
			<table class="mt-4 w-full">
				<thead>
					<tr class="text-left">
						<th>Icon</th><th>Assets</th><th>APY</th><th>Wallet</th><th>Collateral</th>
					</tr>
				</thead>
				<tbody>
					{#each supplyMarkets as market}
						<tr>
							<td class="py-2">{market.image}</td>
							<td class="py-2">{market.name}</td>
							<td class="py-2">{market.apy}</td>
							<td class="py-2">{market.wallet}</td>
							<td class="py-2"
								><input type="checkbox" checked={market.collateral} class="toggle" /></td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="rounded-lg bg-gray-800 p-6 opacity-80">
			<h2 class="text-xl font-bold">Borrow Markets</h2>
			<div class="my-3 w-[80%] border-t border-gray-400"></div>
			<table class="mt-4 w-full">
				<thead>
					<tr class="text-left">
						<th>Icon</th><th>Assets</th><th>APY</th><th>Wallet</th><th>% of Limit</th>
					</tr>
				</thead>
				<tbody>
					{#each borrowMarkets as market}
						<tr>
							<td class="py-2">{market.image}</td>
							<td class="py-2">{market.name}</td>
							<td class="py-2">{market.apy}</td>
							<td class="py-2">{market.wallet}</td>
							<td class="py-2"><div class="h-2 bg-red-400" style="width:{market.limit}%"></div></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.toggle {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 34px;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .toggle-slider {
		background-color: #2196f3;
	}

	input:checked + .toggle-slider:before {
		transform: translateX(26px);
	}
</style>
