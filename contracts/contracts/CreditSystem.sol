// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CreditSystem {
    struct Task {
        uint id;
        string description;
        uint points;
        bool isActive;
    }

    struct Loan {
        uint id;
        address borrower;
        address lender;
        uint amount;
        uint dueDate;
        uint interestRate; // in basis points (1/100 of a percent)
        bool repaid;
        bool active;
    }

    address public owner;
    uint public taskCount;
    uint public loanCount;
    uint public constant LENDING_POINTS = 50; // Points earned for lending
    uint public constant BORROWING_POINTS = 30; // Points earned for borrowing
    uint public constant REPAYMENT_POINTS = 100; // Points earned for repaying on time
    uint public constant BASIS_POINTS = 10000; // 100% in basis points

    mapping(address => uint) public creditScores;
    mapping(uint => Task) public tasks;
    mapping(address => mapping(uint => bool)) public completedTasks;
    mapping(uint => Loan) public loans;
    mapping(address => uint[]) public userLoans; // Loans where user is borrower
    mapping(address => uint[]) public userLendings; // Loans where user is lender

    address[] public users;
    mapping(address => bool) public hasScore;

    // Events
    event ScoreUpdated(address indexed user, uint newScore);
    event TaskCompleted(address indexed user, uint taskId);
    event UserAdded(address indexed user);
    event LoanCreated(
        uint indexed loanId,
        address indexed borrower,
        address indexed lender,
        uint amount
    );
    event LoanFunded(uint indexed loanId, address indexed lender);
    event LoanRepaid(uint indexed loanId, address indexed borrower);

    constructor() {
        owner = msg.sender;
        _createInitialTasks();
    }

    // Task-related functions
    function _createInitialTasks() private {
        createTask("Complete 3 transactions this month", 50);
        createTask("Deposit 0.1 ETH to savings", 100);
        createTask("Complete learning module 1", 30);
    }

    function createTask(string memory description, uint points) public {
        require(msg.sender == owner, "Not authorized");
        taskCount++;
        tasks[taskCount] = Task(taskCount, description, points, true);
    }

    function completeTask(uint _taskId) external {
        require(_taskId <= taskCount, "Task does not exist");
        require(tasks[_taskId].isActive, "Task inactive");
        require(!completedTasks[msg.sender][_taskId], "Task already completed");

        creditScores[msg.sender] += tasks[_taskId].points;
        completedTasks[msg.sender][_taskId] = true;

        emit ScoreUpdated(msg.sender, creditScores[msg.sender]);
        emit TaskCompleted(msg.sender, _taskId);

        _addUserIfNeeded(msg.sender);
    }

    // Credit data function
    function getCreditData(
        address _user
    ) external view returns (uint score, uint completedCount, uint totalTasks) {
        score = creditScores[_user];
        totalTasks = taskCount;
        for (uint i = 1; i <= taskCount; i++) {
            if (completedTasks[_user][i]) completedCount++;
        }
    }

    function getUserCount() external view returns (uint) {
        return users.length;
    }

    function _addUserIfNeeded(address user) internal {
        if (!hasScore[user]) {
            users.push(user);
            hasScore[user] = true;
            emit UserAdded(user);
        }
    }

    // Lending and borrowing functionality

    // Create a loan request (as a borrower)
    function requestLoan(
        uint amount,
        uint durationDays,
        uint interestRate
    ) external returns (uint) {
        require(amount > 0, "Amount must be greater than 0");
        require(durationDays > 0, "Duration must be greater than 0");
        require(interestRate <= 3000, "Interest rate too high"); // Max 30%

        loanCount++;
        uint dueDate = block.timestamp + (durationDays * 1 days);

        loans[loanCount] = Loan({
            id: loanCount,
            borrower: msg.sender,
            lender: address(0), // Not funded yet
            amount: amount,
            dueDate: dueDate,
            interestRate: interestRate,
            repaid: false,
            active: true
        });

        userLoans[msg.sender].push(loanCount);

        // Add borrower points for requesting a loan
        creditScores[msg.sender] += BORROWING_POINTS;
        emit ScoreUpdated(msg.sender, creditScores[msg.sender]);

        _addUserIfNeeded(msg.sender);

        emit LoanCreated(loanCount, msg.sender, address(0), amount);

        return loanCount;
    }

    // Fund a loan (as a lender)
    function fundLoan(uint loanId) external payable {
        Loan storage loan = loans[loanId];

        require(loan.id > 0, "Loan does not exist");
        require(loan.active, "Loan is not active");
        require(loan.lender == address(0), "Loan already funded");
        require(msg.sender != loan.borrower, "Cannot fund your own loan");
        require(msg.value == loan.amount, "Incorrect amount");

        loan.lender = msg.sender;
        userLendings[msg.sender].push(loanId);

        // Transfer funds to borrower
        payable(loan.borrower).transfer(msg.value);

        // Add lender points for funding a loan
        creditScores[msg.sender] += LENDING_POINTS;
        emit ScoreUpdated(msg.sender, creditScores[msg.sender]);

        _addUserIfNeeded(msg.sender);

        emit LoanFunded(loanId, msg.sender);
    }

    // Repay a loan (as a borrower)
    function repayLoan(uint loanId) external payable {
        Loan storage loan = loans[loanId];

        require(loan.id > 0, "Loan does not exist");
        require(loan.active, "Loan is not active");
        require(loan.lender != address(0), "Loan not funded yet");
        require(loan.borrower == msg.sender, "Not the borrower");
        require(!loan.repaid, "Loan already repaid");

        uint interest = (loan.amount * loan.interestRate) / BASIS_POINTS;
        uint totalRepayment = loan.amount + interest;

        require(msg.value == totalRepayment, "Incorrect repayment amount");

        // Transfer funds to lender
        payable(loan.lender).transfer(msg.value);

        loan.repaid = true;
        loan.active = false;

        // Award points for repayment
        bool onTime = block.timestamp <= loan.dueDate;
        if (onTime) {
            creditScores[msg.sender] += REPAYMENT_POINTS;
            emit ScoreUpdated(msg.sender, creditScores[msg.sender]);
        }

        emit LoanRepaid(loanId, msg.sender);
    }

    // Cancel a loan request (only if not funded)
    function cancelLoan(uint loanId) external {
        Loan storage loan = loans[loanId];

        require(loan.id > 0, "Loan does not exist");
        require(loan.active, "Loan is not active");
        require(loan.lender == address(0), "Loan already funded");
        require(loan.borrower == msg.sender, "Not the borrower");

        loan.active = false;
    }

    // Get all active loan requests
    function getActiveLoanRequests() external view returns (uint[] memory) {
        uint activeCount = 0;

        // First count active loans
        for (uint i = 1; i <= loanCount; i++) {
            if (loans[i].active && loans[i].lender == address(0)) {
                activeCount++;
            }
        }

        // Then populate the array
        uint[] memory activeLoanIds = new uint[](activeCount);
        uint currentIndex = 0;

        for (uint i = 1; i <= loanCount; i++) {
            if (loans[i].active && loans[i].lender == address(0)) {
                activeLoanIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return activeLoanIds;
    }

    // Get user's borrowed loans
    function getUserLoans(address user) external view returns (uint[] memory) {
        return userLoans[user];
    }

    // Get user's lending loans
    function getUserLendings(
        address user
    ) external view returns (uint[] memory) {
        return userLendings[user];
    }

    // Get loan details
    function getLoanDetails(
        uint loanId
    )
        external
        view
        returns (
            address borrower,
            address lender,
            uint amount,
            uint dueDate,
            uint interestRate,
            bool repaid,
            bool active
        )
    {
        Loan storage loan = loans[loanId];
        require(loan.id > 0, "Loan does not exist");

        return (
            loan.borrower,
            loan.lender,
            loan.amount,
            loan.dueDate,
            loan.interestRate,
            loan.repaid,
            loan.active
        );
    }

    // Calculate total interest for a loan
    function calculateLoanInterest(uint loanId) external view returns (uint) {
        Loan storage loan = loans[loanId];
        require(loan.id > 0, "Loan does not exist");

        return (loan.amount * loan.interestRate) / BASIS_POINTS;
    }

    function isTaskCompleted(
        address user,
        uint taskId
    ) external view returns (bool) {
        return completedTasks[user][taskId];
    }

    // Calculate total repayment amount for a loan
    function calculateRepaymentAmount(
        uint loanId
    ) external view returns (uint) {
        Loan storage loan = loans[loanId];
        require(loan.id > 0, "Loan does not exist");

        uint interest = (loan.amount * loan.interestRate) / BASIS_POINTS;
        return loan.amount + interest;
    }
}
