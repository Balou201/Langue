document.addEventListener('DOMContentLoaded', () => {
    // Liste pour stocker les paires de mots
    let vocabulaire = [];

    const formAjout = document.getElementById('form-ajout');
    const motFrInput = document.getElementById('mot-fr');
    const motEnInput = document.getElementById('mot-en');
    const listeUl = document.getElementById('liste-ul');
    const consigneExercice = document.getElementById('consigne-exercice');
    const choixReponseDiv = document.getElementById('choix-reponse');
    const messageFeedback = document.getElementById('message-feedback');
    const boutonSuivant = document.getElementById('bouton-suivant');

    // Charger le vocabulaire depuis le stockage local du navigateur
    function chargerVocabulaire() {
        const vocabulaireSauvegarder = localStorage.getItem('vocabulaire');
        if (vocabulaireSauvegarder) {
            vocabulaire = JSON.parse(vocabulaireSauvegarder);
            afficherMots();
        }
    }

    // Sauvegarder le vocabulaire dans le stockage local
    function sauvegarderVocabulaire() {
        localStorage.setItem('vocabulaire', JSON.stringify(vocabulaire));
    }

    // Afficher les mots dans la liste
    function afficherMots() {
        listeUl.innerHTML = '';
        vocabulaire.forEach((paire) => {
            const li = document.createElement('li');
            li.textContent = `${paire.fr} - ${paire.en}`;
            listeUl.appendChild(li);
        });
        if (vocabulaire.length > 0) {
            commencerExercice();
        }
    }

    // Gérer l'ajout de nouveaux mots
    formAjout.addEventListener('submit', (e) => {
        e.preventDefault();
        const motFr = motFrInput.value.trim();
        const motEn = motEnInput.value.trim();
        if (motFr && motEn) {
            vocabulaire.push({ fr: motFr, en: motEn });
            sauvegarderVocabulaire();
            afficherMots();
            motFrInput.value = '';
            motEnInput.value = '';
        }
    });

    // Commencer un nouvel exercice
    let motCourant;

    function commencerExercice() {
        if (vocabulaire.length < 4) {
            consigneExercice.textContent = "Ajoute au moins 4 mots pour commencer les exercices !";
            choixReponseDiv.innerHTML = '';
            messageFeedback.textContent = '';
            boutonSuivant.style.display = 'none';
            return;
        }

        messageFeedback.textContent = '';
        boutonSuivant.style.display = 'none';
        
        const indexAleatoire = Math.floor(Math.random() * vocabulaire.length);
        motCourant = vocabulaire[indexAleatoire];
        
        consigneExercice.textContent = `Quel est la traduction de "${motCourant.fr}" ?`;

        const choixPossibles = [motCourant];
        let autresMots = vocabulaire.filter(m => m !== motCourant);
        
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
            bouton.textContent = choix.en;
            bouton.addEventListener('click', () => verifierReponse(choix.en));
            choixReponseDiv.appendChild(bouton);
        });
    }

    // Vérifier la réponse de l'utilisateur
    function verifierReponse(reponse) {
        if (reponse === motCourant.en) {
            messageFeedback.textContent = "Bonne réponse ! 🎉";
            messageFeedback.style.color = "green";
        } else {
            messageFeedback.textContent = `Mauvaise réponse. La bonne réponse était "${motCourant.en}".`;
            messageFeedback.style.color = "red";
        }
        boutonSuivant.style.display = 'block';
    }

    boutonSuivant.addEventListener('click', commencerExercice);
    
    // Initialiser le site
    chargerVocabulaire();
});
