import '../../styles/dashboard.css';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  query,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appIcon from '../../public/icons/simplebiz-icons.png';
import userIcon from '../../public/icons/user.svg';
import closeIcon from '../../public/icons/close.svg';
import firebaseConfig from '../common/config';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const fetchUserProducts = async (userId) => {
  try {
    const productsRef = collection(db, 'users', userId, 'products');
    const q = query(productsRef);

    const querySnapshot = await getDocs(q);

    const userProducts = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      const productWithDate = {
        ...productData,
        createdAt: productData.createdAt.toDate(),
      };
      userProducts.push(productWithDate);
    });

    return userProducts;
  } catch (error) {
    console.error('Error fetching user products:', error.message);

    return [];
  }
};

let productPageRendered = false;

let user;

onAuthStateChanged(auth, async (authUser) => {
  user = authUser;

  if (user) {
    try {
      const userProducts = await fetchUserProducts(user.uid);

      const isDashboardPage = window.location.pathname === '/dashboard';

      if (isDashboardPage && !productPageRendered) {
        renderDashboardPage(document.body, userProducts);
        productPageRendered = true;
      }
    } catch (error) {
      console.error('Error fetching user products:', error.message);
    }
  } else {
    console.log('User is signed out');
  }
});

const cartItems = [];
const addToCart = (product) => {
  const existingCartItem = cartItems.find(
    (item) => item.product.id === product.id,
  );

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    cartItems.push({
      product,
      quantity: 1,
    });
  }

  updateCartUI(cartItems);
};

let totalPrice = 0;

const updateCartUI = (cartItems) => {
  const dashCartList = document.querySelector('.dash-cartList');
  dashCartList.innerHTML = '';

  let totalProduct = 0;

  totalPrice = cartItems.reduce(
    (total, cartItem) => total + cartItem.product.price * cartItem.quantity,
    0,
  );

  cartItems.forEach((cartItem) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('dash-cartItem');

    const itemPrice = cartItem.product.price * cartItem.quantity;
    totalProduct += cartItem.quantity;

    const totalPriceElement = document.getElementById('totalPrice');
    const totalProductElement = document.getElementById('totalProduct');

    totalPriceElement.textContent = `Rp ${totalPrice}`;
    totalProductElement.textContent = `Rp ${totalProduct}`;

    const totalCashInput = document.getElementById('totalCash');
    const totalChargeElement = document.getElementById('totalCharge');

    totalCashInput.addEventListener('input', () => {
      const totalCashValue = parseFloat(totalCashInput.value) || 0;
      const totalChargeValue = totalCashValue - totalPrice;

      totalChargeElement.textContent = `Rp ${Math.max(0, totalChargeValue)}`;
    });

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

  const totalPriceElement = document.getElementById('totalPrice');
  const totalProductElement = document.getElementById('totalProduct');

  totalPriceElement.textContent = `Rp ${totalPrice}`;
  totalProductElement.textContent = `Rp ${totalProduct}`;
};

const decreaseCartItemQuantity = (productId) => {
  const cartItem = cartItems.find((item) => item.product.id === productId);

  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  } else {
    const index = cartItems.findIndex((item) => item.product.id === productId);
    if (index !== -1) {
      cartItems.splice(index, 1);
    }
  }

  updateCartUI(cartItems);
};

const removeProduct = async (productId) => {
  try {
    decreaseCartItemQuantity(productId);
  } catch (error) {
    console.error('Error handling product removal:', error.message);
  }
};

const addTransactionToFirestore = async (
  userId,
  cartItems,
  totalCashValue,
  totalChargeValue,
  transactionDate,
) => {
  try {
    const documentId = generateDocumentId(transactionDate);

    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const transactionDocRef = doc(transactionsRef, documentId);

    const transactionId = generateTransactionId(transactionDate);

    const newTransaction = {
      products: cartItems.map((item) => ({
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
      })),
    };

    const existingDoc = await getDoc(transactionDocRef);

    if (existingDoc.exists()) {
      let updatedTransactions;

      if (existingDoc.data() && existingDoc.data().transactions) {
        updatedTransactions = [
          ...existingDoc.data().transactions,
          newTransaction,
        ];
      } else {
        updatedTransactions = [newTransaction];
      }

      await setDoc(transactionDocRef, { transactions: updatedTransactions });
    } else {
      await setDoc(transactionDocRef, { transactions: [newTransaction] });
    }
  } catch (error) {
    console.error(
      'Error adding transaction to Firestore:',
      error.code,
      error.message,
    );
    console.error('Additional details:', error);
  }
};

const generateDocumentId = (transactionDate) =>

  transactionDate;
const generateTransactionId = (transactionDate) =>

  `${transactionDate}-${generateRandomLetters(2)}`;
const generateRandomLetters = (length) => Math.random()
  .toString(36)
  .substring(2, 2 + length);

const renderDashboardProducts = (products) => {
  const productSection = document.querySelector('.productSection');
  const productContainer = productSection.querySelector('.mainProduct');

  productContainer.innerHTML = '';

  products.forEach((product) => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('subProduct');

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

    const addProductButton = productDiv.querySelector('#addProduct');
    const removeProductButton = productDiv.querySelector('#removeProduct');

    addProductButton.addEventListener('click', () => {
      addToCart(product);

      const cartSection = document.getElementById('dash-cartSection');
      if (!cartSection.classList.contains('show')) {
        openCart();
      }
    });

    removeProductButton.addEventListener('click', () => {
      removeProduct(product.id);
    });
  });
};

function openCart() {
  const cartSection = document.getElementById('dash-cartSection');
  cartSection.classList.add('show');
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
            <li class="nav-item"><a href="/product" class="nav-link">Produk</a></li>
            <li class="nav-item"><a href="/transaction" class="nav-link">Transaksi</a></li>
            <li class="nav-item" id="dash-showCart"><a href="#" class="nav-link">Keranjang</a></li>
            <li class="nav-item dash-user-button">
              <button>
                  <img src="${userIcon}" alt="User Profile">
                  <span>Nama User</span>
              </button>
            </li>
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
  const checkoutCart = () => {
    const totalCashInput = document.getElementById('totalCash');
    const totalCashValue = parseFloat(totalCashInput.value) || 0;

    setTimeout(() => {
      const totalChargeElement = document.getElementById('totalCharge');
      const totalChargeValue = parseFloat(totalChargeElement.textContent.replace('Rp ', '')) || 0;

      if (totalCashValue >= totalPrice && cartItems.length > 0) {
        addTransactionToFirestore(
          auth.currentUser.uid,
          cartItems,
          totalCashValue,
          totalChargeValue,
          transactionDateInput.value,
        );

        resetCart();

        hideCart();
      } else {
        if (cartItems.length === 0) {
          console.log(
            'Error: Cart is empty. Add products to the cart before proceeding.',
          );
        } else if (totalCashValue < totalPrice) {
          console.log(
            'Error: Insufficient Payment Amount! Please provide sufficient cash.',
          );
        } else {
          console.log(
            'Error: Payment could not be processed. Check the cart and payment amount.',
          );
        }
      }
    }, 100);
  };

  const applyResourceButton = document.getElementById('applyResource');
  const transactionDateInput = document.getElementById('transactionDate');

  const getUserDataFromFirestore = async (userId) => {
    try {
      const userDocRef = doc(db, `users/${userId}`);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        if (userData && userData.umkm != null) {
          return userData;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const userData = await getUserDataFromFirestore(user.uid);

  if (userData) {
    const userNameElement = document.querySelector('.dash-user-button span');
    userNameElement.textContent = userData.umkm;
  } else {
    return;
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  transactionDateInput.value = formattedDate;

  const checkoutCartButton = document.getElementById('checkoutCart');

  checkoutCartButton.addEventListener('click', checkoutCart);

  userProducts.sort((a, b) => a.name.localeCompare(b.name));

  renderDashboardProducts(userProducts);

  const showCartButton = document.getElementById('dash-showCart');
  const cartSection = document.getElementById('dash-cartSection');
  const closeCartButton = document.getElementById('dash-closeCart');
  const resetCartButton = document.getElementById('resetCart');
  resetCartButton.addEventListener('click', resetCart);

  function openCart() {
    cartSection.classList.add('show');
  }

  function hideCart() {
    cartSection.classList.remove('show');
  }

  function resetCart() {
    console.log('Resetting cart');

    cartItems.length = 0;

    updateCartUI(cartItems);

    const totalPriceElement = document.getElementById('totalPrice');
    const totalProductElement = document.getElementById('totalProduct');

    totalPriceElement.textContent = 'Rp 0';
    totalProductElement.textContent = 'Rp 0';

    const totalCashInput = document.getElementById('totalCash');
    const totalChargeElement = document.getElementById('totalCharge');

    totalCashInput.value = '';
    totalChargeElement.textContent = 'Rp 0';
  }

  showCartButton.addEventListener('click', openCart);
  closeCartButton.addEventListener('click', hideCart);

  showCartButton.addEventListener('click', (event) => {
    event.preventDefault();
    openCart();
  });

  const mainContent = container.querySelector('.dash-main');
  const navList = container.querySelector('.dash-nav-list');

  mainContent.addEventListener('click', () => {
    navList.classList.remove('active');
  });

  const navItems = container.querySelectorAll('.nav-item a');

  navItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      navList.classList.remove('active');
    });
  });

  const menuIcon = container.querySelector('.dash-menu-icon');

  menuIcon.addEventListener('click', () => {
    navList.classList.toggle('active');
  });

  const filterProducts = (products, searchText) => products.filter((product) => product.name.toLowerCase().includes(searchText.toLowerCase()));

  const handleSearch = () => {
    const nameInput = document.getElementById('nameInput');
    const searchProductButton = document.getElementById('searchProduct');

    searchProductButton.addEventListener('click', async () => {
      try {
        const searchText = nameInput.value.trim();

        const userProducts = await fetchUserProducts(auth.currentUser.uid);

        const filteredProducts = filterProducts(userProducts, searchText);

        renderDashboardPage(document.body, filteredProducts);
      } catch (error) {
        console.error('Error handling search:', error.message);
      }
    });
  };

  handleSearch();
};

export default renderDashboardPage;
