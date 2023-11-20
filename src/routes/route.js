import renderLandingPage from '../scripts/pages/landingPage'
import renderRegisterPage from '../scripts/pages/registerPage'

const renderPage = () => {
  const appContainer = document.querySelector('#app')
  const path = window.location.pathname

  if (path === '/register') {
    renderRegisterPage(appContainer)
  } else {
    renderLandingPage(appContainer)
  }
}

export default renderPage
