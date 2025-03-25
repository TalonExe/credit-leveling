import { expect } from "chai";
import pkg from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const { ethers } = pkg;

describe("CreditSystem Loan Functions", function () {
  // Define a fixture to deploy the contract and set up initial state
  async function deployCreditSystemFixture() {
    const [owner, borrower, lender, otherUser] = await ethers.getSigners();

    const CreditSystemFactory = await ethers.getContractFactory("CreditSystem");
    const credit = await CreditSystemFactory.deploy();
    await credit.waitForDeployment();

    return { credit, owner, borrower, lender, otherUser };
  }

  describe("Loan Creation", function () {
    it("Should allow users to request a loan", async function () {
      const { credit, borrower } = await loadFixture(deployCreditSystemFixture);
      const initialScore = await credit.creditScores(borrower.address);

      // Request a loan (0.1 ETH, 30 days, 5% interest)
      const amount = ethers.parseEther("0.1");
      const durationDays = 30;
      const interestRate = 500; // 5.00% in basis points

      await credit
        .connect(borrower)
        .requestLoan(amount, durationDays, interestRate);

      // Check loanCount increased
      expect(await credit.loanCount()).to.equal(1);

      // Check borrower received BORROWING_POINTS
      const newScore = await credit.creditScores(borrower.address);
      // Convert to BigInt before adding to avoid type mixing
      expect(newScore).to.equal(initialScore + BigInt(30)); // BORROWING_POINTS = 30

      // Check loan details
      const [
        borrowerAddr,
        lenderAddr,
        loanAmount,
        dueDate,
        loanInterestRate,
        repaid,
        active,
      ] = await credit.getLoanDetails(1);

      expect(borrowerAddr).to.equal(borrower.address);
      expect(lenderAddr).to.equal(ethers.ZeroAddress);
      expect(loanAmount).to.equal(amount);
      expect(loanInterestRate).to.equal(interestRate);
      expect(repaid).to.be.false;
      expect(active).to.be.true;
    });

    it("Should reject loan requests with invalid parameters", async function () {
      const { credit, borrower } = await loadFixture(deployCreditSystemFixture);

      // Zero amount
      await expect(
        credit.connect(borrower).requestLoan(0, 30, 500)
      ).to.be.revertedWith("Amount must be greater than 0");

      // Zero duration
      await expect(
        credit.connect(borrower).requestLoan(ethers.parseEther("0.1"), 0, 500)
      ).to.be.revertedWith("Duration must be greater than 0");

      // Interest rate too high (over 30%)
      await expect(
        credit.connect(borrower).requestLoan(ethers.parseEther("0.1"), 30, 3100)
      ).to.be.revertedWith("Interest rate too high");
    });
  });

  describe("Loan Funding", function () {
    it("Should allow users to fund a loan", async function () {
      const { credit, borrower, lender } = await loadFixture(
        deployCreditSystemFixture
      );

      // Request a loan
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 30, 500);

      // Get borrower's initial balance
      const initialBorrowerBalance = await ethers.provider.getBalance(
        borrower.address
      );
      const initialLenderScore = await credit.creditScores(lender.address);

      // Fund the loan
      await credit.connect(lender).fundLoan(1, { value: amount });

      // Check lender received LENDING_POINTS
      const newLenderScore = await credit.creditScores(lender.address);
      // Convert to BigInt before adding to avoid type mixing
      expect(newLenderScore).to.equal(initialLenderScore + BigInt(50)); // LENDING_POINTS = 50

      // Check loan details updated
      const [, lenderAddr, , , , , active] = await credit.getLoanDetails(1);
      expect(lenderAddr).to.equal(lender.address);
      expect(active).to.be.true;

      // Check borrower received the funds
      const finalBorrowerBalance = await ethers.provider.getBalance(
        borrower.address
      );
      expect(finalBorrowerBalance - initialBorrowerBalance).to.equal(amount);
    });

    it("Should reject funding with incorrect amount", async function () {
      const { credit, borrower, lender } = await loadFixture(
        deployCreditSystemFixture
      );

      // Request a loan for 0.1 ETH
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 30, 500);

      // Try to fund with incorrect amount (0.05 ETH)
      await expect(
        credit.connect(lender).fundLoan(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Incorrect amount");
    });

    it("Should prevent borrower from funding their own loan", async function () {
      const { credit, borrower } = await loadFixture(deployCreditSystemFixture);

      // Request a loan
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 30, 500);

      // Try to fund own loan
      await expect(
        credit.connect(borrower).fundLoan(1, { value: amount })
      ).to.be.revertedWith("Cannot fund your own loan");
    });

    it("Should prevent funding an already funded loan", async function () {
      const { credit, borrower, lender, otherUser } = await loadFixture(
        deployCreditSystemFixture
      );

      // Request and fund a loan
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 30, 500);
      await credit.connect(lender).fundLoan(1, { value: amount });

      // Try to fund it again
      await expect(
        credit.connect(otherUser).fundLoan(1, { value: amount })
      ).to.be.revertedWith("Loan already funded");
    });
  });

  describe("Loan Repayment", function () {
    it("Should allow borrower to repay a loan with interest", async function () {
      const { credit, borrower, lender } = await loadFixture(
        deployCreditSystemFixture
      );

      // Request and fund a loan (0.1 ETH, 5% interest)
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 30, 500);
      await credit.connect(lender).fundLoan(1, { value: amount });

      // Calculate repayment amount (principal + interest)
      const repaymentAmount = await credit.calculateRepaymentAmount(1);
      const interestRate = BigInt(500);
      const basisPoints = BigInt(10000);
      const expectedRepayment = amount + (amount * interestRate) / basisPoints; // 0.1 ETH + 5% interest
      expect(repaymentAmount).to.equal(expectedRepayment);

      // Get initial balances and scores
      const initialLenderBalance = await ethers.provider.getBalance(
        lender.address
      );
      const initialBorrowerScore = await credit.creditScores(borrower.address);

      // Repay the loan
      await credit.connect(borrower).repayLoan(1, { value: repaymentAmount });

      // Check loan is marked as repaid
      const [, , , , , repaid, active] = await credit.getLoanDetails(1);
      expect(repaid).to.be.true;
      expect(active).to.be.false;

      // Check lender received the repayment
      const finalLenderBalance = await ethers.provider.getBalance(
        lender.address
      );
      expect(finalLenderBalance - initialLenderBalance).to.equal(
        repaymentAmount
      );

      // Check borrower received REPAYMENT_POINTS
      const finalBorrowerScore = await credit.creditScores(borrower.address);
      // Convert to BigInt before adding to avoid type mixing
      expect(finalBorrowerScore).to.equal(initialBorrowerScore + BigInt(100)); // REPAYMENT_POINTS = 100
    });

    it("Should handle late repayments (no points)", async function () {
      const { credit, borrower, lender } = await loadFixture(
        deployCreditSystemFixture
      );

      // Request and fund a loan (0.1 ETH, 5% interest, 10 days)
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 10, 500);
      await credit.connect(lender).fundLoan(1, { value: amount });

      // Fast forward time past due date (11 days)
      await time.increase(11 * 24 * 60 * 60);

      // Get initial score
      const initialBorrowerScore = await credit.creditScores(borrower.address);

      // Repay the loan
      const repaymentAmount = await credit.calculateRepaymentAmount(1);
      await credit.connect(borrower).repayLoan(1, { value: repaymentAmount });

      // Check borrower did NOT receive REPAYMENT_POINTS (late repayment)
      const finalBorrowerScore = await credit.creditScores(borrower.address);
      expect(finalBorrowerScore).to.equal(initialBorrowerScore); // No additional points
    });
  });

  describe("Loan Cancellation", function () {
    it("Should allow borrower to cancel an unfunded loan", async function () {
      const { credit, borrower } = await loadFixture(deployCreditSystemFixture);

      // Request a loan
      await credit
        .connect(borrower)
        .requestLoan(ethers.parseEther("0.1"), 30, 500);

      // Cancel the loan
      await credit.connect(borrower).cancelLoan(1);

      // Check loan is no longer active
      const [, , , , , , active] = await credit.getLoanDetails(1);
      expect(active).to.be.false;
    });

    it("Should prevent cancelling a funded loan", async function () {
      const { credit, borrower, lender } = await loadFixture(
        deployCreditSystemFixture
      );

      // Request and fund a loan
      const amount = ethers.parseEther("0.1");
      await credit.connect(borrower).requestLoan(amount, 30, 500);
      await credit.connect(lender).fundLoan(1, { value: amount });

      // Try to cancel the funded loan
      await expect(credit.connect(borrower).cancelLoan(1)).to.be.revertedWith(
        "Loan already funded"
      );
    });
  });

  describe("Loan Queries", function () {
    it("Should return all active loan requests", async function () {
      const { credit, borrower } = await loadFixture(deployCreditSystemFixture);

      // Create 3 loans, cancel one
      await credit
        .connect(borrower)
        .requestLoan(ethers.parseEther("0.1"), 30, 500); // ID: 1
      await credit
        .connect(borrower)
        .requestLoan(ethers.parseEther("0.2"), 45, 600); // ID: 2
      await credit
        .connect(borrower)
        .requestLoan(ethers.parseEther("0.3"), 60, 700); // ID: 3
      await credit.connect(borrower).cancelLoan(2); // Cancel loan 2

      // Get active loan requests
      const activeLoans = await credit.getActiveLoanRequests();

      // Should return loans 1 and 3 (loan 2 cancelled)
      expect(activeLoans.length).to.equal(2);
      expect(activeLoans[0]).to.equal(1);
      expect(activeLoans[1]).to.equal(3);
    });

    it("Should track user loans and lendings", async function () {
      const { credit, borrower, lender } = await loadFixture(
        deployCreditSystemFixture
      );

      // Create multiple loans
      await credit
        .connect(borrower)
        .requestLoan(ethers.parseEther("0.1"), 30, 500); // ID: 1
      await credit
        .connect(lender)
        .requestLoan(ethers.parseEther("0.2"), 45, 600); // ID: 2

      // Fund loans
      await credit
        .connect(lender)
        .fundLoan(1, { value: ethers.parseEther("0.1") });
      await credit
        .connect(borrower)
        .fundLoan(2, { value: ethers.parseEther("0.2") });

      // Get borrower's loans and lendings
      const borrowerLoans = await credit.getUserLoans(borrower.address);
      const borrowerLendings = await credit.getUserLendings(borrower.address);

      // Get lender's loans and lendings
      const lenderLoans = await credit.getUserLoans(lender.address);
      const lenderLendings = await credit.getUserLendings(lender.address);

      // Check correct tracking
      expect(borrowerLoans.length).to.equal(1);
      expect(borrowerLoans[0]).to.equal(1);
      expect(borrowerLendings.length).to.equal(1);
      expect(borrowerLendings[0]).to.equal(2);

      expect(lenderLoans.length).to.equal(1);
      expect(lenderLoans[0]).to.equal(2);
      expect(lenderLendings.length).to.equal(1);
      expect(lenderLendings[0]).to.equal(1);
    });

    it("Should calculate interest and repayment amounts correctly", async function () {
      const { credit, borrower } = await loadFixture(deployCreditSystemFixture);

      // Request a loan with 10% interest
      const principal = ethers.parseEther("0.5");
      const interestRate = 1000; // 10%
      await credit.connect(borrower).requestLoan(principal, 30, interestRate);

      // Calculate interest
      const interest = await credit.calculateLoanInterest(1);
      const expectedInterest =
        (principal * BigInt(interestRate)) / BigInt(10000);
      expect(interest).to.equal(expectedInterest);

      // Calculate total repayment
      const repayment = await credit.calculateRepaymentAmount(1);
      expect(repayment).to.equal(principal + expectedInterest);
    });
  });
});
