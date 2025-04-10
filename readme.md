# StreamFlix
___

### Descripción
Esta app tiene como objetivo simular un hub de entretenimiento siendo desarrollado con fines de evaluación para Mega Semillero. Consiste en una página similar a lo que seria una SPA con algún framework frontend. Sin embargo esta siendo desarrollada con JavaScript Vanilla. En esta app web se muestra un cattálogo de películas y series. Cómo parte de las funcionalidades se pueden agregar o quitar de favoritos, cuenta con  una vista de detalles y un login simulado.
___

### Instrucciones de uso

Opción 1

1. Descargar repositorio desde este link: [StreamFlix](https://github.com/TrePiceno/StreamFlixApp "StreamFlix")
2. Descomprimir la carpeta descargada
3. Abrir carpeta del proyecto en Visual Studio Code
4. Ejecutar archivo *index.html*  con live server

Opción 2

1. Abrir una Visual Studio Code
2. Abrir terminal
2. Ejecutar comando con la url: *git clone https://github.com/TrePiceno/StreamFlixApp.git*
4. Ejecutar archivo *index.html* con el live server

Opción 3

1. Entrar al repositorio: [StreamFlix](https://github.com/TrePiceno/StreamFlixApp "StreamFlix")
2. Ir al *about* en el repositorio y acceder al link de la página (https://trepiceno.github.io/StreamFlixApp/)

___

### Capturas de pantalla
![login](./public/images/Wireframe%201.png "login")
Wireframe del Login

![Home](./public/images/Wireframe%202.png "home")
Wireframe del Home

![Detalle](./public/images/Wireframe%203.png "detalle")
Wireframe del detalle de cada pelicula o serie

___

### Capturas de pantalla
![login](./public/images/vistas_1.png "login")
En la primer vista tenemos un login simulado, para acceder al sitio es necesario ingresar en el campo usuario la palabra *admin* y en el campo de la contraseña *pass123*

![Home](./public/images/vistas_2.png "Home")
En la vista del home, tenemos el catálogo principal del sitio.

![vista detalle](./public/images/vistas_3.png "Vista detalle")
La siguente imagen represanta la vista del detalle de la película o serie seleccionada

![Favoritos](./public/images/vistas_4.png "Favoritos")
En esta vista tenemos aquellas películas que se añadieron a favoritos por el usuario

![Información](./public/images/vistas_5.png "Información")
Por último, tenemos la vista por genero, en este caso se muestra el contenido clasificado como *drama*
___
### Proceso de desarrollo

Hice bastantes iteraciones durante el desarrollo; cree primero la estrutura del html donde se mostraría el catálogo de películas y series, pero luego tuve que integrar un segundo archivo para el login. Cree y trabajé la lógica del archivo login.js, considerando que se trata de un login simulado no me tomó mucho tiempo desarrollarlo. Luego para poder mostrar la lista en dicidí trabajar con un archivo json, el cual para añadir todas las películas y series de las que iba a disponer pedí ayuda a Gemini para la generación de todas estas y luego de varias iteraciones mientras trabaja las cards de las vistas fui implementando más propiedades al json. En uno de los planteamientos para la creación de las cards hice uso de innerHtml para usar código hmtl en el archivo js, lo cual desconocia que no era una práctica segura hasta que lo mencionó el Challenger en la última sesión por lo que decidí refactorizar y usar Dom Scripting para la creación de elementos HMTL y evitar la vulnarabilidad, aunque se trate de un sitio de práctica, considero conviente trabajar implementando buenas practicas en los proyectos. Al final, luego de trabajar toda la lógica llego el momento de dar estilos con CCS puro.


___
### Sprint Review
| ¿Qué salió bien? | ¿Qué puedo hacer diferente? | ¿Qué no salió bien? |
|------------------|:---------------------------:|--------------------:|
| Al ser una aplicación sencilla, no fue tan dificil estructurarla, a pesar de no haber planificado el proyecto.Trabajar la lógica según los requerimientos no fue tan complejo, diría que fue una buena practica para comenzar con este proyecto e ir teniendo más idea de como solventarlo. | Trabajar más en la seguridad de las aplicaciones a desarrollar. Además, una mejor pleneación de la aplicación podría resultar en menos iteraciones durante el desarrollo, si bien si puede haber refactorización de código, al menos podría ser más eficiente el proceso de desarrollo. | De momento el diseño de las cards no me convencen del todo, la posición del texto no es uniforme en las cards, a pesar de que intente usar las propiedades necesarias para solucionarlo, no resulto lo esperado, tendré que seguir intentarlo hasta lograrlo. |