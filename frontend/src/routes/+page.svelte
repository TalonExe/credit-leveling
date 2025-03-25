<script>
	import { onMount } from 'svelte';
	import { getCreditData, completeTask, getUsers } from '$lib/utils/contract.js';

	let creditData = { score: 0, completedCount: 0, totalTasks: 0 };
	let users = [];
	let userAddress = '';
	let isMetaMaskInstalled = false;
	let isLoading = false;
	let errorMessage = '';

	// Check if MetaMask is installed
	onMount(() => {
		isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;
		console.log('MetaMask installed:', isMetaMaskInstalled);

		// Listen for account changes
		if (isMetaMaskInstalled) {
			window.ethereum.on('accountsChanged', (accounts) => {
				console.log('Accounts changed:', accounts);
				if (accounts.length > 0) {
					userAddress = accounts[0];
					loadData();
				} else {
					userAddress = '';
				}
			});
		}
	});

	// Connect to MetaMask and load data
	async function connectWallet() {
		errorMessage = '';
		isLoading = true;

		try {
			console.log('Connecting to MetaMask...');
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			console.log('Connected accounts:', accounts);

			userAddress = accounts[0];
			console.log('Selected account:', userAddress);

			await loadData();
		} catch (error) {
			console.error('Error connecting to MetaMask:', error);
			errorMessage = `Failed to connect: ${error.message || 'Unknown error'}`;
		} finally {
			isLoading = false;
		}
	}

	// Load credit data and users
	async function loadData() {
		errorMessage = '';
		isLoading = true;

		try {
			console.log('Loading data for address:', userAddress);

			// Try to get credit data
			try {
				const rawData = await getCreditData(userAddress);
				console.log('Raw credit data:', rawData);

				// Handle the tuple format
				if (Array.isArray(rawData)) {
					creditData = {
						score: Number(rawData[0]),
						completedCount: Number(rawData[1]),
						totalTasks: Number(rawData[2])
					};
				} else if (typeof rawData === 'object') {
					// For new ethers.js versions that might return an object
					creditData = {
						score: Number(rawData.score || 0),
						completedCount: Number(rawData.completedCount || 0),
						totalTasks: Number(rawData.totalTasks || 0)
					};
				}
				console.log('Processed credit data:', creditData);
			} catch (error) {
				console.error('Error getting credit data:', error);
				errorMessage = `Credit data error: ${error.message || 'Unknown error'}`;
				// Set default values
				creditData = { score: 0, completedCount: 0, totalTasks: 0 };
			}

			// Try to get users separately
			try {
				users = await getUsers();
				console.log('Users loaded:', users);
			} catch (error) {
				console.error('Error getting users:', error);
				errorMessage += ` Users error: ${error.message || 'Unknown error'}`;
				users = [];
			}
		} catch (error) {
			console.error('Error loading data:', error);
			errorMessage = `Loading failed: ${error.message || 'Unknown error'}`;
		} finally {
			isLoading = false;
		}
	}

	// Complete a task
	async function handleCompleteTask(taskId) {
		errorMessage = '';
		isLoading = true;

		try {
			console.log('Completing task:', taskId);
			await completeTask(taskId);
			console.log('Task completed successfully');
			await loadData(); // Refresh data after completing the task
		} catch (error) {
			console.error('Error completing task:', error);
			errorMessage = `Task completion failed: ${error.message || 'Unknown error'}`;
		} finally {
			isLoading = false;
		}
	}
</script>

<h1 class="text-lg font-bold">Credit System DApp</h1>

{#if errorMessage}
	<div class="error-message">
		<p>{errorMessage}</p>
	</div>
{/if}

{#if isLoading}
	<div class="loading">
		<p>Loading...</p>
	</div>
{/if}

{#if isMetaMaskInstalled}
	{#if userAddress}
		<div class="user-info">
			<p>Connected Address: {userAddress}</p>
		</div>

		<div class="credit-data">
			<h2>Your Credit Data</h2>
			<p>Score: {creditData.score}</p>
			<p>Completed Tasks: {creditData.completedCount}</p>
			<p>Total Tasks: {creditData.totalTasks}</p>
		</div>

		<div class="tasks">
			<h2>Complete a Task</h2>
			<button on:click={() => handleCompleteTask(1)} disabled={isLoading}>Complete Task 1</button>
			<button on:click={() => handleCompleteTask(2)} disabled={isLoading}>Complete Task 2</button>
			<button on:click={() => handleCompleteTask(3)} disabled={isLoading}>Complete Task 3</button>
		</div>

		<div class="users">
			<h2>Users ({users.length})</h2>
			{#if users.length > 0}
				<ul>
					{#each users as user}
						<li>{user}</li>
					{/each}
				</ul>
			{:else}
				<p>No users found</p>
			{/if}
		</div>
	{:else}
		<button on:click={connectWallet} disabled={isLoading}>Connect Wallet</button>
	{/if}
{:else}
	<p>
		Please install <a href="https://metamask.io/" target="_blank">MetaMask</a> to use this dApp.
	</p>
{/if}

<style>
	.error-message {
		background-color: #ffdddd;
		color: #ff0000;
		padding: 10px;
		margin: 10px 0;
		border-radius: 5px;
	}

	.loading {
		background-color: #ffffdd;
		padding: 10px;
		margin: 10px 0;
		border-radius: 5px;
	}

	.user-info {
		background-color: #ddffdd;
		padding: 10px;
		margin: 10px 0;
		border-radius: 5px;
	}

	button {
		margin-right: 10px;
		margin-bottom: 10px;
		padding: 8px 16px;
	}
</style>
