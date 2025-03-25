// lendingService.js
import { ethers } from 'ethers';
import CreditSystemABI from '../contracts/contracts/CreditSystem.sol/CreditSystem.json';
import { env } from '$env/dynamic/public';
// Get the contract address from environment variables
const contractAddress = env.PUBLIC_CONTRACT_ADDRESS;
console.log('Contract address for lending:', contractAddress);

// Initialize the provider and contract
let provider, signer, creditContract;

async function initializeContractIfNeeded() {
	if (typeof window === 'undefined' || !window.ethereum) {
		console.error('Ethereum provider not available');
		throw new Error('Ethereum provider not available');
	}

	if (!creditContract) {
		console.log('Initializing lending contract...');
		provider = new ethers.BrowserProvider(window.ethereum);
		console.log('Provider initialized');

		signer = await provider.getSigner();
		console.log('Signer obtained:', await signer.getAddress());

		if (!contractAddress) {
			console.error('Contract address is not defined');
			throw new Error('Contract address is not defined. Check your environment variables.');
		}

		try {
			// First, check if the contract exists at the specified address
			const code = await provider.getCode(contractAddress);
			console.log('Contract code at address:', code);

			if (code === '0x') {
				console.error('No contract found at the specified address');
				throw new Error('No contract found at the specified address');
			}

			creditContract = new ethers.Contract(contractAddress, CreditSystemABI.abi, signer);
			console.log('Lending contract initialized successfully');
		} catch (error) {
			console.error('Error initializing lending contract:', error);
			throw error;
		}
	}
}

// Function to request a new loan
export async function requestLoan(amount, durationDays, interestRate) {
	await initializeContractIfNeeded();

	try {
		console.log('Requesting loan:', { amount, durationDays, interestRate });

		// Convert amount to wei
		const amountWei = ethers.parseEther(amount.toString());

		// Interest rate should be in basis points (e.g., 500 = 5%)
		const tx = await creditContract.requestLoan(amountWei, durationDays, interestRate);
		console.log('Transaction sent:', tx.hash);

		const receipt = await tx.wait();
		console.log('Loan request confirmed:', receipt);

		// Extract loan ID from the event
		const loanCreatedEvent = receipt.logs
			.map((log) => {
				try {
					return creditContract.interface.parseLog(log);
				} catch (e) {
					return null;
				}
			})
			.find((event) => event && event.name === 'LoanCreated');

		const loanId = loanCreatedEvent ? loanCreatedEvent.args[0] : null;
		console.log('New loan ID:', loanId);

		return {
			receipt,
			loanId: loanId ? Number(loanId) : null
		};
	} catch (error) {
		console.error('Error in requestLoan:', error);
		throw error;
	}
}

// Function to fund a loan
export async function fundLoan(loanId, amount) {
	await initializeContractIfNeeded();

	try {
		console.log('Funding loan:', loanId, 'with amount:', amount);

		// Convert amount to wei
		const amountWei = ethers.parseEther(amount.toString());

		const tx = await creditContract.fundLoan(loanId, { value: amountWei });
		console.log('Transaction sent:', tx.hash);

		const receipt = await tx.wait();
		console.log('Loan funding confirmed:', receipt);

		return receipt;
	} catch (error) {
		console.error('Error in fundLoan:', error);
		throw error;
	}
}

// Function to repay a loan
export async function repayLoan(loanId, amount) {
	await initializeContractIfNeeded();

	try {
		console.log('Repaying loan:', loanId, 'with amount:', amount);

		// Convert amount to wei
		const amountWei = ethers.parseEther(amount.toString());

		const tx = await creditContract.repayLoan(loanId, { value: amountWei });
		console.log('Transaction sent:', tx.hash);

		const receipt = await tx.wait();
		console.log('Loan repayment confirmed:', receipt);

		return receipt;
	} catch (error) {
		console.error('Error in repayLoan:', error);
		throw error;
	}
}

// Function to cancel a loan
export async function cancelLoan(loanId) {
	await initializeContractIfNeeded();

	try {
		console.log('Cancelling loan:', loanId);

		const tx = await creditContract.cancelLoan(loanId);
		console.log('Transaction sent:', tx.hash);

		const receipt = await tx.wait();
		console.log('Loan cancellation confirmed:', receipt);

		return receipt;
	} catch (error) {
		console.error('Error in cancelLoan:', error);
		throw error;
	}
}

// Function to get all active loan requests
export async function getActiveLoanRequests() {
	await initializeContractIfNeeded();

	try {
		const loanIds = await creditContract.getActiveLoanRequests();
		console.log('Active loan requests:', loanIds);

		// Convert BigInt to number
		const loanIdNumbers = loanIds.map((id) => Number(id));

		// Fetch details for each loan
		const loanDetails = await Promise.all(loanIdNumbers.map((id) => getLoanDetails(id)));

		return loanDetails;
	} catch (error) {
		console.error('Error in getActiveLoanRequests:', error);
		throw error;
	}
}

// Function to get user's borrowed loans
export async function getUserLoans(userAddress) {
	await initializeContractIfNeeded();

	try {
		const loanIds = await creditContract.getUserLoans(userAddress);
		console.log('User loans:', loanIds);

		// Convert BigInt to number
		const loanIdNumbers = loanIds.map((id) => Number(id));

		// Fetch details for each loan
		const loanDetails = await Promise.all(loanIdNumbers.map((id) => getLoanDetails(id)));

		return loanDetails;
	} catch (error) {
		console.error('Error in getUserLoans:', error);
		throw error;
	}
}

// Function to get user's lending loans
export async function getUserLendings(userAddress) {
	await initializeContractIfNeeded();

	try {
		const loanIds = await creditContract.getUserLendings(userAddress);
		console.log('User lendings:', loanIds);

		// Convert BigInt to number
		const loanIdNumbers = loanIds.map((id) => Number(id));

		// Fetch details for each loan
		const loanDetails = await Promise.all(loanIdNumbers.map((id) => getLoanDetails(id)));

		return loanDetails;
	} catch (error) {
		console.error('Error in getUserLendings:', error);
		throw error;
	}
}

// Function to get loan details
export async function getLoanDetails(loanId) {
	await initializeContractIfNeeded();

	try {
		console.log('Getting details for loan:', loanId);

		const details = await creditContract.getLoanDetails(loanId);
		console.log('Loan details:', details);

		// Calculate interest amount
		const interestAmount = await creditContract.calculateLoanInterest(loanId);

		// Calculate total repayment amount
		const repaymentAmount = await creditContract.calculateRepaymentAmount(loanId);

		// Format the results into a more usable object
		const formattedDetails = {
			id: loanId,
			borrower: details[0],
			lender: details[1],
			amount: ethers.formatEther(details[2]), // Convert wei to ETH
			dueDate: new Date(Number(details[3]) * 1000), // Convert timestamp to Date
			interestRate: Number(details[4]) / 100, // Convert basis points to percentage
			interestAmount: ethers.formatEther(interestAmount), // Convert wei to ETH
			repaymentAmount: ethers.formatEther(repaymentAmount), // Convert wei to ETH
			repaid: details[5],
			active: details[6]
		};

		return formattedDetails;
	} catch (error) {
		console.error('Error in getLoanDetails:', error);
		throw error;
	}
}

// Calculate loan interest given a principal and interest rate (client-side calculation)
export function calculateInterest(principal, interestRatePercent) {
	// Convert percentage to basis points
	const interestRateBasisPoints = interestRatePercent * 100;
	return (principal * interestRateBasisPoints) / 10000;
}

// Get the current loan count
export async function getLoanCount() {
	await initializeContractIfNeeded();

	try {
		const count = await creditContract.loanCount();
		console.log('Loan count:', count);
		return Number(count);
	} catch (error) {
		console.error('Error in getLoanCount:', error);
		throw error;
	}
}
