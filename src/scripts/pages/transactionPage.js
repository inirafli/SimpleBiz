// Import style untuk halaman transaksi
import "../../styles/transaction.css";

// Import fungsi-fungsi penting dari Firebase untuk Firestore, Authentication, dan inisialisasi aplikasi
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Import ikon-ikon untuk aplikasi
import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";
import firebaseConfig from "../common/config";

// Inisialisasi Firebase App dan mendapatkan instances Firestore dan Auth
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Fungsi bantuan untuk mengambil data transaksi dari Firestore
const fetchTransactionData = async (userId, startDate, endDate) => {
  // Memformat tanggal agar konsisten
  const formattedStartDate = startDate.split("-").reverse().join("-");
  const formattedEndDate = endDate.split("-").reverse().join("-");

  // Membuat referensi ke koleksi 'transactions' untuk pengguna tertentu
  const transactionsRef = collection(db, `users/${userId}/transactions`);
  // Melakukan query ke database Firestore untuk mendapatkan dokumen transaksi
  const querySnapshot = await getDocs(transactionsRef);

  // Mapping data dokumen ke format yang lebih mudah digunakan
  const transactions = querySnapshot.docs.map((doc) => {
    const date = doc.id; // tanggal merupakan ID dokumen
    const transactionData = doc.data().transactions;

    return {
      date,
      transactionData,
    };
  });

  console.log("Fetched transactions:", transactions);
  return transactions;
};

// Fungsi bantuan untuk menghitung total harga dari transaksi
const calculateTotalPrice = (transactions) => {
  // Inisialisasi variabel untuk total kuantitas dan total harga
  let totalQuantity = 0;
  let totalPrice = 0;

  // Iterasi melalui setiap transaksi dan memperbarui total
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

// Fungsi bantuan untuk menghitung total kuantitas dan total harga dari data transaksi
const calculateTransactionTotal = (transactionData) => {
  let transactionTotalQuantity = 0;
  let transactionTotalPrice = 0;

  // Iterasi melalui setiap produk dalam transaksi dan memperbarui total
  transactionData.forEach((data) => {
    data.products.forEach((product) => {
      transactionTotalQuantity += product.quantity || 0;
      transactionTotalPrice += product.totalPrice || 0;
    });
  });

  return { transactionTotalQuantity, transactionTotalPrice };
};

// Event listener untuk setiap baris dalam tabel transaksi utama
let lastClickedRow = null;

const handleRowClick = async (row) => {
  // Hapus kelas 'selected' dari baris yang diklik sebelumnya
  if (lastClickedRow) {
    lastClickedRow.classList.remove("selected");
  }

  // Tambahkan kelas 'selected' ke baris yang diklik
  row.classList.add("selected");
  lastClickedRow = row;

  // Ekstrak data transaksi dari atribut baris yang diklik
  const transactionData = JSON.parse(row.getAttribute("data-transaction"));

  // Render baris transaksi terperinci di tabel detail
  renderDetailTransactionRows(transactionData.transactionData);
};

// Fungsi bantuan untuk merender baris transaksi terperinci di tabel detail
const renderDetailTransactionRows = (transactions) => {
  const detailTbody = document.querySelector("#detailTransacTable tbody");
  detailTbody.innerHTML = "";

  // Membuat map untuk menyimpan data teragregasi untuk setiap produk pada tanggal tertentu
  const productMap = new Map();

  transactions.forEach((data) => {
    data.products.forEach((product) => {
      const productName = product.productName;
      const quantity = product.quantity || 0;
      const price = product.price || 0;
      const totalPrice = product.totalPrice || 0;

      // Membuat kunci unik untuk setiap produk pada tanggal tertentu
      const key = `${data.date}-${productName}`;

      if (!productMap.has(key)) {
        productMap.set(key, {
          productName,
          totalQuantity: quantity,
          totalPrice,
          price,
        });
      } else {
        // Jika produk pada tanggal yang sama sudah ada, perbarui kuantitas dan harga
        productMap.get(key).totalQuantity += quantity;
        productMap.get(key).totalPrice += totalPrice;
      }
    });
  });

  // Iterasi melalui data teragregasi dan merender baris
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

// Fungsi bantuan untuk memformat tanggal
const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Bulan dimulai dari nol
  const year = date.getFullYear().toString().slice(-2); // Ambil dua digit terakhir tahun

  return `${day}-${month}-${year}`;
};

// Fungsi bantuan untuk merender baris transaksi di tabel utama
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

      const formattedDate = formatDate(transaction.date); // Format tanggal
      row.innerHTML = `
              <td>${formattedDate}</td>
              <td>${transactionTotalQuantity}</td>
              <td>${transactionTotalPrice.toLocaleString()}</td>
          `;

      // Tambahkan event listener untuk setiap baris
      row.addEventListener("click", () => handleRowClick(row));

      tbody.appendChild(row);
    }
  });
};

// Fungsi bantuan untuk merender baris laporan evaluasi di tabel
const renderEvaluationReportRows = (highestSales, lowestSales) => {
  const highestSalesTbody = document.getElementById("highest-sales");
  const lowestSalesTbody = document.getElementById("lowest-sales");

  // Render penjualan tertinggi
  highestSales.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.totalQuantity}</td>
      <td>${product.totalPrice.toLocaleString()}</td>
    `;
    highestSalesTbody.appendChild(row);
  });

  // Render penjualan terendah
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

// Fungsi untuk merender seluruh halaman transaksi
const renderTransactionPage = (container) => {
  // Mengatur warna latar belakang body
  document.body.style.backgroundColor = "#F1F1FF";

  // Menyiapkan pendengar status Autentikasi
  const authStateListener = onAuthStateChanged(auth, (user) => {
    if (user) {
      // Jika pengguna terautentikasi, ambil dan perbarui data pengguna
      initializePage(user.uid);
    } else {
      console.warn("User is not authenticated.");
    }
  });

  // Panggil initializePage saat halaman dimuat
  document.addEventListener("DOMContentLoaded", () => {
    authStateListener(); // Picu pendengar ketika halaman dimuat
  });

  // Fungsi bantuan untuk mengambil data pengguna dan memperbarui antarmuka pengguna
  const initializePage = async (userId) => {
    try {
      // Mengambil data profil pengguna untuk mendapatkan nama UMKM
      const userDoc = await getDoc(doc(db, "users", userId));
      const umkmName = userDoc.data().umkm;

      // Perbarui nama profil pengguna di antarmuka pengguna
      updateUserName(umkmName);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Panggil initializePage saat halaman dimuat
  initializePage();

  // Fungsi bantuan untuk memperbarui nama pengguna di antarmuka pengguna
  const updateUserName = (umkmName) => {
    console.log("Updating user name:", umkmName);
    const userNameElement = document.querySelector(".user-button span");
    userNameElement.textContent = umkmName;
  };

  // Penangan acara untuk tombol "Terapkan"
  const handleApplyButtonClick = async () => {
    const startDate = document.getElementById("start").value;
    const endDate = document.getElementById("end").value;

    if (startDate && endDate) {
      const userId = auth.currentUser.uid;

      try {
        // Mengambil data transaksi berdasarkan ID pengguna dan rentang tanggal
        const transactions = await fetchTransactionData(
          userId,
          startDate,
          endDate
        );

        // Menghitung total kuantitas dan total harga dari transaksi yang diambil
        const { totalQuantity, totalPrice } = calculateTotalPrice(transactions);

        // Merender baris transaksi di tabel
        renderTransactionRows(transactions);

        // Menghitung penjualan tertinggi dan terendah
        const highestSales = calculateHighestSales(transactions);
        const lowestSales = calculateLowestSales(transactions);

        // Merender baris laporan evaluasi
        renderEvaluationReportRows(highestSales, lowestSales);
      } catch (error) {
        // Menangani kesalahan yang mungkin terjadi selama operasi pengambilan
        console.error("Error handling apply button click:", error);
      }
    }
  };

  // Event listener untuk tombol "Reset"
  const handleResetButtonClick = () => {
    // Hapus kelas 'selected' dari baris yang diklik sebelumnya
    if (lastClickedRow) {
      lastClickedRow.classList.remove("selected");
      lastClickedRow = null;
    }

    // Reset nilai input tanggal
    document.getElementById("start").value = "";
    document.getElementById("end").value = "";

    // Hapus isi dari tabel dan laporan evaluasi
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

  // Fungsi bantuan untuk menghitung penjualan tertinggi
  const calculateHighestSales = (transactions) => {
    // Meratakan array transaksi dan produk
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    // Membuat map untuk menyimpan data teragregasi untuk setiap produk
    const productMap = new Map();

    // Iterasi melalui setiap produk dan memperbarui data teragregasi
    allProducts.forEach((product) => {
      const productName = product.productName;
      const quantity = product.quantity || 0;
      const totalPrice = product.totalPrice || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, { totalQuantity: 0, totalPrice: 0 });
      }

      productMap.get(productName).totalQuantity += quantity;
      productMap.get(productName).totalPrice += totalPrice;
    });

    // Mengonversi nilai map ke array untuk merender
    const highestSales = Array.from(productMap.entries()).map(
      ([productName, data]) => ({
        productName,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
      })
    );

    // Mengurutkan produk berdasarkan totalQuantity secara menurun
    const sortedProducts = highestSales.sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return sortedProducts;
  };

  // Fungsi bantuan untuk menghitung penjualan terendah
  const calculateLowestSales = (transactions) => {
    // Menggunakan pendekatan yang sama dengan calculateHighestSales tetapi diurutkan secara menaik
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    const productMap = new Map();

    allProducts.forEach((product) => {
      const productName = product.productName;
      const quantity = product.quantity || 0;
      const totalPrice = product.totalPrice || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, { totalQuantity: 0, totalPrice: 0 });
      }

      productMap.get(productName).totalQuantity += quantity;
      productMap.get(productName).totalPrice += totalPrice;
    });

    // Mengonversi nilai map ke array untuk merender
    const lowestSales = Array.from(productMap.entries()).map(
      ([productName, data]) => ({
        productName,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
      })
    );

    // Mengurutkan produk berdasarkan totalQuantity secara menaik
    const sortedProducts = lowestSales.sort(
      (a, b) => a.totalQuantity - b.totalQuantity
    );

    return sortedProducts;
  };

  // Mengisi kontainer dengan konten HTML
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

  // Pendengar acara dan interaksi untuk navigasi dan klik tombol
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

// Mengekspor fungsi sebagai ekspor default untuk modul
export default renderTransactionPage;
