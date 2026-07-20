// Localizăm formularul din HTML folosind ID-ul său unic
const formular = document.getElementById('formularColaboratori');

// Ascultăm momentul în care utilizatorul dă click pe butonul de Salvare
formular.addEventListener('submit', function(eveniment) {
    // Prevenim comportamentul standard al paginii (reîncărcarea automată)
    eveniment.preventDefault();

    // Extragem valorile introduse de tine în fiecare câmp
    const dateTrimise = {
        nume: document.getElementById('nume').value,
        dorinte: document.getElementById('dorinte').value,
        // Proprietatea 'checked' ne returnează adevărat (true) sau fals (false) pentru bife
        contactat: document.getElementById('contactat').checked, 
        postari: document.getElementById('postari').value,
        sdgProiect: document.getElementById('sdgProiect').value,
        feedback: document.getElementById('feedback').value,
        reminder: document.getElementById('reminder').value,
        ideea: document.getElementById('ideea').value
    };

    // Pentru a verifica dacă totul funcționează, afișăm datele în consolă ca text organizat (JSON)
   // Localizăm formularul din HTML
const formular = document.getElementById('formularColaboratori');

formular.addEventListener('submit', async function(eveniment) {
    // Oprim reîncărcarea automată a paginii
    eveniment.preventDefault();

    // 1. Colectăm datele exact din id-urile din HTML-ul tău
    const dateColaborator = {
        nume: document.getElementById('nume').value,
        sdgProiect: document.getElementById('sdgProiect').value,
        reminder: document.getElementById('reminder').value,
        postari: document.getElementById('postari').value,
        feedback: document.getElementById('feedback').value,
        contactat: document.getElementById('contactat').checked, // returnează true/false
        dorinte: document.getElementById('dorinte').value,
        ideea: document.getElementById('ideea').value
    };

    try {
        // 2. Trimitem datele către server folosind funcția 'fetch'
        // 'http://localhost:3000/api/colaboratori' este adresa viitorului nostru server Node.js
       const raspuns = await fetch('/', {
            method: 'POST', // POST înseamnă că vrem să trimitem/creăm date noi
            headers: {
                'Content-Type': 'application/json' // Îi spunem serverului că îi trimitem date formatate ca JSON
            },
            body: JSON.stringify(dateColaborator) // Transformăm obiectul nostru într-un text simplu pentru a fi trimis
        });

        // 3. Verificăm dacă serverul ne-a dat undă verde
        if (raspuns.ok) {
            alert('Colaboratorul a fost salvat cu succes în baza de date!');
            formular.reset(); // Curățăm formularul pentru o nouă introducere
        } else {
            alert('A apărut o problemă la salvarea datelor.');
        }

    } catch (eroare) {
        // Dacă serverul este oprit sau nu poate fi găsit, va intra aici
        console.error('Eroare de conexiune cu serverul:', eroare);
        alert('Nu m-am putut conecta la server. Asigură-te că este pornit!');
    }
});
});