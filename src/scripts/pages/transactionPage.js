import "../../styles/transaction.css";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";
import firebaseConfig from "../common/config";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const fetchTransactionData = async (userId, startDate, endDate) => {
  const formattedStartDate = startDate.split("-").reverse().join("-");
  const formattedEndDate = endDate.split("-").reverse().join("-");

  const transactionsRef = collection(db, `users/${userId}/transactions`);
  const querySnapshot = await getDocs(transactionsRef);

  const transactions = querySnapshot.docs.map((doc) => {
    const date = doc.id;
    const transactionData = doc.data().transactions;

    return {
      date,
      transactionData,
    };
  });

  return transactions;
};

const calculateTotalPrice = (transactions) => {
  let totalQuantity = 0;
  let totalPrice = 0;

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

const calculateTransactionTotal = (transactionData) => {
  let transactionTotalQuantity = 0;
  let transactionTotalPrice = 0;

  transactionData.forEach((data) => {
    data.products.forEach((product) => {
      transactionTotalQuantity += product.quantity || 0;
      transactionTotalPrice += product.totalPrice || 0;
    });
  });

  return { transactionTotalQuantity, transactionTotalPrice };
};

let lastClickedRow = null;

const handleRowClick = async (row) => {
  if (lastClickedRow) {
    lastClickedRow.classList.remove("selected");
  }

  row.classList.add("selected");
  lastClickedRow = row;

  const transactionData = JSON.parse(row.getAttribute("data-transaction"));

  renderDetailTransactionRows(transactionData.transactionData);
};

const renderDetailTransactionRows = (transactions) => {
  const detailTbody = document.querySelector("#detailTransacTable tbody");
  detailTbody.innerHTML = "";

  const productMap = new Map();

  transactions.forEach((data) => {
    data.products.forEach((product) => {
      const { productName } = product;
      const quantity = product.quantity || 0;
      const price = product.price || 0;
      const totalPrice = product.totalPrice || 0;

      const key = `${data.date}-${productName}`;

      if (!productMap.has(key)) {
        productMap.set(key, {
          productName,
          totalQuantity: quantity,
          totalPrice,
          price,
        });
      } else {
        productMap.get(key).totalQuantity += quantity;
        productMap.get(key).totalPrice += totalPrice;
      }
    });
  });

  productMap.forEach((product) => {
    const detailRow = document.createElement("tr");
    detailRow.innerHTML = `
        <td>${product.productName}</td>
        <td>${product.totalQuantity}</td>
        <td>${product.price.toLocaleString()}</td>
        <td>${product.totalPrice.toLocaleString()}</td>
    `;

    detailTbody.appendChild(detailRow);
  });
};

const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  return `${day}-${month}-${year}`;
};

const renderTransactionRows = (transactions) => {
  const tbody = document.querySelector("#transacTable tbody");
  tbody.innerHTML = "";

  transactions.forEach((transaction) => {
    if (transaction.transactionData) {
      const { transactionTotalQuantity, transactionTotalPrice } =
        calculateTransactionTotal(transaction.transactionData);

      const row = document.createElement("tr");
      row.className = "clickable-row";
      row.setAttribute("data-date", transaction.date);
      row.setAttribute("data-transaction", JSON.stringify(transaction));

      const formattedDate = formatDate(transaction.date);
      row.innerHTML = `
              <td>${formattedDate}</td>
              <td>${transactionTotalQuantity}</td>
              <td>${transactionTotalPrice.toLocaleString()}</td>
          `;

      row.addEventListener("click", () => handleRowClick(row));

      tbody.appendChild(row);
    }
  });
};

const renderEvaluationReportRows = (highestSales, lowestSales) => {
  const highestSalesTbody = document.getElementById("highest-sales");
  const lowestSalesTbody = document.getElementById("lowest-sales");

  highestSales.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.totalQuantity}</td>
      <td>${product.totalPrice.toLocaleString()}</td>
    `;
    highestSalesTbody.appendChild(row);
  });

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

const renderTransactionPage = (container) => {
  document.body.style.backgroundColor = "#F1F1FF";

  const authStateListener = onAuthStateChanged(auth, (user) => {
    if (user) {
      initializePage(user.uid);
    } else {
      console.warn("User is not authenticated.");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    authStateListener();
  });

  const initializePage = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      const umkmName = userDoc.data().umkm;

      updateUserName(umkmName);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  initializePage();

  const updateUserName = (umkmName) => {
    const userNameElement = document.querySelector(".user-button span");
    userNameElement.textContent = umkmName;
  };

  const handleApplyButtonClick = async () => {
    const startDate = document.getElementById("start").value;
    const endDate = document.getElementById("end").value;

    if (startDate && endDate) {
      const userId = auth.currentUser.uid;

      try {
        // Convert start and end date strings to Date objects
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        // Validate that endDate is greater than or equal to startDate
        if (startDateObj > endDateObj) {
          console.error(
            "End date should be greater than or equal to start date."
          );
          return;
        }

        const transactionsRef = collection(db, `users/${userId}/transactions`);
        const querySnapshot = await getDocs(transactionsRef);

        const transactions = querySnapshot.docs.map((doc) => {
          const date = doc.id;
          const transactionData = doc.data().transactions;

          return {
            date,
            transactionData,
          };
        });

        // Filter transactions based on the selected date range
        const filteredTransactions = transactions.filter((transaction) => {
          const transactionDateObj = new Date(transaction.date);
          return (
            transactionDateObj >= startDateObj &&
            transactionDateObj <= endDateObj
          );
        });

        const { totalQuantity, totalPrice } =
          calculateTotalPrice(filteredTransactions);

        renderTransactionRows(filteredTransactions);

        const highestSales = calculateHighestSales(filteredTransactions);
        const lowestSales = calculateLowestSales(filteredTransactions);

        renderEvaluationReportRows(highestSales, lowestSales);
      } catch (error) {
        console.error("Error handling apply button click:", error);
      }
    }
  };

  const handleResetButtonClick = () => {
    if (lastClickedRow) {
      lastClickedRow.classList.remove("selected");
      lastClickedRow = null;
    }

    document.getElementById("start").value = "";
    document.getElementById("end").value = "";

    const transacTableBody = document.querySelector("#transacTable tbody");
    const detailTransacTableBody = document.querySelector(
      "#detailTransacTable tbody"
    );
    const highestSalesTbody = document.getElementById("highest-sales");
    const lowestSalesTbody = document.getElementById("lowest-sales");

    transacTableBody.innerHTML = "";
    detailTransacTableBody.innerHTML = "";
    highestSalesTbody.innerHTML = "";
    lowestSalesTbody.innerHTML = "";
  };

  const calculateHighestSales = (transactions) => {
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    const productMap = new Map();

    allProducts.forEach((product) => {
      const { productName } = product;
      const quantity = product.quantity || 0;
      const totalPrice = product.totalPrice || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, { totalQuantity: 0, totalPrice: 0 });
      }

      productMap.get(productName).totalQuantity += quantity;
      productMap.get(productName).totalPrice += totalPrice;
    });

    const highestSales = Array.from(productMap.entries()).map(
      ([productName, data]) => ({
        productName,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
      })
    );

    const sortedProducts = highestSales.sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return sortedProducts;
  };

  const calculateLowestSales = (transactions) => {
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    const productMap = new Map();

    allProducts.forEach((product) => {
      const { productName } = product;
      const quantity = product.quantity || 0;
      const totalPrice = product.totalPrice || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, { totalQuantity: 0, totalPrice: 0 });
      }

      productMap.get(productName).totalQuantity += quantity;
      productMap.get(productName).totalPrice += totalPrice;
    });

    const lowestSales = Array.from(productMap.entries()).map(
      ([productName, data]) => ({
        productName,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
      })
    );

    const sortedProducts = lowestSales.sort(
      (a, b) => a.totalQuantity - b.totalQuantity
    );

    return sortedProducts;
  };

  container.innerHTML = `
  <!-- Bagian header dari aplikasi -->
  <header id="mainHeader">
      <div class="main-app-bar">
          <div class="main-app-bar-title">
              <img src=${appIcon} alt="SimpleBiz Icons">
              <h1 class="main-app-title">SimpleBiz</h1>
          </div>
          <div class="main-menu-icon">
              <!-- Ikon menu hamburger -->
              <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                  <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
              </svg>
          </div>
          <nav id="mainDrawer" class="main-nav">
              <ul class="main-nav-list">
                  <!-- Tautan navigasi -->
                  <li class="nav-item"><a href="/dashboard" class="nav-link">Dashboard</a></li>
                  <li class="nav-item"><a href="/product" class="nav-link">Produk</a></li>
                  <li class="nav-item user-button">
                      <!-- Tombol profil pengguna -->
                      <button>
            <img src="${userIcon}" alt="User Profile">
            <span>Nama User</span>
        </button>
                  </li>
              </ul>
          </nav>
      </div>
  </header>

  <!-- Bagian konten utama dari halaman transaksi -->
  <main class="transac-main">
      <!-- Kontainer filter untuk pemilihan rentang tanggal -->
      <div class="filter-container">
          <h3 class="filter-title">Filter Tanggal</h3>
          <!-- Bidang input tanggal dan tombol terapkan -->
          <input type="date" id="start" name="date-start" value="" />
          <span>-</span>
          <input type="date" id="end" name="date-end" value="" />
          <button class="apply-button" id="apply-button">Terapkan</button>
          <button class="apply-button" id="reset-button">Reset</button>
      </div>
      <!-- Bagian tabel transaksi -->
      <div class="transac-content">
          <div class="table-title">
              <h2>Laporan Transaksi</h2>
          </div>
          <!-- Struktur tabel transaksi -->
          <table class="transac-table" id="transacTable">
              <thead>
                  <!-- Header tabel -->
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
      <!-- Bagian tabel transaksi terperinci -->
      <div class="transac-content" id="detailTransaction">
          <div class="table-title">
              <h2>Detail Transaksi</h2>
          </div>
          <!-- Struktur tabel transaksi terperinci -->
          <table class="transac-table" id="detailTransacTable">
              <thead>
                  <!-- Header tabel untuk transaksi terperinci -->
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
      <!-- Bagian laporan evaluasi -->
      <div class="transac-content">
          <div class="table-title">
              <h2>Evaluasi</h2>
          </div>
          <!-- Struktur tabel untuk laporan evaluasi -->
          <table class="transac-table" id="evaluation-report">
              <thead>
                  <!-- Header tabel untuk laporan evaluasi -->
                  <tr>
                      <th>Nama Barang</th>
                      <th>Total Penjualan</th>
                      <th>Total Harga</th>
                  </tr>
              </thead>
              <tbody id="highest-sales">
                  <!-- Baris khusus untuk penjualan tertinggi -->
                  <tr class="special-row">
                      <td colspan="3">Penjualan Tertinggi</td>
                  </tr>
              </tbody>
              <tbody id="lowest-sales">
                  <!-- Baris khusus untuk penjualan terendah -->
                  <tr class="special-row">
                      <td colspan="3">Penjualan Terendah</td>
                  </tr>
              </tbody>
          </table>
      </div>
  </main>
  <!-- Bagian footer dari aplikasi -->
  <footer>
      <div class="footer-content">
          <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
      </div>
  </footer>
  `;

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

  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", handleResetButtonClick);
};

export default renderTransactionPage;
