let cart = [];

function addToCart(name, price) {
    cart.push({ name, price });
    displayCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

function displayCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    cartItemsElement.innerHTML = ''; // Clear previous items

    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <span>${item.name} - &#8377;${item.price}</span>
            <button class="remove-item" onclick="removeFromCart(${index})">Remove</button> `;
        cartItemsElement.appendChild(li);
        total += item.price;
    });

    cartTotalElement.textContent = total.toFixed(2);
}