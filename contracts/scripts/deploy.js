import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Get the contract factory
  const CreditSystem = await hre.ethers.getContractFactory("CreditSystem");

  // Deploy the contract
  console.log("Deploying CreditSystem...");
  const credit = await CreditSystem.deploy();
  await credit.waitForDeployment(); // Use waitForDeployment() instead of deployed()

  // Get the contract address
  const contractAddress = await credit.getAddress();
  console.log("Contract deployed to:", contractAddress);

  // Export contract address to .env.local in the frontend folder
  const envPath = path.join(__dirname, "../../frontend/.env.local");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Replace or add the PUBLIC_CONTRACT_ADDRESS line
  const newEnvLine = `PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`;
  if (envContent.includes("PUBLIC_CONTRACT_ADDRESS=")) {
    // Replace the existing line
    envContent = envContent.replace(/PUBLIC_CONTRACT_ADDRESS=.*/, newEnvLine);
  } else {
    // Add the new line
    envContent += `\n${newEnvLine}\n`;
  }

  // Write the updated content back to the file
  fs.writeFileSync(envPath, envContent.trim());

  console.log(`Contract address written to ${envPath}`);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
