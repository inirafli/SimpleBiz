import "../../styles/dashboard.css";
import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";
import productImage from "../../public/images/produk.jpg";
import closeIcon from "../../public/icons/close.svg";

// Import necessary functions from the Firestore module
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  getDoc,
  collection,
  query,
} from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";



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

    const userProducts = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      userProducts.push(productData);
    });

    // Return the fetched userProducts without rendering the dashboard
    return userProducts;
  } catch (error) {
    console.error("Error fetching user products:", error.message);
    // Return an empty array or handle the error accordingly
    return [];
  }
};

// Flag to check if the product page has been rendered
let productPageRendered = false;

// Use a single onAuthStateChanged callback
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);

    try {
      // Fetch user products without rendering the dashboard
      const userProducts = await fetchUserProducts(user.uid);

      // Check if the current page is the dashboard before rendering
      const isDashboardPage = window.location.pathname === "/dashboard"; // Adjust the path accordingly

      if (isDashboardPage && !productPageRendered) {
        // Render the dashboard with the fetched userProducts
        renderDashboardPage(document.body, userProducts);
        productPageRendered = true;
      }
    } catch (error) {
      console.error("Error fetching user products:", error.message);
      // Handle the error accordingly
    }
  } else {
    console.log("User is signed out");
    // Handle signed-out state
  }
});

const cartItems = [];
const addToCart = (product) => {
  // Cek apakah produk sudah ada di keranjang
  const existingCartItem = cartItems.find(item => item.product.id === product.id);

  if (existingCartItem) {
    // Jika produk sudah ada, tambahkan jumlahnya
    existingCartItem.quantity += 1;
  } else {
    // Jika produk belum ada, tambahkan produk baru ke keranjang
    cartItems.push({
      product: product,
      quantity: 1,
    });
  }

  // Update UI untuk mencerminkan perubahan di keranjang
  updateCartUI(cartItems);
};

// Function to update the cart UI based on the current cart items
const updateCartUI = (cartItems) => {
  // Logika untuk mengupdate UI berdasarkan cartItems
  const dashCartList = document.querySelector('.dash-cartList');
  dashCartList.innerHTML = '';

  // Variable untuk menyimpan total harga dan total produk
  let totalPrice = 0;
  let totalProduct = 0;

  cartItems.forEach((cartItem) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('dash-cartItem');

    // Menghitung total harga dan total produk
    const itemPrice = cartItem.product.price * cartItem.quantity;
    totalPrice += itemPrice;
    totalProduct += cartItem.quantity;
      // Mengupdate total harga dan total produk pada UI
  const totalPriceElement = document.getElementById("totalPrice");
  const totalProductElement = document.getElementById("totalProduct");

  totalPriceElement.textContent = `Rp ${totalPrice}`;
  totalProductElement.textContent = `Rp ${totalProduct}`;

  // Mengupdate nominal pembayaran dan kembalian pada UI
  const totalCashInput = document.getElementById("totalCash");
  const totalChargeElement = document.getElementById("totalCharge");

  // Event listener untuk menghitung kembalian saat mengubah nominal pembayaran
  totalCashInput.addEventListener("input", () => {
    const totalCashValue = parseFloat(totalCashInput.value) || 0;
    const totalChargeValue = totalCashValue - totalPrice;

    totalChargeElement.textContent = `Rp ${Math.max(0, totalChargeValue)}`;
  });

    // Populate cart item container with product information
    cartItemDiv.innerHTML = `
      <img src="${cartItem.product.imageSrc}" alt="${cartItem.product.name}" />
      <div class="detailItem">
        <p id="productName">${cartItem.product.name}</p>
        <p id="productPrice">${cartItem.product.price}</p>
      </div>
      <div class="quantityItem">
        <p>
          Total :
          <span id="quantityItem">${cartItem.quantity}</span>
        </p>
      </div>
    `;

    dashCartList.appendChild(cartItemDiv);
  });

  // Mengupdate total harga dan total produk pada UI
  const totalPriceElement = document.getElementById("totalPrice");
  const totalProductElement = document.getElementById("totalProduct");

  totalPriceElement.textContent = `Rp ${totalPrice}`;
  totalProductElement.textContent = `Rp ${totalProduct}`;

  // Additional logic to update other UI elements if needed
};



const removeProduct = async (productId) => {
  try {
    const productRef = doc(db, "users", auth.currentUser.uid, "products", productId);
    await deleteDoc(productRef);
    console.log("Product successfully removed from the database");

    // Reload the page after successful removal
    location.reload();
  } catch (error) {
    console.error("Error removing product from the database:", error.message);
    // Handle the error accordingly
  }
};

// Function to render products on the dashboard
const renderDashboardProducts = (products) => {
  const productSection = document.querySelector(".productSection");
  const productContainer = productSection.querySelector(".mainProduct");

  // Clear previous products
  productContainer.innerHTML = "";

  // Render each product in the container
  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("subProduct");

    // Populate product container with product information
    productDiv.innerHTML = `
      <div class="productImage">
        <img src="${product.imageSrc}" alt="${product.name}" />
      </div>
      <div class="productDescription">
        <h1 id="productName">${product.name}</h1>
        <h2 id="productPrice">${product.price}</h2>
      </div>
      <div class="buttonProduct">
        <button class="mainButton" id="addProduct">Tambah</button>
        <button class="mainButton" id="removeProduct">Hapus</button>
      </div>
    `;

    productContainer.appendChild(productDiv);

    // Add event listeners for add and remove buttons if needed
    const addProductButton = productDiv.querySelector("#addProduct");
    const removeProductButton = productDiv.querySelector("#removeProduct");

    // Add event listener for add product button
    addProductButton.addEventListener("click", () => {
      addToCart(product);

      // Check if the cart is not already open, then open it
      const cartSection = document.getElementById("dash-cartSection");
      if (!cartSection.classList.contains("show")) {
      openCart();
      }
    });

    // Add event listener for remove product button
    removeProductButton.addEventListener("click", () => {
      removeProduct(product.id);
    });
  });
};

function openCart() {
  const cartSection = document.getElementById("dash-cartSection");
  cartSection.classList.add("show");
}
const renderDashboardPage = async (container, userProducts) => {
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
        <div class="mainProduct"></div>
      </div>

      <section id="dash-cartSection" class="dash-cartSection">
        <div class="dash-cartHeader">
          <p>Keranjang Belanja</p>
          <img id="dash-closeCart" src=${closeIcon} alt="" />
        </div>

        <div class="dash-cartList">
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
  const checkoutCartButton = document.getElementById("checkoutCart");
  checkoutCartButton.addEventListener("click", () => {
    const totalCashInput = document.getElementById("totalCash");
    const totalCashValue = parseFloat(totalCashInput.value) || 0;
  
    // Introduce a slight delay to ensure UI updates are complete
    setTimeout(() => {
      const totalChargeElement = document.getElementById("totalCharge");
      const totalChargeValue = parseFloat(totalChargeElement.textContent.replace("Rp ", "")) || 0;
  
      // Hanya lanjutkan jika nominal pembayaran cukup
      if (totalCashValue >= totalPrice) {
        // Lakukan sesuatu dengan totalCashValue dan totalChargeValue, misalnya simpan ke database atau tampilkan pesan sukses
        console.log("Pembayaran berhasil!");
        console.log("Nominal Pembayaran: Rp", totalCashValue);
        console.log("Kembalian: Rp", totalChargeValue);
  
        // Reset keranjang dan UI setelah pembayaran berhasil
        resetCart();
      } else {
        // Tampilkan pesan bahwa nominal pembayaran tidak cukup
        console.log("Nominal Pembayaran tidak cukup!");
      }
    }, 100); // You can adjust the delay as needed
  });
  

  renderDashboardProducts(userProducts);

  // Fungsionalitas Keranjang
  const showCartButton = document.getElementById("dash-showCart"); // Tombol Keranjang
  const cartSection = document.getElementById("dash-cartSection"); // Seluruh Cart
  const closeCartButton = document.getElementById("dash-closeCart"); // Menutup Cart
  const resetCartButton = document.getElementById("resetCart"); // Tombol Reset
  resetCartButton.addEventListener("click", resetCart);

  function openCart() {
    cartSection.classList.add("show");
  }

  function hideCart() {
    cartSection.classList.remove("show");
  }

// Mengubah isi fungsi resetCart
function resetCart() {
  console.log("Resetting cart");

  // Mengosongkan array cartItems
  cartItems.length = 0;

  // Update UI untuk mencerminkan perubahan di keranjang
  updateCartUI(cartItems);

  // Reset total harga dan total produk pada UI
  const totalPriceElement = document.getElementById("totalPrice");
  const totalProductElement = document.getElementById("totalProduct");

  totalPriceElement.textContent = `Rp 0`;
  totalProductElement.textContent = `Rp 0`;

  // Reset nominal pembayaran dan kembalian pada UI
  const totalCashInput = document.getElementById("totalCash");
  const totalChargeElement = document.getElementById("totalCharge");

  totalCashInput.value = ""; // Mengosongkan input nominal pembayaran
  totalChargeElement.textContent = `Rp 0`;
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

  // Function to filter products based on search input
  const filterProducts = (products, searchText) => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // Function to handle search button click
  const handleSearch = () => {
    const nameInput = document.getElementById("nameInput");
    const searchProductButton = document.getElementById("searchProduct");

    // Add event listener for search product button
    searchProductButton.addEventListener("click", async () => {
      try {
        const searchText = nameInput.value.trim();

        // Fetch user products without rendering the dashboard
        const userProducts = await fetchUserProducts(auth.currentUser.uid);

        // Filter products based on search input
        const filteredProducts = filterProducts(userProducts, searchText);

        // Render the dashboard with the filtered products
        renderDashboardPage(document.body, filteredProducts);
      } catch (error) {
        console.error("Error handling search:", error.message);
        // Handle the error accordingly
      }
    });
  };

  // Call the handleSearch function to set up the event listener
  handleSearch();
};

export default renderDashboardPage;
