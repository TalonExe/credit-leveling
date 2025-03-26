<script>
	import WalletButton from './WalletButton.svelte';
</script>

<nav class="relative z-50 flex items-center justify-center text-lg">
	<div class="flex gap-10">
		<a href="/dashboard" class="hover:underline">Home</a>
		<a href="/profile" class="hover:underline">Profile</a>
		<a href="/missions" class="hover:underline">Missions</a>
	</div>
	<WalletButton />
</nav>
