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
					<th>Ranking</th>
					<th>Address</th>
					<th>Score</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard as user (user.address)}
					<tr
						class={user.rank <= 3
							? `highlight-${user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : 'bronze'}`
							: ''}
					>
						<td>#{user.rank}</td>
						<td>{user.address.slice(0, 6)}...{user.address.slice(-4)}</td>
						<td>{user.score.toString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.leaderboard-container {
		background: rgba(0, 0, 0, 0.6);
		padding: 20px;
		border-radius: 10px;
		max-width: 90%;
		margin: 20px auto;
	}

	h2 {
		text-align: center;
		color: white;
		margin-bottom: 20px;
	}

	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
	}

	.leaderboard-table th,
	.leaderboard-table td {
		padding: 10px;
		border-bottom: 1px solid white;
		color: white;
	}

	.leaderboard-table th {
		background: rgba(255, 255, 255, 0.2);
	}

	.highlight-gold {
		font-weight: bold;
		color: gold;
	}

	.highlight-silver {
		font-weight: bold;
		color: silver;
	}

	.highlight-bronze {
		font-weight: bold;
		color: brown;
	}
</style>
