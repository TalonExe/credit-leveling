<script lang="ts">
	let name = 'John Doe';
	let email = 'johndoe@gmail.com';
	let country = 'USA';
	let contact = '+60 168792948';

	let isEditing: { [key: string]: boolean } = {
		name: false,
		email: false,
		country: false,
		contact: false
	};

	function editProfile(field: 'name' | 'email' | 'country' | 'contact') {
		isEditing[field] = true;
	}

	function confirmProfileEdit(field: 'name' | 'email' | 'country' | 'contact', value: string) {
		isEditing[field] = false;
		if (field === 'name') name = value;
		if (field === 'email') email = value;
		if (field === 'country') country = value;
		if (field === 'contact') contact = value;
	}

	function navigateToResetPassword() {
		window.location.href = '/profile/reset_password';
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

<div class="profile-container">
	<div class="profile-left">
		<img src="/profile_icon.png" alt="" class="profile-image" />
		<h3>{name}</h3>
		<p>{email}</p>
		<p>{country}</p>
	</div>

	<div class="profile-right">
		<h3><b>Edit Profile Information</b></h3>

		<div class="profile-info">
			<div class="profile-detail">
				<strong>Name</strong>:
				{#if isEditing.name}
					<input type="text" class="edit-input" bind:value={name} />
					<button on:click={() => confirmProfileEdit('name', name)}>Confirm</button>
				{:else}
					<button on:click={() => editProfile('name')}>{name}</button>
				{/if}
			</div>

			<div class="profile-detail">
				<strong>Email</strong>:
				{#if isEditing.email}
					<input type="email" class="edit-input" bind:value={email} />
					<button on:click={() => confirmProfileEdit('email', email)}>Confirm</button>
				{:else}
					<button on:click={() => editProfile('email')}>{email}</button>
				{/if}
			</div>

			<div class="profile-detail">
				<strong>Country</strong>:
				{#if isEditing.country}
					<input type="text" class="edit-input" bind:value={country} />
					<button on:click={() => confirmProfileEdit('country', country)}>Confirm</button>
				{:else}
					<button on:click={() => editProfile('country')}>{country}</button>
				{/if}
			</div>

			<div class="profile-detail">
				<strong>Contact</strong>:
				{#if isEditing.contact}
					<input type="text" class="edit-input" bind:value={contact} />
					<button on:click={() => confirmProfileEdit('contact', contact)}>Confirm</button>
				{:else}
					<button on:click={() => editProfile('contact')}>{contact}</button>
				{/if}
			</div>

			<div class="profile-detail">
				<strong>Email Verification</strong>: Pending
			</div>

			<div class="profile-detail">
				<strong>Mobile Verification</strong>: Active
			</div>

			<div class="profile-detail">
				<strong>Status</strong>: Active
			</div>
		</div>

		<button on:click={navigateToResetPassword}>Reset Password</button>
	</div>
</div>

<style>
	/* Profile container styling */
	.profile-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
		height: 100vh;
		color: white;
		position: relative;
	}

	.profile-left {
		width: 30%;
		padding: 10px;
		text-align: center;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 10px;
		margin-right: 20px;
	}

	.profile-right {
		width: 50%;
		padding: 40px;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 10px;
	}

	.profile-image {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		margin-bottom: 10px;
	}

	.profile-info {
		color: white;
		margin: 10px 0;
	}

	.profile-detail {
		margin: 10px 0;
	}

	.edit-input {
		width: 100%;
		padding: 8px;
		margin-top: 5px;
		border-radius: 5px;
		background: #f0f0f0;
	}

	button {
		margin-top: 20px;
		padding: 10px;
		background-color: #ffffff;
		color: rgb(0, 0, 0);
		border: none;
		cursor: pointer;
		z-index: 10;
		margin-bottom: 20px;
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
</style>
