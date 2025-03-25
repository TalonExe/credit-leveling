<script>
	import { onMount } from 'svelte';
	import { getUsers, getCreditData } from '../utils/contractUtils'; // Import your contract interaction functions

	let users = []; // List of users from the contract
	let leaderboard = []; // Sorted list of users with rank, address, and score
	let isLoading = $state(true); // Track loading state

	onMount(async () => {
		try {
			// Fetch the list of users
			const userAddresses = await getUsers();
			console.log('User addresses:', userAddresses);

			// Fetch credit data for each user
			const userDataPromises = userAddresses.map(async (address) => {
				const creditData = await getCreditData(address);
				return {
					address,
					score: creditData.score // Assuming getCreditData returns an object with a 'score' field
				};
			});

			// Wait for all user data to be fetched
			const userData = await Promise.all(userDataPromises);

			// Sort users by score in descending order (handling BigInt)
			userData.sort((a, b) => {
				if (b.score > a.score) return 1;
				if (b.score < a.score) return -1;
				return 0;
			});

			// Add rank to each user
			leaderboard = userData.map((user, index) => ({
				rank: index + 1,
				address: user.address,
				score: user.score
			}));

			console.log('Leaderboard:', leaderboard);
		} catch (error) {
			console.error('Error fetching leaderboard data:', error);
		} finally {
			isLoading = false; // Mark loading as complete
		}
	});
</script>

<div class="leaderboard-container">
	<h2>Leaderboard</h2>
	{#if isLoading}
		<p>Loading leaderboard...</p>
	{:else}
		<table class="leaderboard-table">
			<thead>
				<tr>
					<th>Rank</th>
					<th>Address</th>
					<th>Score</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard as user (user.address)}
					<tr>
						<td>{user.rank}</td>
						<td>{user.address.slice(0, 6)}...{user.address.slice(-4)}</td>
						<td>{user.score.toString()}</td>
						<!-- Convert BigInt to string for display -->
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.leaderboard-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		font-family: Arial, sans-serif;
	}

	h2 {
		text-align: center;
		color: #333;
		margin-bottom: 20px;
	}

	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
		background-color: #fff;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.leaderboard-table th,
	.leaderboard-table td {
		padding: 12px 15px;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	.leaderboard-table th {
		background-color: #f4f4f4;
		font-weight: bold;
		color: #333;
	}

	.leaderboard-table tbody tr:hover {
		background-color: #f9f9f9;
	}

	.leaderboard-table td {
		color: #555;
	}
</style>
