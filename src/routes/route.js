import renderLandingPage from '../scripts/pages/landingPage'
import renderRegisterPage from '../scripts/pages/registerPage'
import renderLoginPage from '../scripts/pages/loginPage'
import renderTransactionPage from '../scripts/pages/transactionPage'

const renderPage = () => {
  const appContainer = document.querySelector('#app')
  const path = window.location.pathname

  switch (path) {
    case '/register':
      renderRegisterPage(appContainer)
      break

    case '/login':
      renderLoginPage(appContainer)
      break

    case '/transaction':
      renderTransactionPage(appContainer)
      break

    default:
      renderLandingPage(appContainer)
  }
}

export default renderPage
