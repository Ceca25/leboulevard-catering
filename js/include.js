// 1. Cargar el Header y ejecutar la marcación de ruta SOLO cuando termine de cargar
fetch("partials/header.html")
  .then(res => res.text())
  .then(data => {
      document.getElementById("header").innerHTML = data;
      // ¡Paso clave! Ejecutamos la función justo aquí, cuando los enlaces ya existen en el HTML
      marcarRutaActiva(); 
  })
  .catch(err => console.error("Error al cargar el header:", err));

// 2. Cargar el Footer de forma independiente
fetch("partials/footer.html")
  .then(res => res.text())
  .then(data => {
      document.getElementById("footer").innerHTML = data;
  })
  .catch(err => console.error("Error al cargar el footer:", err));


// 3. Tu función de enrutado (ahora se ejecutará en el momento correcto)
function marcarRutaActiva() {
    let paginaActual = window.location.pathname.split("/").pop();
    
    if (paginaActual === "") {
        paginaActual = "index.html";
    }
    
    // Ahora que el fetch terminó, estos elementos ya existen en el DOM
    const enlaces = document.querySelectorAll('.nav-links a, .menu-bar a, #header a');
    
    enlaces.forEach(lnk => {
        lnk.classList.remove('active');
        
        const hrefAtributo = lnk.getAttribute('href');
        
        if (hrefAtributo === paginaActual) {
            lnk.classList.add('active');
        }
    });
}

// 4. FUNCIÓN DEL CHAT (VA AFUERA, LIBRE Y ACCESIBLE)
function toggleWhatsAppChat() {
    const chatBox = document.getElementById('whatsappChatBox');
    if (chatBox) {
        chatBox.classList.toggle('active');
    } else {
        console.error("El elemento #whatsappChatBox aún no se ha cargado en el HTML.");
    }
}

/* ==========================================================================
   INTERACTIVIDAD DEL CATÁLOGO Y COTIZADOR (LE BOULEVARD CATERING)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    
    const categoryLinks = document.querySelectorAll(".categorias-sidebar ul li a, .nav-links .dropdown-content a, .dropdown-menu a"); 
    const productCards = document.querySelectorAll(".product-card");

    // Función de filtrado
    function filtrarCategoria(targetCategory) {
        productCards.forEach(card => {
            const cardCategory = card.getAttribute("data-category");
            if (cardCategory === targetCategory) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });

        // Sincronizar estado activo en la barra lateral
        const sidebarLinks = document.querySelectorAll(".categorias-sidebar ul li a");
        sidebarLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href) {
                // Limpiamos tanto '?' como '#' para comparar
                const hrefClean = href.split('=').pop().replace("#", "");
                if (hrefClean === targetCategory) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            }
        });
    }

    // Escuchar clics dinámicos cuando ya se está dentro de servicios.html
    categoryLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            
            if (href && (href.includes("?cat=") || href.includes("#"))) {
                if (window.location.pathname.includes("servicios.html")) {
                    e.preventDefault(); // Evita cualquier recarga o salto
                    
                    // Extraemos el nombre de la categoría del parámetro o del hash
                    const targetCategory = href.includes("?cat=") ? href.split("?cat=")[1] : href.split("#")[1];
                    filtrarCategoria(targetCategory);
                    
                    // Actualiza la URL estéticamente
                    history.pushState(null, null, `?cat=${targetCategory}`);
                }
            }
        });
    });

    // --- LEER EL PARÁMETRO AL CARGAR LA PÁGINA (SIN SALTOS) ---
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('cat');

    if (categoriaUrl) {
        filtrarCategoria(categoriaUrl);
    }
});