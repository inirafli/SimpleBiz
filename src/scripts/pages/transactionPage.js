import '../../styles/transaction.css'

import userIcon from '../../public/icons/user.svg'
import appIcon from '../../public/icons/simplebiz-icons.png'

const renderTransactionPage = (container) => {
  document.body.style.backgroundColor = '#F1F1FF'
  // Mockup data
  const documentData = [
    {
      date: '01-01-2023',
      quantity: 5,
      totalPrice: 'Rp. 25,000',
    },
    {
      date: '02-01-2023',
      quantity: 5,
      totalPrice: 'Rp. 25,000',
    },
    {
      date: '03-01-2023',
      quantity: 5,
      totalPrice: 'Rp. 75,000',
    },
  ]

  // Calculate totalPrice
  const totalPriceAllProducts = documentData.reduce((total, data) => total + parseInt(data.totalPrice.replace('Rp. ', '').replace(',', ''), 10), 0);
  const formattedTotalPrice = `Rp. ${totalPriceAllProducts.toLocaleString()}`;

  const transactionData = [
    {
      date: '01-01-2023',
      productName: 'Biosol',
      quantity: 5,
      pricePerUnit: 'Rp. 35,000',
      totalPrice: 'Rp. 175,000',
    },
    {
      date: '01-01-2023',
      productName: 'Biosol',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
    {
      date: '01-01-2023',
      productName: 'Biosol',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
    {
      date: '02-01-2023',
      productName: 'Lemonade',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
    {
      date: '02-01-2023',
      productName: 'Lemonade',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
    {
      date: '02-01-2023',
      productName: 'Lemonade',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
    {
      date: '03-01-2023',
      productName: 'Gula Putih',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
    {
      date: '03-01-2023',
      productName: 'Gula Putih',
      quantity: 3,
      pricePerUnit: 'Rp. 50,000',
      totalPrice: 'Rp. 150,000',
    },
  ]

  const evaluationData = {
    highestSales: [
      {
        productName: 'Biosol', quantity: 5, totalPrice: 'Rp. 35,000',
      },
      {
        productName: 'Biosol', quantity: 10, totalPrice: 'Rp. 100,000',
      },
    ],
    lowestSales: [
      {
        productName: 'Biosol', quantity: 5, totalPrice: 'Rp. 35,000',
      },
      {
        productName: 'Biosol', quantity: 10, totalPrice: 'Rp. 100,000',
      },
    ],
    topProduct: [
      { type: 'Penjualan Tertinggi', productName: 'Biosol', totalPrice: 'Rp. 200,000' },
    ],
  }

  document.body.style.backgroundColor = '#F1F1FF'

  container.innerHTML = `
    <header id="mainHeader">
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
                    <li class="nav-item"><a href="/product">Produk</a></li>
                    <li class="nav-item"><a href="/cart">Keranjang</a></li>
                    <li class="nav-item"><a href="/transaction">Transaksi</a></li>
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
            <table class="transac-table" id="transacTable">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Jumlah Barang</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                    ${documentData.map((data) => `
                        <tr id="transacRow" class='clickable-row'>
                            <td>${data.date}</td>
                            <td>${data.quantity}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                        <tr class="summary">
                            <td class="special-td" colspan="2">Penjualan Semua Produk</td>
                            <td>${formattedTotalPrice}</td>
                        </tr>
                </tbody>
            </table>
        </div>
        <div class="transac-content" id="detailTransaction">
            <div class="table-title">
                <h2>Laporan Transaksi Produk</h2>
            </div>
            <table class="transac-table" id="detailTransacTable">
                <thead>
                    <tr>
                        <th>Nama Barang</th>
                        <th>Jumlah Barang</th>
                        <th>Harga Satuan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead><tbody>
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
                        <th>Nama Barang</th>
                        <th>Total Penjualan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="special-row">
                        <td colspan="3">Penjualan Tertinggi</td>
                    </tr>
                    ${evaluationData.highestSales.map((data) => `
                        <tr>
                            <td>${data.productName}</td>
                            <td>${data.quantity}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                    <tr class="special-row">
                        <td colspan="3">Penjualan Terendah</td>
                    </tr>
                    ${evaluationData.lowestSales.map((data) => `
                        <tr>
                            <td>${data.productName}</td>
                            <td>${data.quantity}</td>
                            <td>${data.totalPrice}</td>
                        </tr>
                    `).join('')}
                    <tr class="special-row">
                        <td colspan="3">Produk Teratas</td>
                    </tr>
                    ${evaluationData.topProduct.map((data) => `
                        <tr class="summary">
                            <td class="special-td">${data.type}</td>
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

  const clickableRows = container.querySelectorAll('.clickable-row')
  const menuIcon = container.querySelector('.main-menu-icon')
  const navList = container.querySelector('.main-nav-list')
  const mainContent = container.querySelector('.transac-main')
  const detailTransacTable = document.getElementById('detailTransaction')

  let lastClickedRow = null;

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

  clickableRows.forEach((row) => {
    row.addEventListener('click', () => {
      const clickedDate = row.querySelector('td:first-child').textContent

      if (lastClickedRow === row) {
        detailTransacTable.style.display = 'none';
        lastClickedRow = null;
      } else {
        detailTransacTable.style.display = 'flex';
        lastClickedRow = row;
      }

      const filteredTransactionData = transactionData.filter((data) => data.date === clickedDate)

      const detailTransacTableBody = document.getElementById('detailTransacTable').querySelector('tbody')
      detailTransacTableBody.innerHTML = filteredTransactionData.map((data) => `
          <tr>
            <td>${data.productName}</td>
            <td>${data.quantity}</td>
            <td>${data.pricePerUnit}</td>
            <td>${data.totalPrice}</td>
          </tr>
        `).join('')
    })
  })
}

export default renderTransactionPage
