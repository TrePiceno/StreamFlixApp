let allContent = [];
let showContent = document.getElementById("mostrarLista");
let favoritos = [];

addEventListener("DOMContentLoaded", async () => {
    try {
        await fetch("mockup.json")
            .then(response => response.json())
            .then(data => {
                allContent.push(...data.peliculas, ...data.series);
                showList(allContent);
            })
    } catch (error) {
        console.log(error)
    }
});

function showList(content) {

    showContent.innerHTML = '';

    if (content.length === 0) {
        const noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No se encontraron resultados';
        showContent.appendChild(noResults);
        return;
    }

    content.forEach(item => {
        // Contenedor principal
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = item.imagen;
        img.alt = item.titulo;

        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        const cardTitle = document.createElement('h3');
        cardTitle.className = 'card-title';
        cardTitle.textContent = item.titulo;

        const cardInfo = document.createElement('div');
        cardInfo.className = 'card-info';

        // Párrafos
        const sipnosis = document.createElement('p');
        sipnosis.textContent = `Sipnosis: ${item.sipnosis}`;
        const year = document.createElement('p');
        year.textContent = `Año: ${item.año}`;
        const filmDirector = document.createElement('p');
        filmDirector.textContent = `Director: ${item.director}`;
        const genre = document.createElement('p');
        genre.textContent = `Género: ${item.genero}`;

        // Contenedor para los botones
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';

        // Botones
        const showButton = document.createElement('button');
        showButton.textContent = 'Ver';
        showButton.addEventListener('click', () => watchDetail(item.id));

        const btnOcultar = document.createElement('button');
        btnOcultar.textContent = 'Ocultar';
        btnOcultar.addEventListener('click', () => hideFromList(item.id));

        const addFavoritesButton = document.createElement('button');
        addFavoritesButton.textContent = '❤';
        addFavoritesButton.addEventListener('click', () => addToFavorites(item.id));

        // Añadir botones al contenedor
        buttonsContainer.appendChild(showButton);
        buttonsContainer.appendChild(btnOcultar);
        buttonsContainer.appendChild(addFavoritesButton);

        // Añadir párrafos y contenedor de botones al div de información
        cardInfo.appendChild(sipnosis);
        cardInfo.appendChild(year);
        cardInfo.appendChild(filmDirector);
        cardInfo.appendChild(genre);
        cardInfo.appendChild(buttonsContainer);


        // Añadir título e información al contenido de la tarjeta
        cardContent.appendChild(cardTitle);
        cardContent.appendChild(cardInfo);

        // Añadir imagen y contenido a la tarjeta
        card.appendChild(img);
        card.appendChild(cardContent);

        // Añadir la tarjeta completa al contenedor principal
        showContent.appendChild(card);
    });
}

let showListByGenre = (genero) => {
    let showListByGenre = allContent.filter(item => item.genero.toLowerCase().includes(genero))
    showList(showListByGenre);
};

let addToFavorites = (id) => {
    let repeatedContent = favoritos.find(item => item.id === id);
    if (repeatedContent) {
        alert("El contenido ya se encuentra en la lista de favoritos");
        return;
    }
    let contenidoFavorito = allContent.find(item => item.id === id);
    favoritos.push(contenidoFavorito);
    alert("Contenido añadido a favoritos");
};

function showFavoritesList() {
    showContent.innerHTML = ``;

    const cardFavorites = document.createElement('div');
    cardFavorites.className = 'card-favorites';

    favoritos.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = item.imagen;
        img.alt = item.titulo;

        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        const cardTitle = document.createElement('h3');
        cardTitle.className = 'card-title';
        cardTitle.textContent = item.titulo;

        const cardInfo = document.createElement('div');
        cardInfo.className = 'card-info';

        const sipnosis = document.createElement('p');
        sipnosis.textContent = `Sipnosis: ${item.sipnosis}`;

        const year = document.createElement('p');
        year.textContent = `Año: ${item.año}`;

        const filmDirector = document.createElement('p');
        filmDirector.textContent = `Director: ${item.director}`;

        const genre = document.createElement('p');
        genre.textContent = `Género: ${item.genero}`;

        const showButton = document.createElement('button');
        showButton.textContent = 'Ver';
        showButton.addEventListener('click', () => showDetailFavorites(item.id));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '❌';
        deleteButton.addEventListener('click', () => removeFromFavorites(item.id));

        cardInfo.appendChild(sipnosis);
        cardInfo.appendChild(year);
        cardInfo.appendChild(filmDirector);
        cardInfo.appendChild(genre);
        cardInfo.appendChild(showButton);
        cardInfo.appendChild(deleteButton);

        cardContent.appendChild(cardTitle);
        cardContent.appendChild(cardInfo);

        card.appendChild(img);
        card.appendChild(cardContent);

        cardFavorites.appendChild(card);
    });

    showContent.appendChild(cardFavorites);
};

function showDetailFavorites(id) {
    showContent.innerHTML = ``;
    let watchDetail = favoritos.filter(item => item.id === id);

    const cardDetail = document.createElement('div');
    cardDetail.className = 'card-detail';

    const img = document.createElement('img');
    img.src = watchDetail[0].imagenDetalle;
    img.alt = watchDetail[0].titulo;

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = watchDetail[0].titulo;

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    const sipnosis = document.createElement('p');
    sipnosis.textContent = `Sipnosis: ${watchDetail[0].sipnosis}`;

    const year = document.createElement('p');
    year.textContent = `Año: ${watchDetail[0].año}`;

    const filmDirector = document.createElement('p');
    filmDirector.textContent = `Director: ${watchDetail[0].director}`;

    const genre = document.createElement('p');
    genre.textContent = `Género: ${watchDetail[0].genero}`;

    cardInfo.appendChild(sipnosis);
    cardInfo.appendChild(year);
    cardInfo.appendChild(filmDirector);
    cardInfo.appendChild(genre);

    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardInfo);

    cardDetail.appendChild(img);
    cardDetail.appendChild(cardContent);

    showContent.appendChild(cardDetail);
}

function removeFromFavorites(id) {
    favoritos = favoritos.filter(item => item.id !== id);
    showFavoritesList(favoritos);
};


// función para ocultar contenido del array allContent

function hideFromList(id) {
    let hideElement = allContent.filter(item => item.id !== id);
    allContent = hideElement;
    showList(hideElement);
};


function watchDetail(id) {
    let watchDetail = allContent.filter(item => item.id === id);

    showContent.innerHTML = "";

    const cardDetail = document.createElement('div');
    cardDetail.className = 'card-detail';

    const img = document.createElement('img');
    img.src = watchDetail[0].imagenDetalle;
    img.alt = watchDetail[0].titulo;

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = watchDetail[0].titulo;

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    const sipnosis = document.createElement('p');
    sipnosis.textContent = `Sipnosis: ${watchDetail[0].sipnosis}`;

    const year = document.createElement('p');
    year.textContent = `Año: ${watchDetail[0].año}`;

    const filmDirector = document.createElement('p');
    filmDirector.textContent = `Director: ${watchDetail[0].director}`;

    const genre = document.createElement('p');
    genre.textContent = `Género: ${watchDetail[0].genero}`;

    // crear boton agregar a favoritos
    const button = document.createElement('button');
    button.className = 'agregar-favorito-detalle';
    button.textContent = 'Agregar a favoritos';
    button.addEventListener('click', () => {
        let repeatedContent = favoritos.find(item => item.id === id);
        if (repeatedContent) {
            alert("El contenido ya se encuentra en la lista de favoritos");
            return;
        }
        let contenidoFavorito = allContent.find(item => item.id === id);
        favoritos.push(contenidoFavorito);
        alert("Contenido añadido a favoritos");
    });


    cardInfo.appendChild(sipnosis);
    cardInfo.appendChild(year);
    cardInfo.appendChild(filmDirector);
    cardInfo.appendChild(genre);
    cardInfo.appendChild(button);

    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardInfo);

    cardDetail.appendChild(img);
    cardDetail.appendChild(cardContent);

    showContent.appendChild(cardDetail);
};