// Importing styles for the transaction page
import "../../styles/transaction.css";

// Importing necessary functions from Firebase for Firestore, Authentication, and App initialization
import {
  getFirestore,
  collection,
  query,
  getDoc,
  doc,
  getDocs,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Importing icons for the application
import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";

// Configuration object for Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB1FI87qdJUDyHRP8sZTuSbOpfD9Fv8G_E",
  authDomain: "simple-biz-app.firebaseapp.com",
  projectId: "simple-biz-app",
  storageBucket: "simple-biz-app.appspot.com",
  messagingSenderId: "168574264567",
  appId: "1:168574264567:web:c3d1105732948875dd5ff2",
};

// Initializing Firebase App and obtaining Firestore and Auth instances
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Helper function to fetch transaction data from Firestore
const fetchTransactionData = async (userId, startDate, endDate) => {
  // Formatting dates for consistency
  const formattedStartDate = startDate.split("-").reverse().join("-");
  const formattedEndDate = endDate.split("-").reverse().join("-");

  // Creating a reference to the 'transactions' collection for a specific user
  const transactionsRef = collection(db, `users/${userId}/transactions`);
  // Querying the Firestore database to get transaction documents
  const querySnapshot = await getDocs(transactionsRef);

  // Mapping document data to a more usable format
  const transactions = querySnapshot.docs.map((doc) => {
    const date = doc.id; // the date is the document ID
    const transactionData = doc.data().transactions;

    return {
      date,
      transactionData,
    };
  });

  console.log("Fetched transactions:", transactions);
  return transactions;
};

// Helper function to calculate total price from transactions
const calculateTotalPrice = (transactions) => {
  // Initializing variables for total quantity and total price
  let totalQuantity = 0;
  let totalPrice = 0;

  // Iterating through each transaction and updating totals
  transactions.forEach((transaction) => {
    if (transaction.transactionData) {
      const {
        totalQuantity: transactionTotalQuantity,
        totalPrice: transactionTotalPrice,
      } = calculateTransactionTotal(transaction.transactionData);
      totalQuantity += transactionTotalQuantity;
      totalPrice += transactionTotalPrice;
    }
  });

  return { totalQuantity, totalPrice };
};

// Helper function to calculate total quantity and total price from transaction data
const calculateTransactionTotal = (transactionData) => {
  let transactionTotalQuantity = 0;
  let transactionTotalPrice = 0;

  // Iterating through each product in the transaction and updating totals
  transactionData.forEach((data) => {
    data.products.forEach((product) => {
      transactionTotalQuantity += product.quantity || 0;
      transactionTotalPrice += product.totalPrice || 0;
    });
  });

  return { transactionTotalQuantity, transactionTotalPrice };
};

// Event listener for each row in the main transaction table
let lastClickedRow = null;

const handleRowClick = async (row) => {
  // Remove the 'selected' class from the previously clicked row
  if (lastClickedRow) {
    lastClickedRow.classList.remove("selected");
  }

  // Add the 'selected' class to the clicked row
  row.classList.add("selected");
  lastClickedRow = row;

  // Extract transaction data from the clicked row's attributes
  const transactionData = JSON.parse(row.getAttribute("data-transaction"));

  // Render detailed transaction rows in the detail table
  renderDetailTransactionRows(transactionData.transactionData);
};

// Helper function to render detailed transaction rows in the detail table
const renderDetailTransactionRows = (transactionData) => {
  const detailTbody = document.querySelector("#detailTransacTable tbody");
  detailTbody.innerHTML = "";

  transactionData.forEach((data) => {
    data.products.forEach((product) => {
      const detailRow = document.createElement("tr");
      detailRow.innerHTML = `
              <td>${product.productName}</td>
              <td>${product.quantity}</td>
              <td>${product.price.toLocaleString()}</td>
              <td>${product.totalPrice.toLocaleString()}</td>
          `;

      detailTbody.appendChild(detailRow);
    });
  });
};

// Helper function to render transaction rows in the main table
const renderTransactionRows = (transactions) => {
  const tbody = document.querySelector("#transacTable tbody");
  tbody.innerHTML = "";

  transactions.forEach((transaction) => {
    if (transaction.transactionData) {
      const { transactionTotalQuantity, transactionTotalPrice } =
        calculateTransactionTotal(transaction.transactionData);

      const row = document.createElement("tr");
      row.className = "clickable-row"; // Adding a class for easy selection
      row.setAttribute("data-date", transaction.date); // Adding date attribute
      row.setAttribute("data-transaction", JSON.stringify(transaction)); // Adding transaction data attribute

      row.innerHTML = `
              <td>${transaction.date}</td>
              <td>${transactionTotalQuantity}</td>
              <td>${transactionTotalPrice.toLocaleString()}</td>
          `;

      // Add event listener for each row
      row.addEventListener("click", () => handleRowClick(row));

      tbody.appendChild(row);
    }
  });
};

// Helper function to render evaluation report rows in the table
const renderEvaluationReportRows = (highestSales, lowestSales) => {
  const highestSalesTbody = document.getElementById("highest-sales");
  const lowestSalesTbody = document.getElementById("lowest-sales");

  // Render highest sales
  highestSales.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.totalQuantity}</td>
      <td>${product.totalPrice.toLocaleString()}</td>
    `;
    highestSalesTbody.appendChild(row);
  });

  // Render lowest sales
  lowestSales.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.totalQuantity}</td>
      <td>${product.totalPrice.toLocaleString()}</td>
    `;
    lowestSalesTbody.appendChild(row);
  });
};

// Function to render the entire transaction page
const renderTransactionPage = (container) => {
  // Setting the background color of the body
  document.body.style.backgroundColor = "#F1F1FF";

  // Event handler for the "Terapkan" (Apply) button
  const handleApplyButtonClick = async () => {
    const startDate = document.getElementById("start").value;
    const endDate = document.getElementById("end").value;

    if (startDate && endDate) {
      const userId = auth.currentUser.uid;

      try {
        // Fetching transaction data based on user ID and date range
        const transactions = await fetchTransactionData(
          userId,
          startDate,
          endDate
        );

        // Calculating total quantity and total price from the fetched transactions
        const { totalQuantity, totalPrice } = calculateTotalPrice(transactions);

        // Rendering transaction rows in the table
        renderTransactionRows(transactions);

        // Calculate highest and lowest sales
        const highestSales = calculateHighestSales(transactions);
        const lowestSales = calculateLowestSales(transactions);

        // Rendering evaluation report rows
        renderEvaluationReportRows(highestSales, lowestSales);
      } catch (error) {
        // Handling errors that may occur during the fetch operation
        console.error("Error handling apply button click:", error);
      }
    }
  };

  // Helper function to calculate highest sales
  const calculateHighestSales = (transactions) => {
    // Flatten the array of transactions and products
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    // Sort products by quantity and transactionTotalPrice in descending order
    const sortedProducts = allProducts.slice().sort((a, b) => {
      const aQuantity = a.quantity || 0;
      const bQuantity = b.quantity || 0;
      const aTotalPrice = a.totalPrice || 0;
      const bTotalPrice = b.totalPrice || 0;

      // Sort by quantity in descending order first
      if (aQuantity !== bQuantity) {
        return bQuantity - aQuantity;
      }

      // If quantity is the same, then sort by transactionTotalPrice in descending order
      return bTotalPrice - aTotalPrice;
    });

    // Take the top 3-5 products
    const topProducts = sortedProducts.slice(
      0,
      Math.min(sortedProducts.length, 5)
    );

    // Map products to a format suitable for rendering
    const highestSales = topProducts.map((product) => ({
      productName: product.productName,
      totalQuantity: product.quantity || 0,
      totalPrice: product.totalPrice || 0,
    }));

    return highestSales;
  };

  // Helper function to calculate lowest sales
  const calculateLowestSales = (transactions) => {
    // Flatten the array of transactions and products
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    // Sort products by quantity and transactionTotalPrice in ascending order
    const sortedProducts = allProducts.slice().sort((a, b) => {
      const aQuantity = a.quantity || 0;
      const bQuantity = b.quantity || 0;
      const aTotalPrice = a.totalPrice || 0;
      const bTotalPrice = b.totalPrice || 0;

      // Sort by quantity in ascending order first
      if (aQuantity !== bQuantity) {
        return aQuantity - bQuantity;
      }

      // If quantity is the same, then sort by transactionTotalPrice in ascending order
      return aTotalPrice - bTotalPrice;
    });

    // Take the bottom 3-5 products
    const bottomProducts = sortedProducts.slice(
      0,
      Math.min(sortedProducts.length, 5)
    );

    // Map products to a format suitable for rendering
    const lowestSales = bottomProducts.map((product) => ({
      productName: product.productName,
      totalQuantity: product.quantity || 0,
      totalPrice: product.totalPrice || 0,
    }));

    return lowestSales;
  };

  // Populating the container with HTML content
  container.innerHTML = `
    <!-- Header section of the application -->
    <header id="mainHeader">
        <div class="main-app-bar">
            <div class="main-app-bar-title">
                <img src=${appIcon} alt="SimpleBiz Icons">
                <h1 class="main-app-title">SimpleBiz</h1>
            </div>
            <div class="main-menu-icon">
                <!-- Hamburger menu icon -->
                <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                    <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
                </svg>
            </div>
            <nav id="mainDrawer" class="main-nav">
                <ul class="main-nav-list">
                    <!-- Navigation links -->
                    <li class="nav-item"><a href="/dashboard" class="nav-link">Dashboard</a></li>
                    <li class="nav-item"><a href="/product" class="nav-link">Produk</a></li>
                    <li class="nav-item user-button">
                        <!-- User profile button -->
                        <button>
                            <img src=${userIcon} alt="User Profile">
                            <span>Nama User</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main content section of the transaction page -->
    <main class="transac-main">
        <!-- Filter container for date range selection -->
        <div class="filter-container">
            <h3 class="filter-title">Filter Tanggal</h3>
            <!-- Date input fields and apply button -->
            <input type="date" id="start" name="date-start" value="" />
            <span>-</span>
            <input type="date" id="end" name="date-end" value="" />
            <button class="apply-button" id="apply-button">Terapkan</button>
        </div>
        <!-- Transaction table section -->
        <div class="transac-content">
            <div class="table-title">
                <h2>Laporan Transaksi</h2>
            </div>
            <!-- Transaction table structure -->
            <table class="transac-table" id="transacTable">
                <thead>
                    <!-- Table headers -->
                    <tr>
                        <th>Tanggal</th>
                        <th>Jumlah Barang</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        <!-- Detailed transaction table section -->
        <div class="transac-content" id="detailTransaction">
            <div class="table-title">
                <h2>Laporan Transaksi Produk</h2>
            </div>
            <!-- Detailed transaction table structure -->
            <table class="transac-table" id="detailTransacTable">
                <thead>
                    <!-- Table headers for detailed transactions -->
                    <tr>
                        <th>Nama Barang</th>
                        <th>Jumlah Barang</th>
                        <th>Harga Satuan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        <!-- Evaluation report section -->
        <div class="transac-content">
            <div class="table-title">
                <h2>Laporan Evaluasi</h2>
            </div>
            <!-- Table structure for evaluation report -->
            <table class="transac-table" id="evaluation-report">
                <thead>
                    <!-- Table headers for evaluation report -->
                    <tr>
                        <th>Nama Barang</th>
                        <th>Total Penjualan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody id="highest-sales">
                    <!-- Special row for highest sales -->
                    <tr class="special-row">
                        <td colspan="3">Penjualan Tertinggi</td>
                    </tr>
                </tbody>
                <tbody id="lowest-sales">
                    <!-- Special row for highest sales -->
                    <tr class="special-row">
                        <td colspan="3">Penjualan Terendah</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
    <!-- Footer section of the application -->
    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
        </div>
    </footer>
    `;

  // Event listeners and interactions for navigation and button clicks
  const menuIcon = container.querySelector(".main-menu-icon");
  const navList = container.querySelector(".main-nav-list");
  const mainContent = container.querySelector(".transac-main");
  const detailTransacTable = document.getElementById("detailTransaction");

  let lastClickedRow = null;

  const navItems = container.querySelectorAll(".nav-item a");

  mainContent.addEventListener("click", () => {
    navList.classList.remove("active");
  });

  navItems.forEach((navItem) => {
    navItem.addEventListener("click", () => {
      navList.classList.remove("active");
    });
  });

  menuIcon.addEventListener("click", () => {
    navList.classList.toggle("active");
  });

  const applyButton = document.getElementById("apply-button");
  applyButton.addEventListener("click", handleApplyButtonClick);
};

// Exporting the function as the default export for the module
export default renderTransactionPage;
