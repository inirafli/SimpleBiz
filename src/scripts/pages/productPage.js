import '../../styles/product.css';
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
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import {
  getStorage, ref, uploadBytes, getDownloadURL,
} from 'firebase/storage';

import appIcon from '../../public/icons/simplebiz-icons.png';
import userIcon from '../../public/icons/user.svg';

const firebaseConfig = {
  apiKey: 'AIzaSyB1FI87qdJUDyHRP8sZTuSbOpfD9Fv8G_E',
  authDomain: 'simple-biz-app.firebaseapp.com',
  projectId: 'simple-biz-app',
  storageBucket: 'simple-biz-app.appspot.com',
  messagingSenderId: '168574264567',
  appId: '1:168574264567:web:c3d1105732948875dd5ff2',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const fetchUserProducts = async (userId) => {
  try {
    const productsRef = collection(db, `users/${userId}/products`);
    const q = query(productsRef);

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => doc.data());

    products.sort((a, b) => a.name.localeCompare(b.name));
    return products;
  } catch (error) {
    console.error('Error fetching user products:', error);
    return [];
  }
};

let productPageRendered = false;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      if (!productPageRendered) {
        const products = await fetchUserProducts(user.uid);
        renderProductPage(products, user);
        productPageRendered = true;
      }
    } catch (error) {
      console.error('Error fetching user products:', error.message);
    }
  } else {
    console.log('User is signed out');
  }
});

const waitForAuthentication = () => new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

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

const generateProductId = () => Math.random().toString(36).substring(2, 15)
  + Math.random().toString(36).substring(2, 15);

const addProductToFirestoreOnClick = async () => {
  try {
    const productNameInput = document.querySelector('#productName');
    const productPriceInput = document.querySelector('#productPrice');
    const productImageInput = document.querySelector('#productImage');

    const user = auth.currentUser;

    if (!user || !user.uid) {
      console.error('User not authenticated.');
      return;
    }

    const userId = user.uid;
    const productId = generateProductId();

    const storage = getStorage(firebaseApp);
    const imageRef = ref(storage, `users/${userId}/products/${productId}`);

    await uploadBytes(imageRef, productImageInput.files[0]);

    const downloadURL = await getDownloadURL(imageRef);

    const jakartaTimezone = 'Asia/Jakarta';
    const jakartaDate = new Date().toLocaleString('en-US', {
      timeZone: jakartaTimezone,
    });

    const createdAt = new Date(jakartaDate);

    const newProductData = {
      id: productId,
      name: productNameInput.value,
      price: productPriceInput.value,
      imageSrc: downloadURL,
      createdAt,
    };

    const productsRef = collection(db, `users/${userId}/products`);

    await setDoc(doc(productsRef, productId), newProductData);

    productNameInput.value = '';
    productPriceInput.value = '';
    productImageInput.value = '';
    const fileInputPlaceholder = document.querySelector(
      '.file-input-placeholder',
    );
    fileInputPlaceholder.innerHTML = '<p>Masukan Foto</p>';
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
  }
};

const handleAddButtonClick = async () => {
  try {
    const user = await waitForAuthentication();

    if (!user || !user.uid) {
      console.error('User not authenticated.');
      return;
    }

    await addProductToFirestoreOnClick();

    const updatedProducts = await fetchUserProducts(user.uid);
    const prodList = document.querySelector('#prodlist');

    renderProducts(updatedProducts, prodList);
  } catch (error) {
    console.error('Error handling add button click:', error);
  }
};

const deleteProductFromFirestore = async (user, productId) => {
  try {
    const userId = user.uid;
    const productRef = doc(db, `users/${userId}/products/${productId}`);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
  }
};

const updateProductInFirestore = async (
  productId,
  updateProductName,
  updateProductPrice,
  updateProductImageFile,
) => {
  try {
    const user = auth.currentUser;

    if (!user || !user.uid) {
      console.error('User not authenticated.');
      return;
    }

    const userId = user.uid;
    const productRef = doc(db, `users/${userId}/products/${productId}`);
    const productSnapshot = await getDoc(productRef);

    if (productSnapshot.exists()) {
      const storage = getStorage(firebaseApp);
      const imageRef = ref(storage, `users/${userId}/products/${productId}`);
      await uploadBytes(imageRef, updateProductImageFile);
      const downloadURL = await getDownloadURL(imageRef);

      const updatedProductData = {
        name: updateProductName,
        price: updateProductPrice,
        imageSrc: downloadURL,
      };

      await updateDoc(productRef, updatedProductData);

      console.log('Product updated successfully!');
    } else {
      console.error(
        'Product not found. Check the product ID and Firestore path.',
      );
    }
  } catch (error) {
    console.error('Error updating product in Firestore:', error);
  }
};

const getProductsFromFirestore = async () => {
  try {
    const user = auth.currentUser;

    if (!user || !user.uid) {
      console.error('User not authenticated or UID not available.');
      return [];
    }

    const userId = user.uid;
    const productsCollection = collection(db, `users/${userId}/products`);
    const productsSnapshot = await getDocs(productsCollection);

    const products = [];

    productsSnapshot.forEach((doc) => {
      products.push(doc.data());
    });

    products.sort((a, b) => {
      const productNameA = a.name.toUpperCase();
      const productNameB = b.name.toUpperCase();
      if (productNameA < productNameB) {
        return -1;
      }
      if (productNameA > productNameB) {
        return 1;
      }
      return 0;
    });

    return products;
  } catch (error) {
    console.error('Error getting products from Firestore:', error);
    return [];
  }
};

const renderProducts = (products, container) => {
  container.innerHTML = '';

  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.classList.add('prod-card');

    productCard.innerHTML = `
      <img src="${product.imageSrc}" alt="${product.name}">
      <h2 class="prod-name">${product.name}</h2>
      <p class="prod-price">${product.price}</p>
      <div class="action-button">
        <button id="deleteProduct" data-id="${product.id}">Hapus</button>
        <button id="updateProduct" data-id="${product.id}">Perbarui</button>
      </div>
    `;

    container.appendChild(productCard);

    const deleteButton = productCard.querySelector('#deleteProduct');
    const updateProduct = productCard.querySelector('#updateProduct');

    const user = auth.currentUser;
    const prodList = document.querySelector('#prodlist');

    deleteButton.addEventListener('click', async () => {
      await deleteProductFromFirestore(user, product.id);
      const updatedProducts = await getProductsFromFirestore();
      renderProducts(updatedProducts, prodList);
    });

    updateProduct.addEventListener('click', () => {
      const updateForm = document.querySelector('#updateForm');
      const updateProductNameInput = updateForm.querySelector('#updateProductName');
      const updateProductPriceInput = updateForm.querySelector(
        '#updateProductPrice',
      );

      const productIdToUpdate = updateProduct.dataset.id;

      if (!productIdToUpdate) {
        console.error('Product ID not available for update.');
        return;
      }

      updateProductNameInput.value = product.name;
      updateProductPriceInput.value = product.price;

      updateForm.dataset.productId = productIdToUpdate;
    });
  });
};

const renderProductPage = async (container, user) => {
  const authenticatedUser = await waitForAuthentication();

  if (!authenticatedUser) {
    console.error('User not authenticated.');
    return;
  }

  container.innerHTML = `
    <header class="prod-header">
      <div class="prod-app-bar">
        <div class="prod-app-bar-title">
          <img src="${appIcon}" alt="SimpleBiz Icons">
          <h1 class="prod-app-title">SimpleBiz</h1>
        </div>
        <div class="prod-menu-icon">
          <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
            <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
          </svg>
        </div>
        <nav id="productDrawer" class="prod-nav">
        <ul class="prod-nav-list">
        <li class="nav-item"><a href="/dashboard" class="nav-link">Dashboard</a></li>
        <li class="nav-item"><a href="/transaction" class="nav-link">Transaksi</a></li>
        <li class="nav-item prod-user-button">
            <button>
                <img src="${userIcon}" alt="User Profile">
                <span>Nama User</span>
            </button>
        </li>
    </ul>
        </nav>
      </div>
    </header>
    <main class="prod-main">
      <div class="prod-side-form">
        <div class="prod-form-container" id="addForm">
          <h2>Tambah Produk</h2>
          <form class="prod-input-form">
            <div class="prod-form-group">
              <label for="productName">Nama Produk</label>
              <input type="text" id="productName" name="productName" required>
            </div>
            <div class="prod-form-group">
              <label for="productPrice">Harga Produk</label>
              <input type="text" id="productPrice" name="productPrice" required>
            </div>
            <div class="prod-form-group">
              <label for="productImage">Foto Produk</label>
              <div class="custom-file-input">
                <input type="file" id="productImage" name="productImage" accept="image/*" required>
                <div class="file-input-placeholder">
                  <p>Masukan Foto</p>
                </div>
              </div>
            </div>
            <button id="addButton" type="button">Tambah</button>
          </form>
        </div>
        <div class="prod-form-container" id="updateForm">
          <h2>Perbarui Produk</h2>
          <form class="prod-input-form">
            <div class="prod-form-group">
              <label for="updateProductName">Nama Produk</label>
              <input type="text" id="updateProductName" name="updateProductName" required>
            </div>
            <div class="prod-form-group">
              <label for="productPrice">Harga Produk</label>
              <input type="text" id="updateProductPrice" name="updateProductPrice" required>
            </div>
            <div class="prod-form-group">
              <label for="updateProductImage">Foto Produk</label>
              <div class="custom-file-input">
                <input type="file" id="updateProductImage" name="updateProductImage" accept="image/*">
                <div class="file-input-placeholder">
                  <p>Masukan Foto</p>
                </div>
              </div>
            </div>
            <button id="updateButton" type="submit">Perbarui</button>
          </form>
        </div>
      </div>

      <div class="prod-content">
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="Cari produk...">
          <button id="searchButton" type="button">Cari</button>
        </div>
        <div class="prod-list" id="prodlist"></div>
      </div>
      
    </main>
    <footer>
      <div class="prod-footer-content">
        <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
      </div>
    </footer>
  `;

  document.body.classList.add('product-page');

  const prodList = document.querySelector('#prodlist');
  const addForm = document.querySelector('#addForm');
  const addButton = addForm.querySelector('#addButton');
  const updateForm = document.querySelector('#updateForm');
  const updateButton = updateForm.querySelector('#updateButton');
  const searchInput = document.querySelector('#searchInput');
  const searchButton = document.querySelector('#searchButton');

  const menuIcon = document.querySelector('.prod-menu-icon');
  const navList = document.querySelector('.prod-nav-list');
  const mainContent = document.querySelector('.prod-main');
  const navItems = document.querySelectorAll('.nav-item a');

  mainContent.addEventListener('click', () => {
    navList.classList.remove('active');
  });

  navItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      navList.classList.remove('active');
    });
  });

  menuIcon.addEventListener('click', () => {
    navList.classList.add('active');
  });

  const products = await getProductsFromFirestore(user);

  await renderProducts(products, prodList);

  const userData = await getUserDataFromFirestore(user.uid);

  if (userData) {
    const userNameElement = document.querySelector('.prod-user-button span');
    userNameElement.textContent = userData.umkm;
  } else {
    return;
  }

  addButton.addEventListener('click', handleAddButtonClick);

  searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    const products = await getProductsFromFirestore();

    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    renderProducts(filteredProducts, prodList);
  });

  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const updateProductName = updateForm.querySelector('#updateProductName').value;
    const updateProductPrice = updateForm.querySelector(
      '#updateProductPrice',
    ).value;
    const updateProductImageInput = updateForm.querySelector(
      '#updateProductImage',
    );
    const updateProductImageFile = updateProductImageInput.files[0];
    const productIdToUpdate = updateForm.dataset.productId;

    await updateProductInFirestore(
      productIdToUpdate,
      updateProductName,
      updateProductPrice,
      updateProductImageFile,
    );

    const updatedProducts = await getProductsFromFirestore(user);
    renderProducts(updatedProducts, prodList);

    updateForm.querySelector('#updateProductName').value = '';
    updateForm.querySelector('#updateProductPrice').value = '';
    updateForm.querySelector('#updateProductImage').value = '';

    const updateFileInputPlaceholder = document.querySelector(
      '.file-input-placeholder',
    );
    updateFileInputPlaceholder.innerHTML = '<p>Masukan Foto</p>';
  });
};

export default renderProductPage;
