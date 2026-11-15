/* ==========================================================
   INTERACTIVIDAD GLOBAL Y CARGA DEL FOOTER - LE BOULEVARD
   ========================================================== */

// 1. Cargar el Footer de forma dinámica según la profundidad de ruta y preparar el estado inicial
document.addEventListener("DOMContentLoaded", function () {
    // Detecta automáticamente si estamos dentro de una subcarpeta (como /servicios/)
    const isInSubfolder = window.location.pathname.includes('/servicios/');
    const basePath = isInSubfolder ? '../' : '';

    const footerContainer = document.getElementById("footer");
    if (footerContainer) {
        fetch(basePath + "partials/footer.html")
            .then(res => {
                if (!res.ok) {
                    throw new Error("No se pudo cargar el footer");
                }
                return res.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(err => console.error("Error al cargar el footer:", err));
    }

    // Marcar ruta activa inmediatamente al cargar la página
    if (typeof marcarRutaActiva === 'function') {
        marcarRutaActiva();
    }

    // Renderizar estado inicial del carrito lateral y de la cotización completa desde localStorage
    actualizarInterfazCarrito();
    renderizarCotizacionCompleta();
});

// 2. Evento delegado global para abrir/cerrar el menú hamburguesa en dispositivos móviles
document.addEventListener('click', function(event) {
    const hamburgerBtn = event.target.closest('#hamburgerBtn');
    
    if (hamburgerBtn) {
        event.preventDefault();
        event.stopPropagation();
        const navLinks = document.getElementById('navLinks');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    }
});

// 3. Marcar la pestaña activa en la barra de navegación según la URL actual
function marcarRutaActiva() {
    let paginaActual = window.location.pathname.split("/").pop();
    
    if (paginaActual === "" || paginaActual === "/") {
        paginaActual = "index.html";
    }
    
    const enlaces = document.querySelectorAll('.nav-links a, .menu-bar a, #header a');
    
    enlaces.forEach(lnk => {
        lnk.classList.remove('active');
        const hrefAtributo = lnk.getAttribute('href');
        
        if (hrefAtributo === paginaActual) {
            lnk.classList.add('active');
        }
    });
}

// 4. Alternar visibilidad de la caja flotante de chat de WhatsApp
function toggleWhatsAppChat() {
    const chatBox = document.getElementById('whatsappChatBox');
    if (chatBox) {
        chatBox.classList.toggle('active');
    }
}

/* ==========================================================================
   INTERACTIVIDAD DEL CATÁLOGO Y FILTRADO POR CATEGORÍA
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const categoryLinks = document.querySelectorAll(".categorias-sidebar ul li a, .nav-links .dropdown-content a, .dropdown-menu a"); 
    const productCards = document.querySelectorAll(".product-card");

    // Mostrar solo las tarjetas que coincidan con la categoría seleccionada
    function filtrarCategoria(targetCategory) {
        productCards.forEach(card => {
            const cardCategory = card.getAttribute("data-category");
            if (cardCategory === targetCategory) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });

        // Actualizar estado activo en los enlaces del menú lateral de categorías
        const sidebarLinks = document.querySelectorAll(".categorias-sidebar ul li a");
        sidebarLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href) {
                const hrefClean = href.split('=').pop().replace("#", "");
                if (hrefClean === targetCategory) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            }
        });
    }

    // Interceptar clics en categorías cuando ya estamos en servicios.html para filtrar sin recargar
    categoryLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            
            if (href && (href.includes("?cat=") || href.includes("#"))) {
                if (window.location.pathname.includes("servicios.html")) {
                    e.preventDefault();
                    const targetCategory = href.includes("?cat=") ? href.split("?cat=")[1] : href.split("#")[1];
                    filtrarCategoria(targetCategory);
                    history.pushState(null, null, `?cat=${targetCategory}`);
                }
            }
        });
    });

    // Aplicar filtro inicial si la URL trae el parámetro ?cat=
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('cat');
    if (categoriaUrl) {
        filtrarCategoria(categoriaUrl);
    }
});

/* ==========================================================================
   CARRUSEL AUTOMÁTICO EN LA PÁGINA DE INICIO
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".page-inicio .hero-carousel");
    if (!carousel) return;

    const slides = carousel.querySelectorAll(".hero-slide");
    if (slides.length === 0) return;

    let currentIndex = 0;

    // Rotar diapositivas cada 4 segundos
    setInterval(() => {
        slides[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add("active");
    }, 4000);
});

/* ==========================================================================
   SELECTOR DE CANTIDAD Y PANEL LATERAL DE COTIZACIÓN (LOCALSTORAGE)
   ========================================================================== */

// Estado global persistido en localStorage
let carrito = JSON.parse(localStorage.getItem('leboulevard_cart')) || [];

// Incrementar cantidad en el selector numérico de la tarjeta de producto
function incrementarCantidad(btn) {
    const input = btn.parentElement.querySelector('.qty-input');
    if (input) {
        input.value = parseInt(input.value || 1) + 1;
    }
}

// Decrementar cantidad en el selector numérico sin bajar de 1
function decrementarCantidad(btn) {
    const input = btn.parentElement.querySelector('.qty-input');
    if (input) {
        const val = parseInt(input.value || 1);
        if (val > 1) {
            input.value = val - 1;
        }
    }
}

// Abrir el panel lateral derecho de cotización y su fondo oscuro (overlay)
function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) {
        overlay.classList.add('active');
        overlay.style.display = 'block';
    }
}

// Cerrar el panel lateral derecho de cotización y su overlay
function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
    }
}

// Agregar un producto desde su tarjeta, acumular si ya existe y abrir el panel lateral
function agregarAlCarrito(button) {
    const card = button.closest('.product-card');
    if (!card) return;

    const titleEl = card.querySelector('.product-info h3');
    const id = card.getAttribute('data-id') || (titleEl ? titleEl.textContent.trim().toLowerCase().replace(/\s+/g, '-') : 'item');
    const name = card.getAttribute('data-name') || (titleEl ? titleEl.textContent.trim() : 'Producto');
    const price = parseFloat(card.getAttribute('data-price')) || 0;
    const qtyInput = card.querySelector('.qty-input');
    const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;
    const imgElement = card.querySelector('.product-image img');
    const image = imgElement ? imgElement.getAttribute('src') : '';

    const existingIndex = carrito.findIndex(item => item.id === id);
    if (existingIndex > -1) {
        carrito[existingIndex].quantity += quantity;
    } else {
        carrito.push({ id, name, price, quantity, image });
    }

    // Restablecer el selector de la tarjeta a 1 unidad
    if (qtyInput) qtyInput.value = 1;

    guardarYActualizar();
    openCart();
}

// Modificar cantidad (+1 / -1) de un ítem dentro del carrito o de la tabla completa
function cambiarCantidadCarrito(index, delta) {
    if (!carrito[index]) return;
    carrito[index].quantity += delta;
    if (carrito[index].quantity <= 0) {
        carrito.splice(index, 1);
    }
    guardarYActualizar();
}

// Eliminar un producto puntual de la cotización
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarYActualizar();
}

// Guardar en localStorage y refrescar tanto el panel lateral como la vista completa
function guardarYActualizar() {
    localStorage.setItem('leboulevard_cart', JSON.stringify(carrito));
    actualizarInterfazCarrito();
    renderizarCotizacionCompleta();
}

// Ajustar la ruta relativa de las imágenes según si estamos en /servicios/ o en la raíz
function normalizarRutaImagen(ruta) {
    if (!ruta) return '';
    const isSub = window.location.pathname.includes('/servicios/');
    if (isSub && !ruta.startsWith('../') && !ruta.startsWith('http')) {
        return '../' + ruta;
    }
    if (!isSub && ruta.startsWith('../')) {
        return ruta.replace(/^\.\.\//, '');
    }
    return ruta;
}

// Actualizar contador del header, subtotales y lista de ítems del panel lateral
function actualizarInterfazCarrito() {
    const container = document.getElementById('cartItemsContainer') || document.querySelector('.cart-items-container');
    const headerCount = document.getElementById('cart-count');
    const headerTotal = document.getElementById('cart-total');
    const subtotalText = document.getElementById('cartSubtotalText');
    const totalText = document.getElementById('cartTotalText');

    let totalItems = 0;
    let totalMonto = 0;

    carrito.forEach(item => {
        totalItems += item.quantity;
        totalMonto += item.price * item.quantity;
    });

    if (headerCount) headerCount.textContent = totalItems;
    if (headerTotal) headerTotal.textContent = totalMonto.toFixed(2);
    if (subtotalText) subtotalText.textContent = `S/. ${totalMonto.toFixed(2)}`;
    if (totalText) totalText.textContent = `S/. ${totalMonto.toFixed(2)}`;

    if (!container) return;

    if (carrito.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#888; margin-top:40px;">Tu lista de cotización está vacía.</p>`;
        return;
    }

    container.innerHTML = carrito.map((item, index) => {
        const imgSrc = normalizarRutaImagen(item.image);
        return `
            <div class="cart-item-row">
                <img src="${imgSrc}" alt="${item.name}" class="cart-item-thumb">
                <div class="cart-item-body">
                    <span class="cart-item-brand">Le Boulevard</span>
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-price">S/. ${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="cart-mini-qty">
                        <button type="button" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
                    </div>
                </div>
                <button type="button" class="cart-item-delete" onclick="eliminarDelCarrito(${index})" title="Eliminar">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');
}

/* ==========================================================================
   VISTA DE COTIZACIÓN COMPLETA (cotizaonline.html)
   ========================================================================== */

// Renderizar tabla detallada y resumen lateral en cotizaonline.html
function renderizarCotizacionCompleta() {
    const tbody = document.getElementById('cotizacionTableBody');
    const accionesBox = document.getElementById('cotizacionTableActions');
    const resumenUnidades = document.getElementById('resumenUnidades');
    const resumenSubtotal = document.getElementById('resumenSubtotal');
    const resumenTotal = document.getElementById('resumenTotal');

    if (!tbody) return;

    let totalUnidades = 0;
    let totalMonto = 0;

    carrito.forEach(item => {
        totalUnidades += item.quantity;
        totalMonto += item.price * item.quantity;
    });

    if (resumenUnidades) resumenUnidades.textContent = `${totalUnidades} und`;
    if (resumenSubtotal) resumenSubtotal.textContent = `S/. ${totalMonto.toFixed(2)}`;
    if (resumenTotal) resumenTotal.textContent = `S/. ${totalMonto.toFixed(2)}`;

    if (carrito.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="cotizacion-vacia-box">
                        <i class="fa-solid fa-clipboard-list"></i>
                        <p>Aún no has seleccionado artículos para tu cotización.</p>
                        <a href="servicios.html" class="btn-seguir-viendo">Explorar Servicios</a>
                    </div>
                </td>
            </tr>
        `;
        if (accionesBox) accionesBox.style.display = 'none';
        return;
    }

    if (accionesBox) accionesBox.style.display = 'flex';

    tbody.innerHTML = carrito.map((item, index) => {
        const subtotalItem = item.price * item.quantity;
        const imgSrc = normalizarRutaImagen(item.image);
        return `
            <tr>
                <td>
                    <div class="cot-prod-cell">
                        ${imgSrc ? `<img src="${imgSrc}" alt="${item.name}" class="cot-prod-img">` : ''}
                        <span class="cot-prod-name">${item.name}</span>
                    </div>
                </td>
                <td>S/. ${item.price.toFixed(2)}</td>
                <td>
                    <div class="cot-qty-box">
                        <button type="button" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
                    </div>
                </td>
                <td><strong>S/. ${subtotalItem.toFixed(2)}</strong></td>
                <td>
                    <button type="button" class="btn-eliminar-fila" onclick="eliminarDelCarrito(${index})" title="Quitar">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Vaciar todos los artículos de la cotización previa confirmación
function limpiarCotizacionCompleta() {
    if (carrito.length === 0) return;
    if (confirm("¿Deseas vaciar todos los artículos de tu cotización?")) {
        carrito = [];
        guardarYActualizar();
    }
}

// Enviar cotización rápida desde el panel lateral hacia WhatsApp
function enviarCotizacionWhatsApp() {
    if (carrito.length === 0) {
        alert("Agrega al menos un producto antes de enviar tu cotización.");
        return;
    }

    let mensaje = "Hola *Le Boulevard Catering*, deseo cotizar los siguientes artículos:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const sub = item.price * item.quantity;
        total += sub;
        mensaje += `• *${item.quantity}x* ${item.name} (S/. ${sub.toFixed(2)})\n`;
    });

    mensaje += `\n*Total estimado:* S/. ${total.toFixed(2)}\n¿Me confirman disponibilidad y costo de envío?`;

    const url = `https://wa.me/51924668399?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// Enviar cotización completa incluyendo los datos opcionales del evento hacia WhatsApp
function enviarCotizacionCompletaWhatsApp() {
    if (carrito.length === 0) {
        alert("Agrega al menos un producto antes de enviar tu cotización.");
        return;
    }

    const nombre = document.getElementById('eventoNombre')?.value.trim();
    const fecha = document.getElementById('eventoFecha')?.value;
    const lugar = document.getElementById('eventoLugar')?.value.trim();
    const tipo = document.getElementById('eventoTipo')?.value;

    let mensaje = "Hola *Le Boulevard Catering*, solicito cotización para los siguientes artículos:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const sub = item.price * item.quantity;
        total += sub;
        mensaje += `• *${item.quantity}x* ${item.name} — S/. ${sub.toFixed(2)}\n`;
    });

    mensaje += `\n*Subtotal estimado:* S/. ${total.toFixed(2)}\n`;

    if (nombre || fecha || lugar || tipo) {
        mensaje += `\n*Detalles del evento:*\n`;
        if (nombre) mensaje += `• Cliente: ${nombre}\n`;
        if (tipo) mensaje += `• Tipo: ${tipo}\n`;
        if (fecha) mensaje += `• Fecha: ${fecha}\n`;
        if (lugar) mensaje += `• Lugar: ${lugar}\n`;
    }

    mensaje += `\nQuedo atento a la confirmación de disponibilidad y costo de traslado.`;

    const url = `https://wa.me/51924668399?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}