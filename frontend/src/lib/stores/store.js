import { writable } from 'svelte/store';
import { ethers } from 'ethers';

export const account = writable(null);
export const contract = writable(null);

const contractAddress = 'YOUR_DEPLOYED_ADDRESS';
const contractABI = [
	/* Your contract ABI */
];

export function initContract(provider) {
	const ethProvider = new ethers.providers.Web3Provider(provider);
	const signer = ethProvider.getSigner();
	const creditContract = new ethers.Contract(contractAddress, contractABI, signer);
	contract.set(creditContract);
}
