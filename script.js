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
        complete: function (results) {
            scoresData = results.data;
            initializeSearch();
            // Don't render results initially as per user request
            // renderResults(scoresData); 
        },
        error: function (error) {
            console.error('Error parsing CSV:', error);
            resultsContainer.innerHTML = '<div class="no-results">Error al cargar las partituras. Por favor, intente más tarde.</div>';
        }
    });

    function initializeSearch() {
        const options = {
            keys: ['Name of Piece', 'Author', 'ID'], // Added ID to search keys if they want to search by ID too, seems useful
            threshold: 0.3,
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
            resultsContainer.innerHTML = ''; // Clear results if search is empty
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

            const id = score['ID'] || '#';
            const name = score['Name of Piece'] || 'Nombre No Disponible';
            const author = score['Author'] || 'Autor No Disponible';
            const copies = score['Number of Copies'] ? `${score['Number of Copies']} copias` : 'Copias No Disponibles';
            const link = score['Google Drive Link'];
            const hasLink = link && link.trim() !== '' && link.toLowerCase() !== 'no disponible';

            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <h3 class="score-title" style="margin-bottom: 0;">${name}</h3>
                        <span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: #666;">#${id}</span>
                    </div>
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
