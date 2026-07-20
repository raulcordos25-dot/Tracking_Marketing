// 1. Localizăm formularul și butonul din HTML
const formular = document.getElementById('formularColaboratori');
const butonSalvare = formular.querySelector('button[type="submit"]');

// 2. Folosim "onsubmit" în loc de "addEventListener" pentru a garanta o execuție unică
formular.onsubmit = async function(eveniment) {
    // Oprim reîncărcarea paginii
    eveniment.preventDefault();

    // 3. DEZACTIVĂM butonul pe durata procesării pentru a preveni spam-ul/dublu-click-ul
    butonSalvare.disabled = true;
    butonSalvare.innerText = "Se salvează..."; // Oferim feedback vizual utilizatorului

    // Colectăm datele
    const dateColaborator = {
        nume: document.getElementById('nume').value,
        sdgProiect: document.getElementById('sdgProiect').value,
        reminder: document.getElementById('reminder').value,
        postari: document.getElementById('postari').value,
        feedback: document.getElementById('feedback').value,
        contactat: document.getElementById('contactat').checked,
        dorinte: document.getElementById('dorinte').value,
        ideea: document.getElementById('ideea').value
    };

    try {
        // Trimitem datele către serverul nostru de pe Vercel
        const raspuns = await fetch('/api/colaboratori', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dateColaborator)
        });

        if (raspuns.ok) {
            alert('Colaboratorul a fost salvat cu succes în baza de date!');
            formular.reset(); // Curățăm formularul pentru o nouă introducere
        } else {
            alert('A apărut o problemă la salvarea datelor.');
        }

    } catch (eroare) {
        console.error('Eroare de conexiune cu serverul:', eroare);
        alert('Nu m-am putut conecta la server.');
    } finally {
        // 4. Blocul "finally" se execută MEREU la final, indiferent dacă a fost succes sau eroare.
        // Reactivăm butonul ca să poți adăuga un alt colaborator.
        butonSalvare.disabled = false;
        butonSalvare.innerText = "Salvează Colaboratorul";
    }
};