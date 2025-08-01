document.addEventListener('DOMContentLoaded', () => {
    let vocabulaire = {};

    const formAjout = document.getElementById('form-ajout');
    const motSourceInput = document.getElementById('mot-source');
    const langueSourceSelect = document.getElementById('langue-source');
    const motCibleInput = document.getElementById('mot-cible');
    const langueCibleSelect = document.getElementById('langue-cible');
    const listeUl = document.getElementById('liste-ul');
    const boutonReset = document.getElementById('bouton-reset');

    const typeExerciceSelect = document.getElementById('type-exercice');
    const selectLangueSource = document.getElementById('select-langue-source');
    const selectLangueCible = document.getElementById('select-langue-cible');
    const boutonDemarrer = document.getElementById('bouton-demarrer');
    const consigneExercice = document.getElementById('consigne-exercice');
    const messageFeedback = document.getElementById('message-feedback');
    const boutonSuivant = document.getElementById('bouton-suivant');

    // Éléments pour l'exercice de choix multiples
    const exerciceChoixMultiplesDiv = document.getElementById('exercice-choix-multiples');
    const choixReponseDiv = document.getElementById('choix-reponse');
    
    // Éléments pour l'exercice d'écriture
    const exerciceEcritureDiv = document.getElementById('exercice-ecriture');
    const inputReponse = document.getElementById('input-reponse');
    const boutonSoumettre = document.getElementById('bouton-soumettre');

    // Langues prédéfinies
    const languesPredifines = {
        'fr': 'Français',
        'en': 'Anglais',
        'es': 'Espagnol',
        'it': 'Italien',
        'de': 'Allemand'
    };

    function chargerVocabulaire() {
        const vocabulaireSauvegarder = localStorage.getItem('vocabulaireMultiLangue');
        if (vocabulaireSauvegarder) {
            vocabulaire = JSON.parse(vocabulaireSauvegarder);
            afficherMots();
            peuplerSelecteurs();
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

    function peuplerSelecteurs() {
        selectLangueSource.innerHTML = '<option value="">Langue source...</option>';
        selectLangueCible.innerHTML = '<option value="">Langue cible...</option>';
        
        const languesDisponibles = new Set();
        for (const paire in vocabulaire) {
            const [langue1, langue2] = paire.split('-');
            languesDisponibles.add(langue1);
            languesDisponibles.add(langue2);
        }

        languesDisponibles.forEach(langue => {
            if (languesPredifines[langue]) {
                const optionSource = document.createElement('option');
                optionSource.value = langue;
                optionSource.textContent = languesPredifines[langue];
                selectLangueSource.appendChild(optionSource);
                
                const optionCible = document.createElement('option');
                optionCible.value = langue;
                optionCible.textContent = languesPredifines[langue];
                selectLangueCible.appendChild(optionCible);
            }
        });
    }

    // Gestion de l'ajout des mots
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
            peuplerSelecteurs(); 
            
            motSourceInput.value = '';
            motCibleInput.value = '';
        }
    });

    // Gestion du bouton de réinitialisation
    boutonReset.addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser tout le vocabulaire ? Cette action est irréversible.")) {
            localStorage.removeItem('vocabulaireMultiLangue');
            vocabulaire = {};
            afficherMots();
            peuplerSelecteurs();
            // On réinitialise aussi les sélecteurs d'exercice
            selectLangueSource.value = '';
            selectLangueCible.value = '';
            consigneExercice.textContent = '';
            messageFeedback.textContent = '';
            choixReponseDiv.innerHTML = '';
            inputReponse.value = '';
            boutonSuivant.style.display = 'none';
        }
    });

    // Gérer le démarrage de l'exercice
    boutonDemarrer.addEventListener('click', () => {
        const langueSource = selectLangueSource.value;
        const langueCible = selectLangueCible.value;
        const typeExercice = typeExerciceSelect.value;

        if (langueSource && langueCible && langueSource !== langueCible) {
            commencerExercice(langueSource, langueCible, typeExercice);
        } else {
            alert('Veuillez choisir deux langues différentes pour l\'exercice.');
        }
    });

    // Gérer le type d'exercice à afficher
    typeExerciceSelect.addEventListener('change', () => {
        if (typeExerciceSelect.value === 'ecriture') {
            exerciceEcritureDiv.style.display = 'block';
            exerciceChoixMultiplesDiv.style.display = 'none';
        } else {
            exerciceEcritureDiv.style.display = 'none';
            exerciceChoixMultiplesDiv.style.display = 'block';
        }
    });

    // Commencer un nouvel exercice
    let motCourant;
    let motsExercice;
    let langueSourceExercice;
    let langueCibleExercice;
    let typeExerciceCourant;

    function commencerExercice(langueSource, langueCible, typeExercice) {
        langueSourceExercice = langueSource;
        langueCibleExercice = langueCible;
        typeExerciceCourant = typeExercice;

        const clePaire = [langueSource, langueCible].sort().join('-');
        motsExercice = vocabulaire[clePaire];
        
        if (!motsExercice || motsExercice.length < 4) {
            consigneExercice.textContent = "Ajoute au moins 4 mots pour cette paire de langues pour commencer l'exercice !";
            messageFeedback.textContent = '';
            choixReponseDiv.innerHTML = '';
            inputReponse.value = '';
            boutonSuivant.style.display = 'none';
            return;
        }

        messageFeedback.textContent = '';
        boutonSuivant.style.display = 'none';
        
        const indexAleatoire = Math.floor(Math.random() * motsExercice.length);
        motCourant = motsExercice[indexAleatoire];
        
        consigneExercice.textContent = `Quel est la traduction de "${motCourant[langueSource]}" ?`;
        
        if (typeExercice === 'choix-multiples') {
            preparerExerciceChoixMultiples();
        } else if (typeExercice === 'ecriture') {
            preparerExerciceEcriture();
        }
    }

    function preparerExerciceChoixMultiples() {
        inputReponse.value = '';
        const choixPossibles = [motCourant];
        let autresMots = motsExercice.filter(m => m !== motCourant);
        
        while (choixPossibles.length < 4 && autresMots.length > 0) {
            const indexAutre = Math.floor(Math.random() * autresMots.length);
            choixPossibles.push(autresMots[indexAutre]);
            autresMots.splice(indexAutre, 1);
        }
        
        choixPossibles.sort(() => Math.random() - 0.5);

        choixReponseDiv.innerHTML = '';
        choixPossibles.forEach(choix => {
            const bouton = document.createElement('button');
            bouton.textContent = choix[langueCibleExercice];
            bouton.addEventListener('click', () => verifierReponse(choix[langueCibleExercice], motCourant[langueCibleExercice]));
            choixReponseDiv.appendChild(bouton);
        });
    }

    function preparerExerciceEcriture() {
        choixReponseDiv.innerHTML = '';
        inputReponse.value = '';
    }

    function verifierReponse(reponseUtilisateur, bonneReponse) {
        let estCorrect;
        if (typeExerciceCourant === 'ecriture') {
            // Pour l'exercice d'écriture, on ignore la casse (majuscule/minuscule)
            estCorrect = reponseUtilisateur.toLowerCase() === bonneReponse.toLowerCase();
        } else {
            estCorrect = reponseUtilisateur === bonneReponse;
        }

        if (estCorrect) {
            messageFeedback.textContent = "Bonne réponse ! 🎉";
            messageFeedback.style.color = "green";
        } else {
            messageFeedback.textContent = `Mauvaise réponse. La bonne réponse était "${bonneReponse}".`;
            messageFeedback.style.color = "red";
        }
        boutonSuivant.style.display = 'block';
    }

    boutonSoumettre.addEventListener('click', () => {
        const reponseUtilisateur = inputReponse.value.trim();
        if (reponseUtilisateur) {
            verifierReponse(reponseUtilisateur, motCourant[langueCibleExercice]);
        }
    });

    boutonSuivant.addEventListener('click', () => {
        commencerExercice(langueSourceExercice, langueCibleExercice, typeExerciceCourant);
    });
    
    // Initialiser le site
    chargerVocabulaire();
});
