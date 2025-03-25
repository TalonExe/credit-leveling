<script>
	import { onMount } from 'svelte';
	import {
		requestLoan,
		fundLoan,
		repayLoan,
		cancelLoan,
		getActiveLoanRequests,
		getUserLoans,
		getUserLendings,
		getLoanDetails,
		calculateInterest,
		getLoanCount
	} from '$lib/utils/loan';
	import { ethers } from 'ethers';

	// User state
	let userAddress = '';

	// Error and success messages
	let error = '';
	let successMessage = '';

	// Form data
	let requestLoanAmount = 0.01;
	let requestLoanDuration = 30;
	let requestLoanInterestRate = 5;

	// Active loan data
	let activeLoanRequests = [];
	let userBorrowedLoans = [];
	let userLendingLoans = [];

	// For funding a loan
	let selectedLoanToFund = null;

	// For loan repayment
	let selectedLoanToRepay = null;
	let repaymentAmount = '';

	// Transaction status
	let isTransactionPending = false;

	onMount(async () => {
		try {
			// Request account access
			if (typeof window !== 'undefined' && window.ethereum) {
				const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
				userAddress = accounts[0];

				// Listen for account changes
				window.ethereum.on('accountsChanged', (accounts) => {
					userAddress = accounts[0];
					refreshData();
				});

				await refreshData();
			} else {
				error = 'Please install MetaMask to use this application.';
			}
		} catch (err) {
			console.error('Error connecting to wallet:', err);
			error = err.message;
		}
	});

	async function refreshData() {
		try {
			isTransactionPending = true;

			// Get active loan requests
			activeLoanRequests = await getActiveLoanRequests();

			// Get user's borrowed loans
			if (userAddress) {
				userBorrowedLoans = await getUserLoans(userAddress);
				userLendingLoans = await getUserLendings(userAddress);
			}

			error = '';
		} catch (err) {
			console.error('Error refreshing data:', err);
			error = err.message;
		} finally {
			isTransactionPending = false;
		}
	}

	async function handleRequestLoan() {
		try {
			error = '';
			successMessage = '';
			isTransactionPending = true;

			if (!requestLoanAmount || requestLoanAmount <= 0) {
				throw new Error('Please enter a valid loan amount');
			}

			if (!requestLoanDuration || requestLoanDuration <= 0) {
				throw new Error('Please enter a valid loan duration');
			}

			if (
				!requestLoanInterestRate ||
				requestLoanInterestRate <= 0 ||
				requestLoanInterestRate > 30
			) {
				throw new Error('Please enter a valid interest rate (0-30%)');
			}

			// Convert interest rate percentage to basis points
			const interestRateBasisPoints = Math.floor(requestLoanInterestRate * 100);

			// Request the loan
			const result = await requestLoan(
				requestLoanAmount,
				requestLoanDuration,
				interestRateBasisPoints
			);

			successMessage = `Loan request submitted successfully! Loan ID: ${result.loanId}`;

			// Reset form and refresh data
			requestLoanAmount = 0.01;
			requestLoanDuration = 30;
			requestLoanInterestRate = 5;

			await refreshData();
		} catch (err) {
			console.error('Error requesting loan:', err);
			error = err.message;
		} finally {
			isTransactionPending = false;
		}
	}

	async function handleFundLoan(loanId, amount) {
		try {
			error = '';
			successMessage = '';
			isTransactionPending = true;

			// Fund the loan
			await fundLoan(loanId, amount);

			successMessage = `Loan #${loanId} funded successfully!`;

			// Refresh data
			await refreshData();
		} catch (err) {
			console.error('Error funding loan:', err);
			error = err.message;
		} finally {
			isTransactionPending = false;
		}
	}

	async function handleRepayLoan(loanId, amount) {
		try {
			error = '';
			successMessage = '';
			isTransactionPending = true;

			// Repay the loan
			await repayLoan(loanId, amount);

			successMessage = `Loan #${loanId} repaid successfully!`;

			// Refresh data
			await refreshData();
		} catch (err) {
			console.error('Error repaying loan:', err);
			error = err.message;
		} finally {
			isTransactionPending = false;
		}
	}

	async function handleCancelLoan(loanId) {
		try {
			error = '';
			successMessage = '';
			isTransactionPending = true;

			// Cancel the loan
			await cancelLoan(loanId);

			successMessage = `Loan #${loanId} cancelled successfully!`;

			// Refresh data
			await refreshData();
		} catch (err) {
			console.error('Error cancelling loan:', err);
			error = err.message;
		} finally {
			isTransactionPending = false;
		}
	}

	function formatDate(date) {
		return new Date(date).toLocaleString();
	}

	function shortenAddress(address) {
		return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
	}

	function selectLoanToFund(loan) {
		selectedLoanToFund = loan;
	}

	function selectLoanToRepay(loan) {
		selectedLoanToRepay = loan;
		repaymentAmount = loan.repaymentAmount;
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-3xl font-bold">Decentralized Lending Platform</h1>

	{#if error}
		<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
			<p>{error}</p>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
			<p>{successMessage}</p>
		</div>
	{/if}

	<div class="mb-6">
		<h2 class="mb-2 text-xl font-semibold">Connected Address</h2>
		<p>{userAddress ? userAddress : 'Not connected'}</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Request Loan Form -->
		<div class="rounded bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">Request a Loan</h2>

			<div class="mb-4">
				<label class="mb-1 block text-sm font-medium" for="loanAmount"> Loan Amount (ETH) </label>
				<input
					id="loanAmount"
					type="number"
					bind:value={requestLoanAmount}
					min="0.001"
					step="0.001"
					class="w-full rounded border p-2"
				/>
			</div>

			<div class="mb-4">
				<label class="mb-1 block text-sm font-medium" for="loanDuration"> Duration (days) </label>
				<input
					id="loanDuration"
					type="number"
					bind:value={requestLoanDuration}
					min="1"
					class="w-full rounded border p-2"
				/>
			</div>

			<div class="mb-4">
				<label class="mb-1 block text-sm font-medium" for="interestRate"> Interest Rate (%) </label>
				<input
					id="interestRate"
					type="number"
					bind:value={requestLoanInterestRate}
					min="0.1"
					max="30"
					step="0.1"
					class="w-full rounded border p-2"
				/>
			</div>

			<button
				on:click={handleRequestLoan}
				disabled={isTransactionPending}
				class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
			>
				{isTransactionPending ? 'Processing...' : 'Request Loan'}
			</button>
		</div>

		<!-- Active Loan Requests -->
		<div class="rounded bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">Active Loan Requests</h2>

			{#if activeLoanRequests.length === 0}
				<p>No active loan requests found.</p>
			{:else}
				<div class="space-y-4">
					{#each activeLoanRequests as loan}
						<div class="rounded border p-4">
							<p class="font-semibold">Loan #{loan.id}</p>
							<p>Borrower: {shortenAddress(loan.borrower)}</p>
							<p>Amount: {loan.amount} ETH</p>
							<p>Interest: {loan.interestRate}%</p>
							<p>Due Date: {formatDate(loan.dueDate)}</p>

							{#if userAddress.toLowerCase() !== loan.borrower.toLowerCase()}
								<button
									on:click={() => selectLoanToFund(loan)}
									class="mt-2 rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
								>
									Fund this Loan
								</button>
							{:else}
								<button
									on:click={() => handleCancelLoan(loan.id)}
									disabled={isTransactionPending}
									class="mt-2 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 disabled:bg-gray-400"
								>
									Cancel Request
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<button
				on:click={refreshData}
				disabled={isTransactionPending}
				class="mt-4 rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100"
			>
				{isTransactionPending ? 'Refreshing...' : 'Refresh'}
			</button>
		</div>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- My Borrowed Loans -->
		<div class="rounded bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">My Borrowed Loans</h2>

			{#if userBorrowedLoans.length === 0}
				<p>You haven't borrowed any loans yet.</p>
			{:else}
				<div class="space-y-4">
					{#each userBorrowedLoans as loan, index}
						<div class="rounded border p-4">
							<p class="font-semibold">Loan #{loan.id}</p>
							<p>
								Lender: {loan.lender === ethers.ZeroAddress
									? 'Not funded yet'
									: shortenAddress(loan.lender)}
							</p>
							<p>Amount: {loan.amount} ETH</p>
							<p>Interest: {loan.interestRate}%</p>
							<p>Repayment Amount: {loan.repaymentAmount} ETH</p>
							<p>Due Date: {formatDate(loan.dueDate)}</p>
							<p>Status: {loan.repaid ? 'Repaid' : loan.active ? 'Active' : 'Cancelled'}</p>

							{#if loan.active && loan.lender !== ethers.ZeroAddress && !loan.repaid}
								<button
									on:click={() => selectLoanToRepay(loan)}
									class="mt-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
								>
									Repay Loan
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- My Lending Loans -->
		<div class="rounded bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">My Lending Loans</h2>

			{#if userLendingLoans.length === 0}
				<p>You haven't funded any loans yet.</p>
			{:else}
				<div class="space-y-4">
					{#each userLendingLoans as loan}
						<div class="rounded border p-4">
							<p class="font-semibold">Loan #{loan.id}</p>
							<p>Borrower: {shortenAddress(loan.borrower)}</p>
							<p>Amount: {loan.amount} ETH</p>
							<p>Interest: {loan.interestRate}%</p>
							<p>Expected Repayment: {loan.repaymentAmount} ETH</p>
							<p>Due Date: {formatDate(loan.dueDate)}</p>
							<p>Status: {loan.repaid ? 'Repaid' : loan.active ? 'Active' : 'Cancelled'}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Modal for Fund Loan -->
	{#if selectedLoanToFund}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div class="w-full max-w-md rounded-lg bg-white p-6">
				<h3 class="mb-4 text-xl font-semibold">Fund Loan #{selectedLoanToFund.id}</h3>

				<div class="mb-4">
					<p>Borrower: {shortenAddress(selectedLoanToFund.borrower)}</p>
					<p>Amount: {selectedLoanToFund.amount} ETH</p>
					<p>Interest Rate: {selectedLoanToFund.interestRate}%</p>
					<p>Due Date: {formatDate(selectedLoanToFund.dueDate)}</p>
				</div>

				<div class="flex space-x-4">
					<button
						on:click={() => handleFundLoan(selectedLoanToFund.id, selectedLoanToFund.amount)}
						disabled={isTransactionPending}
						class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
					>
						{isTransactionPending ? 'Processing...' : 'Confirm Funding'}
					</button>

					<button
						on:click={() => (selectedLoanToFund = null)}
						class="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal for Repay Loan -->
	{#if selectedLoanToRepay}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div class="w-full max-w-md rounded-lg bg-white p-6">
				<h3 class="mb-4 text-xl font-semibold">Repay Loan #{selectedLoanToRepay.id}</h3>

				<div class="mb-4">
					<p>Lender: {shortenAddress(selectedLoanToRepay.lender)}</p>
					<p>Principal: {selectedLoanToRepay.amount} ETH</p>
					<p>Interest: {selectedLoanToRepay.interestRate}%</p>
					<p>Total Repayment: {selectedLoanToRepay.repaymentAmount} ETH</p>
				</div>

				<div class="flex space-x-4">
					<button
						on:click={() =>
							handleRepayLoan(selectedLoanToRepay.id, selectedLoanToRepay.repaymentAmount)}
						disabled={isTransactionPending}
						class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
					>
						{isTransactionPending ? 'Processing...' : 'Confirm Repayment'}
					</button>

					<button
						on:click={() => (selectedLoanToRepay = null)}
						class="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* You can add any custom styles here */
</style>
