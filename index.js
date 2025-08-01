document.addEventListener('DOMContentLoaded', () => {
    let vocabulaire = {};

    const formAjout = document.getElementById('form-ajout');
    const motSourceInput = document.getElementById('mot-source');
    const langueSourceSelect = document.getElementById('langue-source');
    const motCibleInput = document.getElementById('mot-cible');
    const langueCibleSelect = document.getElementById('langue-cible');
    const listeUl = document.getElementById('liste-ul');
    const boutonReset = document.getElementById('bouton-reset');

    const languesPredifines = {
        'fr': 'Français', 'en': 'Anglais', 'es': 'Espagnol', 'it': 'Italien', 'de': 'Allemand'
    };

    function chargerVocabulaire() {
        const vocabulaireSauvegarder = localStorage.getItem('vocabulaireMultiLangue');
        if (vocabulaireSauvegarder) {
            vocabulaire = JSON.parse(vocabulaireSauvegarder);
            afficherMots();
        }
    }

    function sauvegarderVocabulaire() {
        localStorage.setItem('vocabulaireMultiLangue', JSON.stringify(vocabulaire));
    }

    function afficherMots() {
        listeUl.innerHTML = '';
        for (const paire in vocabulaire) {
            const [langue1, langue2] = paire.split('-');
            vocabulaire[paire].forEach((paireMots) => {
                const li = document.createElement('li');
                li.textContent = `${paireMots[langue1]} (${languesPredifines[langue1] || langue1}) - ${paireMots[langue2]} (${languesPredifines[langue2] || langue2})`;
                listeUl.appendChild(li);
            });
        }
    }

    formAjout.addEventListener('submit', (e) => {
        e.preventDefault();
        const motSource = motSourceInput.value.trim();
        const langueSource = langueSourceSelect.value.trim().toLowerCase();
        const motCible = motCibleInput.value.trim();
        const langueCible = langueCibleSelect.value.trim().toLowerCase();

        if (motSource && langueSource && motCible && langueCible) {
            const clePaire = [langueSource, langueCible].sort().join('-');
            
            if (!vocabulaire[clePaire]) {
                vocabulaire[clePaire] = [];
            }
            
            const nouvellePaire = {};
            nouvellePaire[langueSource] = motSource;
            nouvellePaire[langueCible] = motCible;
            
            vocabulaire[clePaire].push(nouvellePaire);
            
            sauvegarderVocabulaire();
            afficherMots();
            
            motSourceInput.value = '';
            motCibleInput.value = '';
        }
    });

    boutonReset.addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser tout le vocabulaire ? Cette action est irréversible.")) {
            localStorage.removeItem('vocabulaireMultiLangue');
            vocabulaire = {};
            afficherMots();
        }
    });
    
    chargerVocabulaire();
});
