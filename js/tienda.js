const shopState = {
    user: null,
    cart: []
};

const getMessage = (key, defaultValue) => getTranslatedMessage(key, defaultValue);

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;"
}[character]));

const showConfirmation = (message, isError = false) => {
    const cartFeedback = document.getElementById("cart-feedback");

    if (cartFeedback) {
        cartFeedback.textContent = message;
        cartFeedback.className = `confirmation-message confirmation-message-visible${isError ? " confirmation-message-error" : ""}`;
    }
};

const getSession = async () => {
    try {
        const response = await fetch("../php/session.php", {
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("No se pudo consultar la sesión.");
        }

        return response.json();
    } catch (error) {
        console.error(error);
        return { authenticated: false };
    }
};

const updateCartCount = () => {
    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = shopState.cart.length;
    }
};

const updateAccountInterface = () => {
    const profileMenuButton = document.getElementById("profile-menu-button");
    const profileMenuList = document.getElementById("profile-menu-list");

    if (!profileMenuButton || !profileMenuList) {
        return;
    }

    if (shopState.user) {
        profileMenuButton.textContent = `👤 ${shopState.user.username}`;
        profileMenuButton.setAttribute("aria-label", `${getMessage("profile", "Perfil")}: ${shopState.user.username}`);
        profileMenuList.innerHTML = `<a href="../php/logout.php">${getMessage("logOut", "Cerrar sesión")}</a>`;
        return;
    }

    profileMenuButton.textContent = `👤 ${getMessage("profile", "Perfil")}`;
    profileMenuButton.setAttribute("aria-label", getMessage("profile", "Perfil"));
    profileMenuList.innerHTML = `
        <a href="login.html">${getMessage("logIn", "Iniciar sesión")}</a>
        <a href="register.html">${getMessage("signUp", "Registrarte")}</a>
    `;
};

const updateSession = async () => {
    const session = await getSession();
    shopState.user = session.authenticated ? session : null;
    updateAccountInterface();
};

const requestCart = async (path = "", options = {}) => {
    const response = await fetch(`../php/cart.php${path}`, {
        credentials: "same-origin",
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            shopState.user = null;
            shopState.cart = [];
            updateAccountInterface();
        }

        throw new Error(data.message || getMessage("cartSaveError", "No se pudo actualizar el carrito."));
    }

    return data;
};

const loadCart = async () => {
    if (!shopState.user) {
        shopState.cart = [];
        updateCartCount();
        renderCart();
        return;
    }

    try {
        const data = await requestCart();
        shopState.cart = data.items || [];
    } catch (error) {
        shopState.cart = [];
        showConfirmation(getMessage("cartLoadError", "No se pudo cargar el carrito."), true);
        console.error(error);
    }

    updateCartCount();
    renderCart();
};

const renderProductCards = () => {
    const productGrid = document.getElementById("product-grid");
    const products = getTranslationData("products", []);

    if (!productGrid || !Array.isArray(products)) {
        return;
    }

    productGrid.innerHTML = products.map((product) => `
        <article class="product-card">
            <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
            <div class="product-content">
                <h2>${escapeHtml(product.name)}</h2>
                <div class="product-footer">
                    <span class="product-price">$${escapeHtml(product.price)} ${escapeHtml(product.unit)}</span>
                    <button class="primary-button add-product-button" type="button" data-name="${escapeHtml(product.name)}" data-price="${escapeHtml(product.price)}">${getMessage("addProduct", "Agregar")}</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderCart = () => {
    const cartList = document.getElementById("cart-list");
    const cartSummary = document.getElementById("cart-summary");
    const cartTotal = document.getElementById("cart-total");

    if (!cartList || !cartSummary || !cartTotal) {
        return;
    }

    if (!shopState.user) {
        cartList.innerHTML = `<div class="empty-cart"><p>${getMessage("loginRequired", "Primero tienes que iniciar sesión.")}</p><a class="primary-button" href="login.html">${getMessage("logIn", "Iniciar sesión")}</a></div>`;
        cartSummary.style.display = "none";
        return;
    }

    if (shopState.cart.length === 0) {
        cartList.innerHTML = `<div class="empty-cart"><p>${getMessage("emptyCart", "El carrito está vacío.")}</p><a class="primary-button" href="store.html">${getMessage("goToStore", "Ir a la tienda")}</a></div>`;
        cartSummary.style.display = "none";
        return;
    }

    const total = shopState.cart.reduce((currentTotal, product) => currentTotal + Number(product.price), 0);

    cartList.innerHTML = shopState.cart.map((product) => `
        <article class="cart-product">
            <div>
                <h2>${escapeHtml(product.name)}</h2>
                <p>${getMessage("price", "Precio")}: $${escapeHtml(product.price)}</p>
            </div>
            <button class="primary-button remove-product-button" type="button" data-cart-id="${escapeHtml(product.id)}">${getMessage("removeProduct", "Quitar")}</button>
        </article>
    `).join("");

    cartTotal.textContent = total.toFixed(2);
    cartSummary.style.display = "block";
};

const addProductToCart = async (button) => {
    if (!shopState.user) {
        showConfirmation(getMessage("loginRequired", "Primero tienes que iniciar sesión."), true);
        return;
    }

    const product = {
        name: button.getAttribute("data-name"),
        price: button.getAttribute("data-price")
    };

    button.disabled = true;

    try {
        const data = await requestCart("", {
            method: "POST",
            body: JSON.stringify(product)
        });
        shopState.cart = data.items || [];
        updateCartCount();
        showConfirmation(`${product.name} ${getMessage("addedToCart", "fue agregado al carrito.")}`);
    } catch (error) {
        showConfirmation(error.message, true);
        console.error(error);
    } finally {
        button.disabled = false;
    }
};

const removeProductFromCart = async (button) => {
    const itemId = button.getAttribute("data-cart-id");
    button.disabled = true;

    try {
        const data = await requestCart(`?id=${encodeURIComponent(itemId)}`, { method: "DELETE" });
        shopState.cart = data.items || [];
        updateCartCount();
        renderCart();
    } catch (error) {
        showConfirmation(error.message, true);
        console.error(error);
    } finally {
        button.disabled = false;
    }
};

const completePurchase = async () => {
    if (!shopState.user) {
        showConfirmation(getMessage("loginRequired", "Primero tienes que iniciar sesión."), true);
        return;
    }

    try {
        const data = await requestCart("", {
            method: "POST",
            body: JSON.stringify({ action: "clear" })
        });
        shopState.cart = data.items || [];
        updateCartCount();
        renderCart();
        showConfirmation(getMessage("purchaseCompleted", "Gracias por tu compra."));
    } catch (error) {
        showConfirmation(error.message, true);
        console.error(error);
    }
};

const toggleProfileMenu = () => {
    const profileMenuButton = document.getElementById("profile-menu-button");
    const profileMenuList = document.getElementById("profile-menu-list");

    if (!profileMenuButton || !profileMenuList) {
        return;
    }

    const isOpen = profileMenuList.classList.toggle("profile-menu-visible");
    profileMenuButton.setAttribute("aria-expanded", isOpen);
};

const closeProfileMenu = () => {
    const profileMenuButton = document.getElementById("profile-menu-button");
    const profileMenuList = document.getElementById("profile-menu-list");

    if (profileMenuButton && profileMenuList) {
        profileMenuList.classList.remove("profile-menu-visible");
        profileMenuButton.setAttribute("aria-expanded", "false");
    }
};

const initializeStore = async () => {
    renderProductCards();
    await updateSession();
    await loadCart();
};

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (event) => {
        const addProductButton = event.target.closest(".add-product-button");
        const removeProductButton = event.target.closest(".remove-product-button");
        const purchaseButton = event.target.closest("#purchase-button");
        const profileMenuButton = event.target.closest("#profile-menu-button");

        if (addProductButton) {
            addProductToCart(addProductButton);
            return;
        }

        if (removeProductButton) {
            removeProductFromCart(removeProductButton);
            return;
        }

        if (purchaseButton) {
            completePurchase();
            return;
        }

        if (profileMenuButton) {
            toggleProfileMenu();
            return;
        }

        if (!event.target.closest(".profile-menu")) {
            closeProfileMenu();
        }
    });

    initializeStore();
});

document.addEventListener("translationsUpdated", initializeStore);
