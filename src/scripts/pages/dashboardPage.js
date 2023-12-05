import "../../styles/dashboard.css";

import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";
import productImage from "../../public/images/produk.jpg";
import closeIcon from "../../public/icons/close.svg";

// Import necessary functions from the Firestore module
import {
  getFirestore,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  // apiKey: 
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Define fetchUserProducts outside of renderDashboardPage
const fetchUserProducts = async (userId) => {
  console.log("Fetching products for user:", userId);
  try {
    const productsRef = collection(db, "users", userId, "products");
    const q = query(productsRef);

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      // console.log("Product Data:", productData);
    });
  } catch (error) {
    console.error("Error fetching user products:", error.message);
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
    fetchUserProducts(user.uid);
  } else {
    console.log("User is signed out");
    // Handle signed-out state
  }
});

const renderDashboardPage = (container) => {
  container.innerHTML = `
    <header class="dash-header">
    <div class="dash-app-bar">
        <div class="dash-app-bar__title">
            <img src=${appIcon} alt="SimpleBiz Icons">
            <h1 class="dash-app-title">SimpleBiz</h1>
        </div>
        <div class="dash-menu-icon">
            <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
            </svg>
        </div>
        <nav id="dash-drawer" class="dash-nav">
            <ul class="dash-nav-list">
                <li class="dash-nav-item" id="dash-productPage"><a href="/product">Produk</a></li>
                <li class="dash-nav-item" id="dash-showCart"><a href="#">Keranjang</a></li>
                <li class="dash-nav-item" id="dash-reportsPage"><a href="/transaction">Transaksi</a></li>
                <li class="dash-nav-item dash-user-button">
                <button>
                    <img src="${userIcon}" alt="User Profile">
                    <span>Nama User</span>
                </button>
                </li>
            </ul>
        </nav>
    </div>
    </header>
    <main class="dash-main">
    <div class="resourceSection">
      <div class="subInput" id="dateInput">
        <p>Tanggal</p>
        <input class="inputForm" type="date" id="transactionDate" />
      </div>
      <div class="buttonResource">
        <button class="mainButton" id="applyResource">Simpan</button>
        <button class="mainButton" id="resetResource">Hapus</button>
      </div>
    </div>

    <div class="mainSearch">
      <input class="inputForm" type="text" id="nameInput" placeholder="Cari Produk" />
      <button class="mainButton" id="searchProduct">Cari</button>
    </div>

    <div class="productSection">
      <div class="mainProduct">
        <div class="subProduct">
          <div class="productImage">
            <img src=${productImage} alt="" />
          </div>
          <div class="productDescription">
            <h1 id="productName">Nama Produk</h1>
            <h2 id="productPrice">Rp.5000</h2>
          </div>
          <div class="buttonProduct">
            <button class="mainButton" id="addProduct">Tambah</button>
            <button class="mainButton" id="removeProduct">Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <section id="dash-cartSection" class="dash-cartSection">
      <div class="dash-cartHeader">
        <p>Keranjang Belanja</p>
        <img id="dash-closeCart" src=${closeIcon} alt="" />
      </div>

      <div class="dash-cartList">
        <div class="dash-cartItem">
          <img src=${productImage} alt="" />
          <div class="detailItem">
            <p id="productName">Nama Produk</p>
            <p id="productPrice">Rp. 5000</p>
          </div>
          <div class="quantityItem">
            <p>
              Total :
              <span id="quantityItem">1</span>
            </p>
          </div>
        </div>
      </div>

      <div class="dash-cartFooter">
        <div class="totalFooter">
          <p>
            Total Harga :
            <span class="totalNumber" id="totalPrice">Rp 0</span>
          </p>
          <p>
            Total Produk :
            <span class="totalNumber" id="totalProduct">Rp 0</span>
          </p>
        </div>
        <div class="paymentFooter">
          <p>Nominal Pembayaran</p>
          <input class="inputForm" type="text" id="totalCash" placeholder="Total Pembayaran" />
        </div>
        <div class="paymentFooter">
          <p>
            Kembalian :
            <span class="totalNumber" id="totalCharge">Rp 0</span>
          </p>
        </div>
        <div class="buttonFooter">
          <button class="mainButton" id="checkoutCart">Konfirmasi</button>
          <button class="mainButton" id="resetCart">Reset</button>
        </div>
      </div>
    </section>
  </main>
    <footer>
        <div class="dash-footer-content">
            <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
        </div>
    </footer>
    `;

  // Check if the user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserProducts(user.uid);
    } else {
      // User is signed out. You may want to handle this case.
      console.error("User not authenticated");
    }
  });

  // Fungsionalitas Keranjang
  const showCartButton = document.getElementById("dash-showCart"); // Tombol Keranjang
  const cartSection = document.getElementById("dash-cartSection"); // Seluruh Cart
  const closeCartButton = document.getElementById("dash-closeCart"); // Menutup Cart

  function openCart() {
    cartSection.classList.add("show");
  }

  function hideCart() {
    cartSection.classList.remove("show");
  }

  // Membuka dan Menutup Cart
  showCartButton.addEventListener("click", openCart);
  closeCartButton.addEventListener("click", hideCart);

  const menuIcon = container.querySelector(".dash-menu-icon");
  const navList = container.querySelector(".dash-nav-list");
  const mainContent = container.querySelector(".dash-main");

  const navItems = container.querySelectorAll(".dash-nav-item a");

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
};

export default renderDashboardPage;
