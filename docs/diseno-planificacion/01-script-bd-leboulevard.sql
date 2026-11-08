-- ============================================================================
-- SCRIPT DE BASE DE DATOS - LE BOULEVARD CATERING & EVENTOS
-- Proyecto: Plataforma Web Comercial & Sistema de Cotizaciones
-- Versión: 1.0 (Fase 2 - Persistencia e Inventarios)
-- Motor: Microsoft SQL Server 2019 / 2022
-- Desarrollado por: CECASystem (Carlos Cárdenas Altuna - DNI: 18130283)
-- Cliente: Le Boulevard Catering & Eventos (Mónica Córdova Vilchez - DNI: 03882099)
-- Ubicación: Trujillo, La Libertad, Perú
-- ============================================================================

USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'BD_LeBoulevard')
BEGIN
    ALTER DATABASE BD_LeBoulevard SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BD_LeBoulevard;
END
GO

CREATE DATABASE BD_LeBoulevard;
GO

USE BD_LeBoulevard;
GO

-- ============================================================================
-- 1. TABLA: CATEGORIAS
-- ============================================================================
CREATE TABLE CATEGORIAS (
    IdCategoria INT IDENTITY(1,1) NOT NULL,
    NombreCategoria VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(255) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(50) NOT NULL DEFAULT HOST_NAME(),
    FechaModificacion DATETIME NULL,
    UsuarioModificacion VARCHAR(50) NULL,
    CONSTRAINT PK_CATEGORIAS PRIMARY KEY CLUSTERED (IdCategoria ASC)
);
GO

-- ============================================================================
-- 2. TABLA: ARTICULOS (Inventario de Menaje, Equipos y Servicios)
-- ============================================================================
CREATE TABLE ARTICULOS (
    IdArticulo INT IDENTITY(1,1) NOT NULL,
    IdCategoria INT NOT NULL,
    CodigoSKU VARCHAR(50) NULL,
    NombreArticulo VARCHAR(150) NOT NULL,
    Descripcion VARCHAR(500) NULL,
    PrecioAlquiler DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PrecioReposicion DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    StockActual INT NOT NULL DEFAULT 0,
    StockDisponible INT NOT NULL DEFAULT 0,
    ImagenUrl VARCHAR(255) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(50) NOT NULL DEFAULT HOST_NAME(),
    FechaModificacion DATETIME NULL,
    UsuarioModificacion VARCHAR(50) NULL,
    CONSTRAINT PK_ARTICULOS PRIMARY KEY CLUSTERED (IdArticulo ASC),
    CONSTRAINT FK_ARTICULOS_CATEGORIAS FOREIGN KEY (IdCategoria) REFERENCES CATEGORIAS(IdCategoria)
);
GO

-- ============================================================================
-- 3. TABLA: CLIENTES
-- ============================================================================
CREATE TABLE CLIENTES (
    IdCliente INT IDENTITY(1,1) NOT NULL,
    TipoDocumento VARCHAR(20) NOT NULL DEFAULT 'DNI', -- DNI / RUC
    NumeroDocumento VARCHAR(20) NOT NULL,
    NombreRazonSocial VARCHAR(200) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NULL,
    Direccion VARCHAR(255) NULL,
    Distrito VARCHAR(100) NULL DEFAULT 'Trujillo',
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(50) NOT NULL DEFAULT HOST_NAME(),
    CONSTRAINT PK_CLIENTES PRIMARY KEY CLUSTERED (IdCliente ASC)
);
GO

-- ============================================================================
-- 4. TABLA: COTIZACIONES (Cabecera de la solicitud)
-- ============================================================================
CREATE TABLE COTIZACIONES (
    IdCotizacion INT IDENTITY(1,1) NOT NULL,
    CodigoCotizacion VARCHAR(20) NOT NULL,
    IdCliente INT NOT NULL,
    FechaEvento DATE NOT NULL,
    HoraEvento TIME NULL,
    LugarEvento VARCHAR(255) NOT NULL,
    DistritoEvento VARCHAR(100) NOT NULL DEFAULT 'Trujillo',
    CostoFlete DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    SubTotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    MontoTotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    EstadoCotizacion VARCHAR(30) NOT NULL DEFAULT 'Pendiente', -- Pendiente / Confirmada / Rechazada / Finalizada
    OrigenSolicitud VARCHAR(50) NOT NULL DEFAULT 'Web WhatsApp',
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(50) NOT NULL DEFAULT HOST_NAME(),
    FechaModificacion DATETIME NULL,
    UsuarioModificacion VARCHAR(50) NULL,
    CONSTRAINT PK_COTIZACIONES PRIMARY KEY CLUSTERED (IdCotizacion ASC),
    CONSTRAINT FK_COTIZACIONES_CLIENTES FOREIGN KEY (IdCliente) REFERENCES CLIENTES(IdCliente)
);
GO

-- ============================================================================
-- 5. TABLA: DETALLE_COTIZACIONES
-- ============================================================================
CREATE TABLE DETALLE_COTIZACIONES (
    IdDetalle INT IDENTITY(1,1) NOT NULL,
    IdCotizacion INT NOT NULL,
    IdArticulo INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_DETALLE_COTIZACIONES PRIMARY KEY CLUSTERED (IdDetalle ASC),
    CONSTRAINT FK_DETALLE_COTIZACIONES_CABECERA FOREIGN KEY (IdCotizacion) REFERENCES COTIZACIONES(IdCotizacion) ON DELETE CASCADE,
    CONSTRAINT FK_DETALLE_COTIZACIONES_ARTICULOS FOREIGN KEY (IdArticulo) REFERENCES ARTICULOS(IdArticulo)
);
GO

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES (CATEGORÍAS DE LE BOULEVARD)
-- ============================================================================
INSERT INTO CATEGORIAS (NombreCategoria, Descripcion) VALUES 
('Alquiler de Menaje', 'Platos, cubiertos, menaje variado para cenas y recepciones'),
('Alquiler de Cristalería', 'Copas de vino, champán, vasos multiuso y jarras'),
('Alquiler de Cafeteras y Termos', 'Cafeteras eléctricas de alta capacidad y termos térmicos'),
('Alquiler de Mesas Wash y Plegables', 'Mesas de soporte, trabajo y banquetes'),
('Accesorios de Bocaditos y Charcutería', 'Bandejas, fuentes, bases de madera y niveles'),
('Alquiler de Cajas Chinas y Parrillas', 'Equipos térmicos y parrillas para eventos campestres'),
('Servicio de Mozos y Atención', 'Personal calificado para protocolo y atención de mesas'),
('Servicio de Barman y Seguridad', 'Barman profesional para barra y control de accesos'),
('Servicio de Luces, Sonido y Toldos', 'Estructuras, iluminación y audio profesional'),
('Catering Integral y Buffet', 'Servicio completo de alimentación y banquetes corporativos');
GO

-- ============================================================================
-- VISTA DE CONSULTA GENERAL DE COTIZACIONES
-- ============================================================================
CREATE VVIEW V_RESUMEN_COTIZACIONES AS
SELECT 
    c.IdCotizacion,
    c.CodigoCotizacion,
    cl.NombreRazonSocial AS Cliente,
    cl.Telefono,
    c.FechaEvento,
    c.LugarEvento,
    c.DistritoEvento,
    c.MontoTotal,
    c.EstadoCotizacion,
    c.FechaCreacion
FROM COTIZACIONES c
INNER JOIN CLIENTES cl ON c.IdCliente = cl.IdCliente;
GO
