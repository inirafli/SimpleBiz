import '../../styles/transaction.css'

import userIcon from '../../public/icons/profile-icon.png'
import appIcon from '../../public/icons/simplebiz-icons.png'

const renderTransactionPage = (container) => {
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
                    <tr>
                        <td>1</td>
                        <td>01/01/2023</td>
                        <td>#WS00281</td>
                        <td>5</td>
                        <td>Rp. 35,000</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>01/01/2023</td>
                        <td>#WS00282</td>
                        <td>5</td>
                        <td>Rp. 100,000</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>01/01/2023</td>
                        <td>#WS00283</td>
                        <td>5</td>
                        <td>Rp. 25,000</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>01/01/2023</td>
                        <td>#WS00284</td>
                        <td>5</td>
                        <td>Rp. 31,000</td>
                    </tr>
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
                    <tr>
                        <td>1</td>
                        <td>Biosol</td>
                        <td>5</td>
                        <td>Rp. 35,000</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Biosol</td>
                        <td>10</td>
                        <td>Rp. 100,000</td>
                    </tr>
                    <tr class="special-row">
                        <td colspan="4">Penjualan Terendah</td>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>Biosol</td>
                        <td>5</td>
                        <td>Rp. 35,000</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Biosol</td>
                        <td>10</td>
                        <td>Rp. 100,000</td>
                    </tr>
                    <tr class="special-row">
                        <td colspan="4">Produk Teratas</td>
                    </tr>
                    <tr class="summary">
                        <td class="special-td" colspan="2">Penjualan Tertinggi</td>
                        <td>Biosol</td>
                        <td>Rp. 200,000</td>
                    </tr>
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
}

export default renderTransactionPage
