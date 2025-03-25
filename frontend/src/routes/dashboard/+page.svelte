<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import WalletInfo from '$lib/components/WalletInfo.svelte';
	let supplyBalance = 100;
	let borrowBalance = 100;
	let netApy = 1.63;
	let borrowLimit = 192022.08;
	let currentBalance = 120000.05;
	let percentage = (currentBalance / borrowLimit) * 100;

	let supplyMarkets = [
		{ image: '', name: 'Dai', apy: '4.65%', wallet: '$1000', collateral: true },
		{ image: '', name: 'USD Coin', apy: '-4.7%', wallet: '$190', collateral: false },
		{ image: '', name: 'Tether', apy: '1.08%', wallet: '$1660', collateral: true }
	];

	let borrowMarkets = [
		{ image: '', name: 'Wrapped BTC', apy: '4.65%', wallet: '$500', limit: '20' },
		{ image: '', name: 'Theter', apy: '2.65%', wallet: '$6904', limit: '20' }
	];
</script>

<div class="relative z-10 min-h-screen bg-black p-6 text-white">
	<video
		autoplay
		loop
		muted
		playsinline
		class="fixed top-0 left-0 -z-5 h-full w-full object-cover opacity-50"
	>
		<source src="src/lib/assets/background.mp4" type="video/mp4" />
	</video>
	<Navbar />
	<div class="mt-10 mr-20 ml-20 flex justify-between">
		<div class=" flex flex-col items-center">
			<span class="m-2 text-2xl font-semibold">Supply Balance:</span>
			<span class="m-4 text-3xl font-semibold text-green-400">${supplyBalance}</span>
			<button class="mt-2 rounded-full bg-yellow-500 px-4 py-2 text-black">Supply</button>
		</div>

		<div
			class="relative flex h-50 w-50 items-center justify-center rounded-full border-[10px] border-transparent text-lg font-bold text-white"
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
			<button class="mt-2 rounded-full bg-yellow-500 px-4 py-2 text-black">Borrow</button>
		</div>
	</div>

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
