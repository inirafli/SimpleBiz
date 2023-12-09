// Import necessary modules and styles
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

// Import images
import appIcon from '../../public/icons/simplebiz-icons.png';
import userIcon from '../../public/icons/user.svg';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB1FI87qdJUDyHRP8sZTuSbOpfD9Fv8G_E',
  authDomain: 'simple-biz-app.firebaseapp.com',
  projectId: 'simple-biz-app',
  storageBucket: 'simple-biz-app.appspot.com',
  messagingSenderId: '168574264567',
  appId: '1:168574264567:web:c3d1105732948875dd5ff2',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Define function to fetch user's products
const fetchUserProducts = async (userId) => {
  console.log('Fetching products for user:', userId);
  try {
    const productsRef = collection(db, `users/${userId}/products`);
    const q = query(productsRef);

    // Query the Firestore database for user's products
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => doc.data());

    // Sort products alphabetically by name
    products.sort((a, b) => a.name.localeCompare(b.name));

    console.log('User products:', products);

    return products;
  } catch (error) {
    console.error('Error fetching user products:', error);
    return [];
  }
};

// Flag to check if the product page has been rendered
let productPageRendered = false;

// Firebase authentication state change listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      console.log('User is signed in:', user.uid);

      // Render the product page only if it hasn't been rendered before
      if (!productPageRendered) {
        const products = await fetchUserProducts(user.uid);
        renderProductPage(products, user); // Pass the authenticated user
        productPageRendered = true; // Set the flag to true
      }
    } catch (error) {
      console.error('Error fetching user products:', error.message);
    }
  } else {
    console.log('User is signed out');
    // Handle signed-out state
  }
});

// Function to generate a unique ID for the product
const generateProductId = () => Math.random().toString(36).substring(2, 15)
  + Math.random().toString(36).substring(2, 15);

const addProductToFirestoreOnClick = async () => {
  try {
    // Get the form elements
    const productNameInput = document.querySelector('#productName');
    const productPriceInput = document.querySelector('#productPrice');
    const productImageInput = document.querySelector('#productImage');

    // Get the current user
    const user = auth.currentUser;

    // Check if user is authenticated
    if (!user || !user.uid) {
      console.error('User not authenticated.');
      return;
    }

    const userId = user.uid;
    const productId = generateProductId();

    // Get the storage reference
    const storage = getStorage(firebaseApp);
    const imageRef = ref(storage, `users/${userId}/products/${productId}`);

    // Upload the image to storage
    await uploadBytes(imageRef, productImageInput.files[0]);

    // Get the download URL of the uploaded image
    const downloadURL = await getDownloadURL(imageRef);

    // Create product data
    const jakartaTimezone = 'Asia/Jakarta';
    const jakartaDate = new Date().toLocaleString('en-US', { timeZone: jakartaTimezone });
    const createdAt = new Date(jakartaDate); // Set createdAt as a Date object

    const newProductData = {
      id: productId,
      name: productNameInput.value,
      price: productPriceInput.value,
      imageSrc: downloadURL,
      createdAt, // Set createdAt as a Date object
    };

    // Get the reference to the products collection
    const productsRef = collection(db, `users/${userId}/products`);

    // Set the document with the new product data
    await setDoc(doc(productsRef, productId), newProductData);

    console.log('Product added successfully!');

    // Clear the form fields
    productNameInput.value = '';
    productPriceInput.value = '';
    productImageInput.value = ''; // Clearing file input is a bit tricky due to security reasons
    const fileInputPlaceholder = document.querySelector('.file-input-placeholder');
    fileInputPlaceholder.innerHTML = '<p>Masukan Foto</p>';
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
  }
};

// Function to handle addButton click
const handleAddButtonClick = async () => {
  try {
    // Wait for authentication to complete
    const user = await waitForAuthentication();

    // Check if the user is authenticated
    if (!user || !user.uid) {
      console.error('User not authenticated.');
      return;
    }

    // Add a user parameter when adding a product
    await addProductToFirestoreOnClick();

    // Fetch and render updated products
    const updatedProducts = await fetchUserProducts(user.uid);
    const prodList = document.querySelector('#prodlist');
    // Render updated products
    renderProducts(updatedProducts, prodList);
  } catch (error) {
    console.error('Error handling add button click:', error);
  }
};

// Function to delete a product from Firestore
const deleteProductFromFirestore = async (user, productId) => {
  try {
    const userId = user.uid;
    const productRef = doc(db, `users/${userId}/products/${productId}`);
    await deleteDoc(productRef);

    console.log('Product deleted successfully!');
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
  }
};

// Function to update a product in Firestore
const updateProductInFirestore = async (
  productId,
  updateProductName,
  updateProductPrice,
  updateProductImageFile,
) => {
  try {
    const user = auth.currentUser;

    // Check if user is authenticated
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

// Function to retrieve all products from Firestore and sort them alphabetically
const getProductsFromFirestore = async () => {
  try {
    // Obtain the current authenticated user
    const user = auth.currentUser;

    // Check if the user is authenticated and their UID is available
    if (!user || !user.uid) {
      console.error('User not authenticated or UID not available.');
      // You may want to redirect the user to the login page or take appropriate action
      return [];
    }

    const userId = user.uid;
    const productsCollection = collection(db, `users/${userId}/products`);
    const productsSnapshot = await getDocs(productsCollection);

    const products = [];

    // Iterate through Firestore documents and extract product data
    productsSnapshot.forEach((doc) => {
      products.push(doc.data());
    });

    // Sort products alphabetically by name
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

    console.log('Products from Firestore:', products);

    return products;
  } catch (error) {
    console.error('Error getting products from Firestore:', error);
    return [];
  }
};

// Function to render products on the page
const renderProducts = (products, container) => {
  container.innerHTML = '';

  // Iterate through products and create HTML elements for each
  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.classList.add('prod-card');

    // Populate product card with product information
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

    // Add event listeners for delete and update buttons if needed
    const deleteButton = productCard.querySelector('#deleteProduct');
    const updateProduct = productCard.querySelector('#updateProduct');

    // Capture user information and define prodList before use
    const user = auth.currentUser;
    const prodList = document.querySelector('#prodlist');

    // Event listener for delete button
    deleteButton.addEventListener('click', async () => {
      await deleteProductFromFirestore(user, product.id);
      const updatedProducts = await getProductsFromFirestore();
      renderProducts(updatedProducts, prodList);
    });

    // Event listener for update button
    updateProduct.addEventListener('click', () => {
      const updateForm = document.querySelector('#updateForm');
      const updateProductNameInput = updateForm.querySelector('#updateProductName');
      const updateProductPriceInput = updateForm.querySelector(
        '#updateProductPrice',
      );

      // Update the product ID retrieval to use dataset
      const productIdToUpdate = updateProduct.dataset.id;

      if (!productIdToUpdate) {
        console.error('Product ID not available for update.');
        return;
      }

      updateProductNameInput.value = product.name;
      updateProductPriceInput.value = product.price;

      // Add product ID to the update form dataset
      updateForm.dataset.productId = productIdToUpdate;
    });
  });
};

// Function to wait for user authentication to complete
const waitForAuthentication = () => new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

// Function to render the product page
const renderProductPage = async (container, user) => {
  document.body.style.backgroundColor = '#F1F1F1';

  // Wait for authentication to complete
  const authenticatedUser = await waitForAuthentication();

  if (!authenticatedUser) {
    console.error('User not authenticated.');
    // You may want to redirect the user to the login page or take appropriate action
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
            <li class="nav-item"><a href="/dashboard">Dashboard</a></li>
            <li class="nav-item"><a href="/transaction">Transaksi</a></li>
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

  const prodList = document.querySelector('#prodlist');
  const addForm = document.querySelector('#addForm');
  const addButton = addForm.querySelector('#addButton');
  const updateForm = document.querySelector('#updateForm');
  const updateButton = updateForm.querySelector('#updateButton');
  const searchInput = document.querySelector('#searchInput');
  const searchButton = document.querySelector('#searchButton');

  // Fetch products from Firestore
  const products = await getProductsFromFirestore(user);

  // Render products on the page
  await renderProducts(products, prodList);

  // Event listener for the "Tambah" (Add) button
  addButton.addEventListener('click', handleAddButtonClick);

  // Event listener for the "Cari" (Search) button
  searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    const products = await getProductsFromFirestore();

    // Filter products based on the search term
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Render the filtered products
    renderProducts(filteredProducts, prodList);
  });

  // Event listener for the update form submission
  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Retrieve values from the update form
    const updateProductName = updateForm.querySelector('#updateProductName').value;
    const updateProductPrice = updateForm.querySelector(
      '#updateProductPrice',
    ).value;
    const updateProductImageInput = updateForm.querySelector(
      '#updateProductImage',
    );
    const updateProductImageFile = updateProductImageInput.files[0];
    const productIdToUpdate = updateForm.dataset.productId;

    // Update the product in Firestore
    await updateProductInFirestore(
      productIdToUpdate,
      updateProductName,
      updateProductPrice,
      updateProductImageFile,
    );

    // Fetch and render updated products
    const updatedProducts = await getProductsFromFirestore(user);
    renderProducts(updatedProducts, prodList);

    // Clear the update form fields
    updateForm.querySelector('#updateProductName').value = '';
    updateForm.querySelector('#updateProductPrice').value = '';
    updateForm.querySelector('#updateProductImage').value = '';

    // Clear the file input placeholder for security reasons
    const updateFileInputPlaceholder = document.querySelector(
      '.file-input-placeholder',
    );
    updateFileInputPlaceholder.innerHTML = '<p>Masukan Foto</p>';
  });
};

// Export the renderProductPage function as the default export
export default renderProductPage;
