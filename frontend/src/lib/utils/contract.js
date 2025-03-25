import { ethers } from 'ethers';
import CreditSystemABI from '../contracts/contracts/CreditSystem.sol/CreditSystem.json'; // Import the ABI
import { env } from '$env/dynamic/public';
// Get the contract address from environment variables
const contractAddress = env.PUBLIC_CONTRACT_ADDRESS;
console.log('Contract address:', contractAddress);

// Initialize the provider and contract
let provider, signer, creditContract;

async function initializeContractIfNeeded() {
	if (typeof window === 'undefined' || !window.ethereum) {
		console.error('Ethereum provider not available');
		throw new Error('Ethereum provider not available');
	}

	if (!creditContract) {
		console.log('Initializing contract...');
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

			// Log the ABI being used
			console.log('ABI excerpt:', CreditSystemABI.abi.slice(0, 2));

			creditContract = new ethers.Contract(contractAddress, CreditSystemABI.abi, signer);
			console.log('Contract initialized successfully');

			// Test a simple call to the contract
			try {
				const ownerAddress = await creditContract.owner();
				console.log('Contract owner:', ownerAddress);
			} catch (error) {
				console.error('Error calling contract owner:', error);
			}
		} catch (error) {
			console.error('Error initializing contract:', error);
			throw error;
		}
	}
}

// Export functions to interact with the contract
export async function getCreditData(userAddress) {
	await initializeContractIfNeeded();

	try {
		console.log('Calling getCreditData for address:', userAddress);

		// Check if the address is valid
		if (!ethers.isAddress(userAddress)) {
			console.error('Invalid Ethereum address:', userAddress);
			throw new Error('Invalid Ethereum address');
		}

		// Try to get the credit score directly first as a test
		try {
			const score = await creditContract.creditScores(userAddress);
			console.log('Credit score from direct mapping:', score);
		} catch (error) {
			console.error('Error getting credit score directly:', error);
		}

		// Now try the actual function call
		const result = await creditContract.getCreditData(userAddress);
		console.log('Raw result from getCreditData:', result);

		return result;
	} catch (error) {
		console.error('Error in getCreditData:', error);
		throw error;
	}
}

export async function completeTask(taskId) {
	await initializeContractIfNeeded();

	try {
		console.log('Completing task:', taskId);
		const tx = await creditContract.completeTask(taskId);
		console.log('Transaction sent:', tx.hash);

		const receipt = await tx.wait();
		console.log('Transaction confirmed:', receipt);

		return receipt;
	} catch (error) {
		console.error('Error in completeTask:', error);
		throw error;
	}
}

export async function getUserCount() {
	await initializeContractIfNeeded();

	try {
		const count = await creditContract.getUserCount();
		console.log('User count:', count);
		return Number(count);
	} catch (error) {
		console.error('Error in getUserCount:', error);
		throw error;
	}
}

export async function getUsers() {
	await initializeContractIfNeeded();

	try {
		const userCount = await creditContract.getUserCount();
		console.log('Fetching', userCount, 'users');

		const users = [];
		for (let i = 0; i < userCount; i++) {
			const user = await creditContract.users(i);
			console.log('User', i, ':', user);
			users.push(user);
		}

		return users;
	} catch (error) {
		console.error('Error in getUsers:', error);
		throw error;
	}
}

export async function isTaskCompleted(userAddress, taskId) {
	await initializeContractIfNeeded();

	try {
		console.log('Checking if task is completed for address:', userAddress, 'taskId:', taskId);

		// Check if the address is valid
		if (!ethers.isAddress(userAddress)) {
			console.error('Invalid Ethereum address:', userAddress);
			throw new Error('Invalid Ethereum address');
		}

		// Call the isTaskCompleted function in the smart contract
		const isCompleted = await creditContract.isTaskCompleted(userAddress, taskId);
		console.log('Task completion status:', isCompleted);

		return isCompleted;
	} catch (error) {
		console.error('Error in isTaskCompleted:', error);
		throw error;
	}
}
