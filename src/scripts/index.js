import renderLandingPage from './pages/landingPage'

console.log('Hello, SimpleBiz')

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.querySelector('#app')
  renderLandingPage(appContainer)
})
