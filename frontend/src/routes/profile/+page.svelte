<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import WalletInfo from '$lib/components/WalletInfo.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	/*Credit Score part*/
	let score = 750;
	let scoreRange = 'Average';
	let showPopup = false;

	$: {
		if (score >= 750) scoreRange = 'Excellent';
		else if (score >= 600) scoreRange = 'Good';
		else if (score >= 500) scoreRange = 'Average';
		else scoreRange = 'Poor';
	}

	function togglePopup() {
		showPopup = !showPopup;
	}

	/* Gauge Rotation Calculation */
	// Calculate rotation angle for pointer (mapping score 300-850 to -90 to 90 degrees)
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
	<div class="mt-4 flex flex-col items-center justify-center">
		<WalletInfo />
	</div>
	{#if showPopup}
		<div
			class="popup-overlay"
			on:click={togglePopup}
			tabindex="0"
			role="button"
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? togglePopup() : null)}
		></div>

		<div class="popup">
			<h3>Credit Score Factors</h3>
			<ul>
				<li>📜 <strong>Payment History</strong> - 35%</li>
				<li>💰 <strong>Amounts Owed</strong> - 30%</li>
				<li>⏳ <strong>Length of Credit History</strong> - 15%</li>
				<li>🆕 <strong>New Credit</strong> - 10%</li>
				<li>📊 <strong>Credit Mix</strong> - 10%</li>
			</ul>
			<button class="close-btn" on:click={togglePopup}>Close</button>
		</div>
	{/if}
	<Leaderboard />
	<!-- Leaderboard Section -->
	<div class="section leaderboard">
		<h2>Leaderboard</h2>
		<table>
			<thead>
				<tr>
					<th>Ranking</th>
					<th>Name</th>
					<th>Score</th>
					<th>Wallet Age</th>
					<th>Region</th>
				</tr>
			</thead>
			<tbody>
				<tr class="highlight-gold">
					<td>#1</td>
					<td>David Stampson</td>
					<td>5800</td>
					<td>10Y 2M</td>
					<td>USA</td>
				</tr>
				<tr class="highlight-silver">
					<td>#2</td>
					<td>Evan Stephen</td>
					<td>4200</td>
					<td>8Y 4M</td>
					<td>UK</td>
				</tr>
				<tr class="highlight-bronze">
					<td>#3</td>
					<td>Peter Parker</td>
					<td>3700</td>
					<td>7Y 6M</td>
					<td>CANADA</td>
				</tr>
				<tr>
					<td>#4</td>
					<td>Hiroshi Tanaka</td>
					<td>3450</td>
					<td>13Y 5M</td>
					<td>JAPAN</td>
				</tr>
				<tr>
					<td>#5</td>
					<td>Oliver Thompson</td>
					<td>3300</td>
					<td>12Y 6M</td>
					<td>UK</td>
				</tr>
				<tr>
					<td>#6</td>
					<td>Evan Stephen</td>
					<td>4200</td>
					<td>8Y 4M</td>
					<td>UK</td>
				</tr>
				<tr>
					<td>#7</td>
					<td>Peter Parker</td>
					<td>3700</td>
					<td>7Y 6M</td>
					<td>CANADA</td>
				</tr>
				<tr>
					<td>#8</td>
					<td>Hiroshi Tanaka</td>
					<td>3450</td>
					<td>13Y 5M</td>
					<td>JAPAN</td>
				</tr>
				<tr>
					<td>#9</td>
					<td>Oliver Thompson</td>
					<td>3300</td>
					<td>12Y 6M</td>
					<td>UK</td>
				</tr>
				<tr>
					<td>#10</td>
					<td>Oliver Thompson</td>
					<td>3300</td>
					<td>12Y 6M</td>
					<td>UK</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style>
	.section {
		padding: 100px 20px;
		background: rgba(0, 0, 0, 0.35);
		margin: 20px 0;
		border-radius: 10px;
		max-width: 90%;
		margin-left: auto;
		margin-right: auto;
	}

	/* Credit Score Widget */
	.credit-score-container {
		text-align: center;
		background: rgba(0, 0, 0, 0.8);
		padding: 20px;
		border-radius: 15px;
		max-width: 600px;
		width: 600px;
		margin: auto;
		color: white;
	}

	.gauge-container {
		position: relative;
		width: 250px;
		height: 150px;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0px 173px;
	}

	.pointer {
		position: absolute;
		left: 50%;
		bottom: 0;
		width: 6px;
		height: 100px;
		background: rgb(255, 255, 255);
		border-radius: 3px;
		transform-origin: bottom;
		transition: transform 0.5s ease-in-out;
	}

	.labels {
		text-align: center;
		margin-top: 10px;
		font-weight: bold;
	}

	.ranges {
		display: flex;
		justify-content: space-between;
		margin-top: 5px;
		margin-bottom: 15px;
	}

	.range {
		font-size: 12px;
		padding: 3px 8px;
		border-radius: 5px;
	}

	.poor {
		background: #e74c3c;
		color: rgb(0, 0, 0);
	}
	.average {
		background: #ff7b00;
		color: black;
	}
	.good {
		background: #f1c40f;
		color: rgb(0, 0, 0);
	}
	.excellent {
		background: #2ecc71;
		color: rgb(0, 0, 0);
	}

	.popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 20px;
		border-radius: 10px;
		width: 300px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
		z-index: 100;
		color: black;
	}

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 99;
	}

	.close-btn {
		padding: 8px 15px;
		background: red;
		color: white;
		border: none;
		cursor: pointer;
		border-radius: 5px;
	}

	.leaderboard {
		background: rgba(0, 0, 0, 0.6);
		padding: 20px;
		border-radius: 10px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 10px;
		border-bottom: 1px solid white;
	}

	th {
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
