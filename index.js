//const apiKey = 'b875828f-7d9c-4333-a163-5b82b54a86e5';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const typeSelect = document.getElementById('typeSelect');
    const subtypeSelect = document.getElementById('subtypeSelect');
    const raritySelect = document.getElementById('raritySelect');
    const resultsContainer = document.querySelector('.results');
    const apiKey = 'b875828f-7d9c-4333-a163-5b82b54a86e5';

    let allCards = [];

    // Fetch all cards from Pokémon TCG API
    async function fetchAllCards() {
        const response = await fetch(`https://api.pokemontcg.io/v2/cards`, {
            headers: {
                'X-Api-Key': apiKey
            }
        });
        const data = await response.json();
        return data.data;
    }

    // Fetch attribute data from Pokémon TCG API
    async function fetchAttributes(endpoint) {
        const response = await fetch(`https://api.pokemontcg.io/v2/${endpoint}`, {
            headers: {
                'X-Api-Key': apiKey
            }
        });
        const data = await response.json();
        return data.data;
    }

    // Populate filter dropdowns
    async function populateFilters() {
        const types = await fetchAttributes('types');

        if (types) {
            types
                .filter(type => type !== 'Fairy') // Exclude "Fairy" type
                .forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    typeSelect.appendChild(option);
                });
        }

        // Fetch cards to determine available subtypes and rarities
        allCards = await fetchAllCards();
        displayResults();
    }

    // Display results based on search and filters
    function displayResults() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = typeSelect.value;
        const selectedSubtype = subtypeSelect.value;
        const selectedRarity = raritySelect.value;

        resultsContainer.innerHTML = '';

        const filteredCards = allCards.filter(card => {
            const nameMatch = card.name.toLowerCase().includes(searchTerm);
            const typeMatch = selectedType ? card.types.includes(selectedType) : true;
            const subtypeMatch = selectedSubtype ? card.subtypes.includes(selectedSubtype) : true;
            const rarityMatch = selectedRarity ? card.rarity === selectedRarity : true;
            return nameMatch && typeMatch && subtypeMatch && rarityMatch;
        });

        if (filteredCards.length > 0) {
            filteredCards.forEach(card => {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('card');
                resultDiv.innerHTML = `
                    <img src="${card.images.small}" alt="${card.name}">
                    <p>${card.name}</p>
                `;
                resultsContainer.appendChild(resultDiv);
            });
        } else {
            resultsContainer.innerHTML = '<p>No cards found.</p>';
        }

        // Populate subtypes and rarities based on filtered cards
        populateSubtypesAndRarities(filteredCards);
    }

    // Populate subtypes and rarities based on filtered cards
    function populateSubtypesAndRarities(cards) {
        const currentSubtype = subtypeSelect.value; // Save current selection
        const currentRarity = raritySelect.value; // Save current selection

        const subtypes = [...new Set(cards.flatMap(card => card.subtypes || []))];
        const rarities = [...new Set(cards.map(card => card.rarity).filter(Boolean))]; // Exclude empty rarities

        subtypeSelect.innerHTML = '<option value="">All</option>';
        raritySelect.innerHTML = '<option value="">All</option>';

        subtypes.forEach(subtype => {
            const option = document.createElement('option');
            option.value = subtype;
            option.textContent = subtype;
            subtypeSelect.appendChild(option);
        });

        rarities.forEach(rarity => {
            const option = document.createElement('option');
            option.value = rarity;
            option.textContent = rarity;
            raritySelect.appendChild(option);
        });

        // Restore previous selections
        subtypeSelect.value = currentSubtype;
        raritySelect.value = currentRarity;
    }

    // Event listeners for search and filters
    searchInput.addEventListener('input', displayResults);

    typeSelect.addEventListener('change', () => {
        displayResults();
        if (typeSelect.value === '') {
            displayResults(); // Display results without resetting filters
        }
    });

    subtypeSelect.addEventListener('change', () => {
        displayResults();
        if (subtypeSelect.value === '') {
            displayResults(); // Display results without resetting filters
        }
    });

    raritySelect.addEventListener('change', () => {
        displayResults();
        if (raritySelect.value === '') {
            displayResults(); // Display results without resetting filters
        }
    });

    // Initial setup
    async function init() {
        await populateFilters();
        displayResults();
    }

    init();
});
