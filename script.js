document.addEventListener('DOMContentLoaded', () => {
    // Le vocabulaire sera maintenant stocké par paires de langues
    let vocabulaire = {};

    const formAjout = document.getElementById('form-ajout');
    const motSourceInput = document.getElementById('mot-source');
    const langueSourceInput = document.getElementById('langue-source');
    const motCibleInput = document.getElementById('mot-cible');
    const langueCibleInput = document.getElementById('langue-cible');
    const listeUl = document.getElementById('liste-ul');
    const selectLangueSource = document.getElementById('select-langue-source');
    const selectLangueCible = document.getElementById('select-langue-cible');
    const boutonDemarrer = document.getElementById('bouton-demarrer');
    const consigneExercice = document.getElementById('consigne-exercice');
    const choixReponseDiv = document.getElementById('choix-reponse');
    const messageFeedback = document.getElementById('message-feedback');
    const boutonSuivant = document.getElementById('bouton-suivant');

    // Charger le vocabulaire depuis le stockage local
    function chargerVocabulaire() {
        const vocabulaireSauvegarder = localStorage.getItem('vocabulaireMultiLangue');
        if (vocabulaireSauvegarder) {
            vocabulaire = JSON.parse(vocabulaireSauvegarder);
            afficherMots();
            peuplerSelecteurs();
        }
    }

    // Sauvegarder le vocabulaire dans le stockage local
    function sauvegarderVocabulaire() {
        localStorage.setItem('vocabulaireMultiLangue', JSON.stringify(vocabulaire));
    }

    // Afficher les mots dans la liste
    function afficherMots() {
        listeUl.innerHTML = '';
        for (const paire in vocabulaire) {
            const [langue1, langue2] = paire.split('-');
            vocabulaire[paire].forEach((paireMots) => {
                const li = document.createElement('li');
                li.textContent = `${paireMots[langue1]} (${langue1}) - ${paireMots[langue2]} (${langue2})`;
                listeUl.appendChild(li);
            });
        }
    }

    // Peupler les menus déroulants avec les langues disponibles
    function peuplerSelecteurs() {
        selectLangueSource.innerHTML = '<option value="">-- Choisir --</option>';
        selectLangueCible.innerHTML = '<option value="">-- Choisir --</option>';
        
        const languesDisponibles = new Set();
        for (const paire in vocabulaire) {
            const [langue1, langue2] = paire.split('-');
            languesDisponibles.add(langue1);
            languesDisponibles.add(langue2);
        }

        languesDisponibles.forEach(langue => {
            const optionSource = document.createElement('option');
            optionSource.value = langue;
            optionSource.textContent = langue;
            selectLangueSource.appendChild(optionSource);
            
            const optionCible = document.createElement('option');
            optionCible.value = langue;
            optionCible.textContent = langue;
            selectLangueCible.appendChild(optionCible);
        });
    }

    // Gérer l'ajout de nouveaux mots
    formAjout.addEventListener('submit', (e) => {
        e.preventDefault();
        const motSource = motSourceInput.value.trim();
        const langueSource = langueSourceInput.value.trim().toLowerCase();
        const motCible = motCibleInput.value.trim();
        const langueCible = langueCibleInput.value.trim().toLowerCase();

        if (motSource && langueSource && motCible && langueCible) {
            // Créer une clé unique pour la paire de langues, ex: "fr-en" ou "en-fr"
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
            peuplerSelecteurs(); // Mettre à jour les selecteurs
            
            motSourceInput.value = '';
            langueSourceInput.value = '';
            motCibleInput.value = '';
            langueCibleInput.value = '';
        }
    });

    // Gérer le démarrage de l'exercice
    boutonDemarrer.addEventListener('click', () => {
        const langueSource = selectLangueSource.value;
        const langueCible = selectLangueCible.value;

        if (langueSource && langueCible && langueSource !== langueCible) {
            commencerExercice(langueSource, langueCible);
        } else {
            alert('Veuillez choisir deux langues différentes pour l\'exercice.');
        }
    });

    // Commencer un nouvel exercice
    let motCourant;
    let motsExercice;
    let langueSourceExercice;
    let langueCibleExercice;

    function commencerExercice(langueSource, langueCible) {
        langueSourceExercice = langueSource;
        langueCibleExercice = langueCible;

        const clePaire = [langueSource, langueCible].sort().join('-');
        motsExercice = vocabulaire[clePaire];
        
        if (!motsExercice || motsExercice.length < 4) {
            consigneExercice.textContent = "Ajoute au moins 4 mots pour cette paire de langues pour commencer l'exercice !";
            choixReponseDiv.innerHTML = '';
            messageFeedback.textContent = '';
            boutonSuivant.style.display = 'none';
            return;
        }

        messageFeedback.textContent = '';
        boutonSuivant.style.display = 'none';
        
        const indexAleatoire = Math.floor(Math.random() * motsExercice.length);
        motCourant = motsExercice[indexAleatoire];
        
        consigneExercice.textContent = `Quel est la traduction de "${motCourant[langueSource]}" ?`;

        const choixPossibles = [motCourant];
        let autresMots = motsExercice.filter(m => m !== motCourant);
        
        // Sélectionner 3 autres mots aléatoires
        while (choixPossibles.length < 4 && autresMots.length > 0) {
            const indexAutre = Math.floor(Math.random() * autresMots.length);
            choixPossibles.push(autresMots[indexAutre]);
            autresMots.splice(indexAutre, 1);
        }
        
        // Mélanger les choix
        choixPossibles.sort(() => Math.random() - 0.5);

        choixReponseDiv.innerHTML = '';
        choixPossibles.forEach(choix => {
            const bouton = document.createElement('button');
            bouton.textContent = choix[langueCible];
            bouton.addEventListener('click', () => verifierReponse(choix[langueCible]));
            choixReponseDiv.appendChild(bouton);
        });
    }

    // Vérifier la réponse de l'utilisateur
    function verifierReponse(reponse) {
        if (reponse === motCourant[langueCibleExercice]) {
            messageFeedback.textContent = "Bonne réponse ! 🎉";
            messageFeedback.style.color = "green";
        } else {
            messageFeedback.textContent = `Mauvaise réponse. La bonne réponse était "${motCourant[langueCibleExercice]}".`;
            messageFeedback.style.color = "red";
        }
        boutonSuivant.style.display = 'block';
    }

    boutonSuivant.addEventListener('click', () => {
        commencerExercice(langueSourceExercice, langueCibleExercice);
    });
    
    // Initialiser le site
    chargerVocabulaire();
});
