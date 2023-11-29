import '../../styles/transaction.css'

import userIcon from '../../public/icons/profile-icon.png'
import appIcon from '../../public/icons/simplebiz-icons.png'

const renderTransactionPage = (container) => {
  // Mockup data
  const transactionData = [
    {
      id: 1, date: '01/01/2023', transactionId: '#WS00281', quantity: 5, totalPrice: 'Rp. 35,000',
    },
    {
      id: 2, date: '01/01/2023', transactionId: '#WS00282', quantity: 5, totalPrice: 'Rp. 100,000',
    },
    {
      id: 3, date: '01/01/2023', transactionId: '#WS00283', quantity: 5, totalPrice: 'Rp. 25,000',
    },
    {
      id: 4, date: '01/01/2023', transactionId: '#WS00284', quantity: 5, totalPrice: 'Rp. 31,000',
    },
  ]

  const evaluationData = {
    highestSales: [
      {
        id: 1, productName: 'Biosol', quantity: 5, totalPrice: 'Rp. 35,000',
      },
      {
        id: 2, productName: 'Biosol', quantity: 10, totalPrice: 'Rp. 100,000',
      },
    ],
    lowestSales: [
      {
        id: 1, productName: 'Biosol', quantity: 5, totalPrice: 'Rp. 35,000',
      },
      {
        id: 2, productName: 'Biosol', quantity: 10, totalPrice: 'Rp. 100,000',
      },
    ],
    topProduct: [
      { type: 'Penjualan Tertinggi', productName: 'Biosol', totalPrice: 'Rp. 200,000' },
    ],
  }

  container.innerHTML = `
    <header id="main-header">
        <div class="main-app-bar">
            <div class="main-app-bar-title">
                <img src=${appIcon} alt="SimpleBiz Icons">
                <h1 class="main-app-title">SimpleBiz</h1>
            </div>
            <div class="main-menu-icon">
                <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                    <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
                </svg>
            </div>
            <nav id="mainDrawer" class="main-nav">
                <ul class="main-nav-list">
                    <li class="nav-item"><a href="#">Produk</a></li>
                    <li class="nav-item"><a href="#">Keranjang</a></li>
                    <li class="nav-item"><a href="#">Transaksi</a></li>
                    <li class="nav-item user-button">
                        <button>
                            <img src=${userIcon} alt="User Profile">
                            <span>Nama User</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="transac-main">
        <div class="filter-container">
            <h3 class="filter-title">Filter Tanggal</h3>
            <input type="date" id="start" name="date-start" value="" />
            <span>-</span>
            <input type="date" id="end" name="date-end" value="" />
            <button class="apply-button">Terapkan</button>
        </div>
        <div class="transac-content">
            <div class="table-title">
                <h2>Laporan Transaksi</h2>
            </div>
            <table class="transac-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>ID Transaksi</th>
                        <th>Jumlah Barang</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactionData.map((data) => `
                        <tr>
                            <td>${data.id}</td>
                            <td>${data.date}</td>
                            <td>${data.transactionId}</td>
                            <td>${data.quantity}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="transac-content">
            <div class="table-title">
                <h2>Laporan Evaluasi</h2>
            </div>
            <table class="transac-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama Barang</th>
                        <th>Total Penjualan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="special-row">
                        <td colspan="4">Penjualan Tertinggi</td>
                    </tr>
                    ${evaluationData.highestSales.map((data) => `
                        <tr>
                            <td>${data.id}</td>
                            <td>${data.productName}</td>
                            <td>${data.quantity}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                    <tr class="special-row">
                        <td colspan="4">Penjualan Terendah</td>
                    </tr>
                    ${evaluationData.lowestSales.map((data) => `
                        <tr>
                            <td>${data.id}</td>
                            <td>${data.productName}</td>
                            <td>${data.quantity}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                    <tr class="special-row">
                        <td colspan="4">Produk Teratas</td>
                    </tr>
                    ${evaluationData.topProduct.map((data) => `
                        <tr class="summary">
                            <td class="special-td" colspan="2">${data.type}</td>
                            <td>${data.productName}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </main>
    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
        </div>
    </footer>
    `

  const menuIcon = container.querySelector('.main-menu-icon')
  const navList = container.querySelector('.main-nav-list')
  const mainContent = container.querySelector('.transac-main')

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
    navList.classList.toggle('active')
  })
}

export default renderTransactionPage
