import '../../styles/dashboard.css'

import appIcon from '../../public/icons/simplebiz-icons.png'
import userIcon from '../../public/icons/user.svg'
import productImage from '../../public/icons/produk.jpg'
import closeIcon from '../../public/icons/close.svg'

const renderDashboardPage = (container) => {
  container.innerHTML = `
    <header>
        <div class="app-bar">
            <div class="app-bar__title">
                <img src=${appIcon} alt="SimpleBiz Icons">
                <h1 class="app-title">SimpleBiz</h1>
            </div>
            <div class="menu-icon">
                <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                    <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
                </svg>
            </div>
            <nav id="drawer" class="nav">
                <ul class="nav-list">
                    <li class="nav-item" id="productPage">Produk</li>
                    <li class="nav-item" id="reportsPage">Transaksi</li>
                    <li class="nav-item" id="showCart">Keranjang</li>
                </ul>
            </nav>
            <div class="accountHeader">
            <img src=${userIcon} alt="" />
            <p>Nama Akun</p>
            </div>
        </div>
    </header>
    
    <main>
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

    <section id="cartSection" class="cartSection">
      <div class="cartHeader">
        <p>Keranjang Belanja</p>
        <img id="closeCart" src=${closeIcon} alt="" />
      </div>

      <div class="cartList">
        <div class="cartItem">
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

      <div class="cartFooter">
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
        <div class="footer-content">
            <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
        </div>
    </footer>
    `

  // Fungsionalitas Keranjang
  const showCartButton = document.getElementById('showCart'); // Tombol Keranjang
  const cartSection = document.getElementById('cartSection'); // Seluruh Cart
  const closeCartButton = document.getElementById('closeCart'); // Menutup Cart

  function openCart() {
    cartSection.classList.add('show');
  }

  function hideCart() {
    cartSection.classList.remove('show');
  }

  // Membuka dan Menutup Cart
  showCartButton.addEventListener('click', openCart);
  closeCartButton.addEventListener('click', hideCart);

  const menuIcon = container.querySelector('.menu-icon')
  const navList = container.querySelector('.nav-list')
  const mainContent = container.querySelector('main')

  const navItems = container.querySelectorAll('.nav-item a')

  mainContent.addEventListener('click', () => {
    navList.classList.remove('active')
  })

  navItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      navList.classList.remove('active')
    })
  })

  menuIcon.addEventListener('click', () => {
    navList.classList.toggle('active');
  })
}

export default renderDashboardPage
