document.addEventListener('DOMContentLoaded', () => {
    let vocabulaire = {};

    const typeExerciceSelect = document.getElementById('type-exercice');
    const selectLangueSource = document.getElementById('select-langue-source');
    const selectLangueCible = document.getElementById('select-langue-cible');
    const boutonDemarrer = document.getElementById('bouton-demarrer');
    const zoneConfiguration = document.getElementById('zone-configuration');
    const zoneExercice = document.getElementById('zone-exercice');
    const consigneExercice = document.getElementById('consigne-exercice');
    const exerciceContenuDiv = document.getElementById('exercice-contenu');
    const messageFeedback = document.getElementById('message-feedback');
    const boutonSuivant = document.getElementById('bouton-suivant');

    const languesPredifines = {
        'fr': 'Français', 'en': 'Anglais', 'es': 'Espagnol', 'it': 'Italien', 'de': 'Allemand'
    };

    function chargerVocabulaire() {
        const vocabulaireSauvegarder = localStorage.getItem('vocabulaireMultiLangue');
        if (vocabulaireSauvegarder) {
            vocabulaire = JSON.parse(vocabulaireSauvegarder);
            peuplerSelecteurs();
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

    let motCourant;
    let motsExercice;
    let langueSourceExercice;
    let langueCibleExercice;
    let typeExerciceCourant;
    let motsMelanges;
    let reponseOrdre = [];

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

    function commencerExercice(langueSource, langueCible, typeExercice) {
        langueSourceExercice = langueSource;
        langueCibleExercice = langueCible;
        typeExerciceCourant = typeExercice;

        const clePaire = [langueSource, langueCible].sort().join('-');
        motsExercice = vocabulaire[clePaire];
        
        if (!motsExercice || motsExercice.length < 4) {
            alert("Ajoute au moins 4 mots pour cette paire de langues pour commencer l'exercice !");
            return;
        }

        zoneConfiguration.style.display = 'none';
        zoneExercice.style.display = 'block';
        messageFeedback.textContent = '';
        boutonSuivant.style.display = 'none';
        
        const indexAleatoire = Math.floor(Math.random() * motsExercice.length);
        motCourant = motsExercice[indexAleatoire];
        
        consigneExercice.textContent = `Quel est la traduction de "${motCourant[langueSource]}" ?`;
        
        if (typeExercice === 'choix-multiples') {
            preparerExerciceChoixMultiples();
        } else if (typeExercice === 'ecriture') {
            preparerExerciceEcriture();
        } else if (typeExercice === 'ordre') {
            preparerExerciceOrdre();
        }
    }

    function preparerExerciceChoixMultiples() {
        exerciceContenuDiv.innerHTML = `<div id="choix-reponse"></div>`;
        const choixReponseDiv = document.getElementById('choix-reponse');
        
        const choixPossibles = [motCourant];
        let autresMots = motsExercice.filter(m => m !== motCourant);
        
        while (choixPossibles.length < 4 && autresMots.length > 0) {
            const indexAutre = Math.floor(Math.random() * autresMots.length);
            choixPossibles.push(autresMots[indexAutre]);
            autresMots.splice(indexAutre, 1);
        }
        
        choixPossibles.sort(() => Math.random() - 0.5);

        choixPossibles.forEach(choix => {
            const bouton = document.createElement('button');
            bouton.textContent = choix[langueCibleExercice];
            bouton.addEventListener('click', () => verifierReponse(bouton.textContent, motCourant[langueCibleExercice]));
            choixReponseDiv.appendChild(bouton);
        });
    }

    function preparerExerciceEcriture() {
        exerciceContenuDiv.innerHTML = `
            <div id="exercice-ecriture">
                <input type="text" id="input-reponse" placeholder="Écris la traduction ici">
                <button id="bouton-soumettre">Soumettre</button>
            </div>
        `;
        document.getElementById('bouton-soumettre').addEventListener('click', () => {
            const reponseUtilisateur = document.getElementById('input-reponse').value.trim();
            if (reponseUtilisateur) {
                verifierReponse(reponseUtilisateur, motCourant[langueCibleExercice]);
            }
        });
    }

    function preparerExerciceOrdre() {
        exerciceContenuDiv.innerHTML = `
            <div id="exercice-ordre"></div>
            <div id="reponse-ordre"></div>
            <button id="bouton-verif-ordre">Vérifier</button>
        `;
        const exerciceOrdreDiv = document.getElementById('exercice-ordre');
        const reponseOrdreDiv = document.getElementById('reponse-ordre');
        
        const bonneReponse = motCourant[langueCibleExercice];
        motsMelanges = bonneReponse.split(' ').sort(() => Math.random() - 0.5);
        reponseOrdre = [];
        
        motsMelanges.forEach(mot => {
            const bouton = document.createElement('button');
            bouton.textContent = mot;
            bouton.classList.add('mot-ordre');
            bouton.addEventListener('click', () => {
                reponseOrdre.push(mot);
                reponseOrdreDiv.textContent = reponseOrdre.join(' ');
                bouton.disabled = true;
            });
            exerciceOrdreDiv.appendChild(bouton);
        });
        
        document.getElementById('bouton-verif-ordre').addEventListener('click', () => {
            verifierReponse(reponseOrdre.join(' '), bonneReponse);
        });
    }

    function verifierReponse(reponseUtilisateur, bonneReponse) {
        let estCorrect;
        if (typeExerciceCourant === 'ecriture' || typeExerciceCourant === 'ordre') {
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

    boutonSuivant.addEventListener('click', () => {
        commencerExercice(langueSourceExercice, langueCibleExercice, typeExerciceCourant);
    });
    
    chargerVocabulaire();
});
