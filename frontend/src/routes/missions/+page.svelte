<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import UserPoints from '$lib/components/UserPoints.svelte';
	let missions = [
		{ text: 'Own 5 different coins at the same time' },
		{ text: 'Lend minimum 500USDT in total' },
		{ text: 'Connect to Gmail account' },
		{ text: 'Provide name and identification number' }
	];
</script>

<div class="relative z-10 min-h-screen bg-black p-6 text-white">
	<Navbar />
	<video
		autoplay
		loop
		muted
		playsinline
		class="fixed top-0 left-0 -z-5 h-full w-full object-cover opacity-50"
	>
		<source src="src/lib/assets/background.mp4" type="video/mp4" />
	</video>

	<h1 class="mt-8 text-center text-4xl font-bold">Missions</h1>

	<div
		class="relative mt-6 mr-20 ml-20 rounded-lg bg-gray-800 bg-cover p-4 shadow-2xl shadow-yellow-400/50"
		style="background-image:url('src/lib/assets/try.png')"
	>
		<span class="font-bold text-yellow-400">&#x1F4F0; Daily News</span>
		<p class="m-2 text-center text-2xl font-bold">
			ByBit Hack: Unveiling the $1.5 Billion Heist Linked to North Korean Hackers
		</p>
		<span class="absolute top-4 right-4 text-yellow-400">&rarr;</span>
	</div>
	<div class="mt-3 flex flex-col items-center justify-center">
		<UserPoints />
	</div>
	<TaskList />
</div>
