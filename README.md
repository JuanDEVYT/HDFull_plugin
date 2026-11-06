# HDFull para Kino

Plugin de HDFull con inicio de sesión mediante el navegador visual nativo de Kino.

## Inicio de sesión

1. Abre **HDFull** desde Kino.
2. Pulsa **Abrir inicio de sesión**.
3. Inicia sesión directamente en la ventana de HDFull.
4. Pulsa **Listo** al terminar.

Kino recoge únicamente las cookies declaradas y las guarda en el ajuste de tipo `password` cifrado del dispositivo. El plugin no recibe ni registra tu usuario, contraseña o valores de cookie.

## Estado de esta versión

La pantalla de login visual y el guardado seguro de sesión están implementados. El sitio responde con Cloudflare (`403`) desde el entorno de desarrollo, por lo que todavía se requiere probar en Kino con una sesión real antes de habilitar el scraper y el reproductor como funciones verificadas.

Requiere Kino compatible con `visualBrowser` (apiVersion 20; Kino 0.9.81 o posterior).
