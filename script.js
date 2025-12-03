document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'Archivo Partituras.csv';
    let scoresData = [];
    let fuse;

    const searchInput = document.getElementById('searchInput');
    const showAllBtn = document.getElementById('showAllBtn');
    const resultsContainer = document.getElementById('resultsContainer');

    // Fetch and Parse CSV
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            scoresData = results.data;
            initializeSearch();
            renderResults(scoresData); // Show all initially or maybe just a few? Let's show all for now as per "Show Full List" implication
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
            resultsContainer.innerHTML = '<div class="no-results">Error al cargar las partituras. Por favor, intente más tarde.</div>';
        }
    });

    function initializeSearch() {
        const options = {
            keys: ['Name of Piece', 'Author'],
            threshold: 0.3, // Fuzzy search threshold (0.0 = perfect match, 1.0 = match anything)
            ignoreLocation: true
        };
        fuse = new Fuse(scoresData, options);
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            const results = fuse.search(query);
            const formattedResults = results.map(result => result.item);
            renderResults(formattedResults);
        } else {
            renderResults(scoresData);
        }
    });

    showAllBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderResults(scoresData);
    });

    function renderResults(data) {
        resultsContainer.innerHTML = '';

        if (data.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No se encontraron resultados.</div>';
            return;
        }

        data.forEach(score => {
            const card = document.createElement('div');
            card.className = 'score-card';

            const name = score['Name of Piece'] || 'Nombre No Disponible';
            const author = score['Author'] || 'Autor No Disponible';
            const copies = score['Number of Copies'] ? `${score['Number of Copies']} copias` : 'Copias No Disponibles';
            const link = score['Google Drive Link'];
            const hasLink = link && link.trim() !== '' && link.toLowerCase() !== 'no disponible';

            card.innerHTML = `
                <div>
                    <h3 class="score-title">${name}</h3>
                    <p class="score-author">${author}</p>
                    <p class="score-meta">${copies}</p>
                </div>
                <a href="${hasLink ? link : '#'}" 
                   class="score-link ${!hasLink ? 'disabled' : ''}" 
                   target="_blank" 
                   rel="noopener noreferrer">
                   ${hasLink ? 'Ver Partitura' : 'No Disponible'}
                </a>
            `;

            resultsContainer.appendChild(card);
        });
    }
});
