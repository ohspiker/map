let map;
let isFirstLoad = true;
let currentCircle = null;

function initializeMap() {
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

async function loadRandomCity() {
    const response = await fetch('cities.json');
    const cities = await response.json();
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const { name, coords, wiki } = randomCity;

    map.setView(coords, 10);

    if (currentCircle) {
        map.removeLayer(currentCircle);
    }

    currentCircle = L.circle(coords, {
        color: '#E29578',
        fillColor: '#E29578',
        fillOpacity: 0.5,
        radius: 2000
    }).addTo(map);

    // Fetch Wikipedia summary and more information
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wiki}`)
        .then(response => response.json())
        .then(data => {
            const summary = data.extract_html || data.extract;
            const title = data.title;
            const coordinates = coords.join(', ');
            const image = data.originalimage ? `<img src="${data.originalimage.source}" alt="${title}" class="city-image">` : '';

            // Attempt to parse additional information from the Wikipedia description
            let additionalInfo = '';
            if (data.extract) {
                const extract = data.extract.toLowerCase();
                const populationMatch = extract.match(/population of ([\d,]+)/);
                const languageMatch = extract.match(/languages? spoken is? ([^.,]+)/);
                const demographicsMatch = extract.match(/demographics? of ([^.,]+)/);

                if (populationMatch) {
                    additionalInfo += `<p><strong>Population:</strong> ${populationMatch[1]}</p>`;
                }
                if (languageMatch) {
                    additionalInfo += `<p><strong>Main Language Spoken:</strong> ${languageMatch[1]}</p>`;
                }
                if (demographicsMatch) {
                    additionalInfo += `<p><strong>Demographics:</strong> ${demographicsMatch[1]}</p>`;
                }
            }

            additionalInfo = `<p>${summary}</p>`;
            additionalInfo += `<p><strong>Coordinates:</strong> ${coordinates}</p>`;
            additionalInfo += image;

            document.getElementById('city-info').innerHTML = `
                <h2>About ${title}</h2>
                <div class="scrollable-content">
                    ${additionalInfo}
                </div>
                <div class="button-container">
                    <button class="random-button" id="explore-button" onclick="loadRandomCity()">Explore a New City</button>
                </div>
            `;

            // Scroll to top of the description
            document.querySelector('.scrollable-content').scrollTop = 0;
        })
        .catch(error => console.error('Error fetching city data:', error));

    if (isFirstLoad) {
        document.getElementById('explore-button').textContent = 'Explore a New City';
        isFirstLoad = false;
    }
}

window.onload = initializeMap;
