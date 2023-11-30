import '../../styles/product.css'

import userIcon from '../../public/icons/user.svg'
import appIcon from '../../public/icons/simplebiz-icons.png'
import productImage from '../../public/images/produk.jpg'

const renderProductPage = (container) => {
  document.body.style.backgroundColor = '#F1F1F1'
  // Mockup data model
  const products = [
    { name: 'Product1', price: 'Rp. 25,000', imageSrc: productImage },
    { name: 'Product2', price: 'Rp. 30,000', imageSrc: productImage },
    { name: 'Product3', price: 'Rp. 35,000', imageSrc: productImage },
    { name: 'Product4', price: 'Rp. 40,000', imageSrc: productImage },
  ]

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
              <li class="nav-item"><a href="/product">Produk</a></li>
              <li class="nav-item"><a href="/cart">Keranjang</a></li>
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
                        <button id="addButton" type="submit">Tambah</button>
                    </form>
                </div>
                <div class="prod-form-container" id="updateForm">
                    <h2>Perbarui Produk</h2>
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
                        <button id="updateButton" type="submit">Perbarui</button>
                    </form>
                </div>
            </div>
            
            <div class="prod-content">
                <div class="search-bar">
                    <input type="text" id="searchInput" placeholder="Cari produk...">
                    <button id="searchButton" type="button">Cari</button>
                </div>
                <div class="prod-list">
                ${products
    .map(
      (product) => `
                  <div class="prod-card">
                      <img src="${product.imageSrc}" alt="${product.name}">
                      <h2 class="prod-name">${product.name}</h2>
                      <p class="prod-price">${product.price}</p>
                      <div class="action-button">
                          <button id="deleteProduct">Hapus</button>
                          <button id="updateProduct">Perbarui</button>
                      </div>
                  </div>
              `,
    )
    .join('')}
            </div>
        </div>
        </main>
        <footer>
            <div class="prod-footer-content">
                <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
            </div>
        </footer>
  `
}

export default renderProductPage
