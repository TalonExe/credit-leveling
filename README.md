# Credit Leveling DApp

A decentralized application that implements a credit scoring system based on user activities and allows users to borrow ETH based on their credit score.

## Features

- **Credit Score System**

  - Users earn points by completing various tasks
  - Credit score affects borrowing limits and rates
  - Score ranges from 0 to 100 points

- **Borrowing System**

  - Borrow ETH based on your credit score
  - Dynamic borrowing limits (70-75% based on credit score)
  - Minimum borrow amount: 1 ETH
  - Maximum total ETH limit: 10,000 ETH
  - Real-time credit score updates

- **Task System**

  - Complete various tasks to earn credit points
  - Tasks include:
    - Owning multiple coins
    - Lending USDT
    - Connecting Gmail account
    - Providing identification

- **Wallet Integration**
  - MetaMask wallet connection
  - Real-time account switching
  - Automatic credit data updates

## Prerequisites

- Node.js (v16 or higher)
- Bun (latest version)
- MetaMask or another Ethereum wallet
- Hardhat

## Setup

### Smart Contracts

1. Navigate to the contracts directory:

```bash
cd contracts
```

2. Install dependencies:

```bash
bun install
```

3. Start a local Hardhat node:

```bash
npx hardhat node
```

4. In a new terminal, deploy the contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

5. Copy the deployed contract address and update it in your frontend environment variables

### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Connect your MetaMask wallet using the "Connect Wallet" button
2. Complete tasks to earn credit points
3. View your credit score and borrowing limits
4. Borrow ETH based on your credit score
5. Monitor your supply and borrow balances

## Technical Details

- Built with SvelteKit and Svelte 5 (Runes mode)
- Smart contracts written in Solidity
- Uses Hardhat for development and testing
- Implements a credit scoring system with dynamic borrowing limits
- Real-time updates using Svelte stores

## Development

- Frontend code is in the `frontend/src` directory
- Smart contracts are in the `contracts/contracts` directory
- Deployment scripts are in `contracts/scripts`

## License

MIT
