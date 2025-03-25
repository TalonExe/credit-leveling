<script>
	import { onMount } from 'svelte';
	import { completeTask, getUsers, isTaskCompleted } from '../utils/contractUtils'; // Import your contract interaction functions

	let tasks = [
		{ id: 1, description: 'Bind Google Account', points: 150 },
		{ id: 2, description: 'Bind Facebook Account', points: 10 },
		{ id: 3, description: 'Interact with protocol', points: 20 }
	];

	let users = [];
	let completedTasks = $state(new Set()); // Track completed tasks
	let isLoading = $state(true); // Track loading state

	onMount(async () => {
		users = await getUsers();

		// Check which tasks are already completed by the user
		if (window.ethereum) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			const userAddress = accounts[0];

			for (const task of tasks) {
				const isCompleted = await isTaskCompleted(userAddress, task.id);
				if (isCompleted) {
					completedTasks.add(task.id); // Add completed tasks to the set
				}
			}
			console.log(completedTasks);
		}

		isLoading = false; // Mark loading as complete
	});

	async function handleCompleteTask(taskId) {
		try {
			await completeTask(taskId);
			alert('Task completed successfully!');
			completedTasks.add(taskId); // Mark the task as completed
		} catch (error) {
			console.error('Error completing task:', error);
		}
	}
</script>

<div>
	<ul class="relative z-20 mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-10">
		{#if isLoading}
			<p>Loading tasks...</p>
		{:else}
			{#each tasks as task (task.id)}
				<li class="relative">
					<div
						class="diamond absolute top-6 left-1/2 z-2 h-12 w-12 -translate-x-1/2 transform bg-cover bg-center"
						style="background-image:url('src/lib/assets/smallbackground.png')"
					></div>
					<div
						class="custom-shape m-4 flex items-center justify-between bg-gray-500 p-4 opacity-80 shadow-xl shadow-white"
					>
						<span class="text-shadow text-lg font-semibold text-yellow-200"
							>{task.description} - {task.points}</span
						>
						{#if !completedTasks.has(task.id)}
							<button on:click={() => handleCompleteTask(task.id)}>Complete</button>
						{:else}
							<span style="color: green; margin-left: 10px;">✓</span>
						{/if}
					</div>
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	button {
		margin-left: 10px;
		padding: 5px 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	button:hover {
		background-color: #0056b3;
	}
	span {
		font-weight: bold;
	}

	.custom-shape {
		width: 350px;
		height: 120px;
		clip-path: polygon(0 0, 100% 0, 100% 70%, 70% 70%, 60% 100%, 0% 100%);
		position: relative;
	}

	.custom-shape::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: rgb(15, 15, 90);
		clip-path: polygon(0 0, 100% 0, 100% 70%, 70% 70%, 60% 100%, 0% 100%);
		z-index: -1;
		right: 3px;
		bottom: 3px;
		opacity: 0.5;
	}

	.diamond {
		width: 100px;
		height: 100px;
		background: rgb(165, 120, 81);
		clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
		position: relative;
	}
</style>
