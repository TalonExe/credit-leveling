import { writable } from 'svelte/store';

export const walletAddress = writable('');
export const isConnected = writable(false);

export async function updateWalletState(accounts) {
    if (accounts && accounts.length > 0) {
        walletAddress.set(accounts[0]);
        isConnected.set(true);
    } else {
        walletAddress.set('');
        isConnected.set(false);
    }
}

export async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await updateWalletState(accounts);
            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
            return false;
        }
    } else {
        alert('Please install MetaMask or another Ethereum wallet.');
        return false;
    }
} 