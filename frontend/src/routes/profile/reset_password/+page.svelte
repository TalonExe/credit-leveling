<script lang="ts">
	let oldPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	let showPopup = false;
	let popupMessage = '';

	function handleReset() {
		if (newPassword === confirmPassword) {
			popupMessage = 'Password reset successfully!';
			showPopup = true;
			oldPassword = '';
			newPassword = '';
			confirmPassword = '';
		} else {
			popupMessage = 'Passwords do not match!';
			showPopup = true;
		}
	}

	function navigateToProfile() {
		window.location.href = '/profile/update_profile';
	}
</script>

<div class="background"></div>

<div class="dark-overlay"></div>

<nav>
	<div>
		<a href="/">Home</a>
		<a href="/profile/update_profile">Profile</a>
		<a href="/missions">Missions</a>
		<a href="/borrow-lend">Borrowing & Lending</a>
	</div>
	<a href="/signup" class="sign-up-btn">Sign Up</a>
</nav>

<div class="reset-password-container">
	<h2>Reset Password</h2>

	<div class="form-group">
		<label for="old-password">Old Password</label>
		<input
			id="old-password"
			type="password"
			bind:value={oldPassword}
			placeholder="Enter your old password"
		/>
	</div>

	<div class="form-group">
		<label for="new-password">New Password</label>
		<input
			id="new-password"
			type="password"
			bind:value={newPassword}
			placeholder="Enter your new password"
		/>
	</div>

	<div class="form-group">
		<label for="confirm-password">Confirm New Password</label>
		<input
			id="confirm-password"
			type="password"
			bind:value={confirmPassword}
			placeholder="Confirm your new password"
		/>
	</div>

	<button type="button" on:click={handleReset}>Confirm</button>

	<button on:click={navigateToProfile} style="background-color: gray;">Back to Profile</button>
</div>

{#if showPopup}
	<div class="popup-overlay">
		<div class="popup">
			<p>{popupMessage}</p>
			<button on:click={() => (showPopup = false)}>Close</button>
		</div>
	</div>
{/if}

<style>
	.reset-password-container {
		display: flex;
		flex-direction: column;
		padding: 50px;
		max-width: 500px;
		margin: 0 auto;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 10px;
		color: white;
		transform: translate(0%, 20%);
	}

	.form-group {
		margin-bottom: 20px;
		z-index: 10;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-size: 16px;
	}

	.form-group input {
		width: 96%;
		padding: 10px;
		margin-top: 5px;
		border-radius: 5px;
		background-color: #f0f0f0;
		border: 1px solid #ddd;
		z-index: 10;
	}

	button {
		width: 100%;
		padding: 12px;
		background-color: #f39c12;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		z-index: 10;
		margin-bottom: 15px;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		background: rgba(0, 0, 0, 0.6);
		position: fixed;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 100;
	}

	nav a {
		color: white;
		text-decoration: none;
		margin: 0 15px;
		font-size: 18px;
	}

	.sign-up-btn {
		background: gold;
		padding: 10px 20px;
		border-radius: 5px;
		color: black;
		font-weight: bold;
	}

	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url('/profile_background.png');
		background-size: cover;
		background-position: center;
		z-index: -1;
	}

	.dark-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.1);
		z-index: 0;
	}

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
	}

	.popup {
		position: fixed;
		top: 30%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		padding: 20px;
		border-radius: 10px;
		width: 300px;
		text-align: center;
		color: white;
	}

	.popup button {
		background-color: #f39c12;
		padding: 10px;
		border-radius: 5px;
		color: white;
		border: none;
		cursor: pointer;
		margin-top: 15px;
	}
</style>
