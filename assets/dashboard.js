// Fungsionalitas Keranjang
const showCartButton = document.getElementById("showCart"); // Tombol Keranjang
const cartSection = document.getElementById("cartSection"); //Seluruh Cart
const closeCartButton = document.getElementById("closeCart"); //Menutup Cart

//Membuka dan Menutup Cart
showCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", hideCart);

function openCart() {
  cartSection.classList.add("show");
}

function hideCart() {
  cartSection.classList.remove("show");
}
