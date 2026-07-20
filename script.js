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
            await incarcaColaboratori(); // Reîncarcă tabelul instant
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
// Funcție separată care aduce datele și le afișează în tabel
async function incarcaColaboratori() {
    try {
        // Cerem datele de la server
        const raspuns = await fetch('/api/colaboratori');
        const colaboratori = await raspuns.json();

        // Găsim corpul tabelului în HTML
        const tabel = document.getElementById('tabelDate');
        
        // Curățăm tabelul (ștergem datele vechi sau rândurile statice demonstrative)
        tabel.innerHTML = '';

        // Luăm fiecare colaborator și îi creăm un rând HTML
        colaboratori.forEach(colab => {
            const rand = document.createElement('tr');
            
            // Formatăm vizual bifa de Contactat (Da sau Nu)
            const textContactat = colab.contactat ? 'Da' : 'Nu';
            const clasaContactat = colab.contactat ? 'bg-success' : 'bg-secondary';
            
            // Dacă avem o dată pentru reminder, o facem să arate frumos
            // Dacă avem o dată pentru reminder, o formatăm și verificăm statusul ei
let dataReminderFormatata = '-';
let clasaCuloareData = ''; // Variabilă pentru culoarea de fundal a celulei

if (colab.reminder_feedback) {
    const dataObj = new Date(colab.reminder_feedback);
    dataReminderFormatata = dataObj.toLocaleDateString('ro-RO');

    // Preluăm data de azi
    const azi = new Date();
    
    // Resetăm orele la 00:00:00 pentru o comparație corectă strict pe zile
    azi.setHours(0, 0, 0, 0);
    const dataComparare = new Date(dataObj);
    dataComparare.setHours(0, 0, 0, 0);

    // Aplicăm regulile de culoare
    if (dataComparare.getTime() === azi.getTime()) {
        clasaCuloareData = 'table-warning text-dark fw-bold'; // Azi -> Galben
    } else if (dataComparare.getTime() < azi.getTime()) {
        clasaCuloareData = 'table-danger text-dark fw-bold'; // Trecut -> Roșu
    }
}
 rand.innerHTML = `
                <td>${colab.nume}</td>
                <td><span class="badge ${clasaContactat}">${textContactat}</span></td>
                <td>${colab.sdg_proiect}</td>
                <td>${colab.dorinte || '-'}</td>
                <td>${colab.postari_publicate || '-'}</td>
                <td>${colab.feedback_colaboratori || '-'}</td>
                <td>${dataReminderFormatata}</td>
            `;
            tabel.appendChild(rand);
        });
    } catch (eroare) {
        console.error('Eroare la aducerea colaboratorilor:', eroare);
    }
}

// Apelăm funcția automat când vizitatorul intră pe pagină
incarcaColaboratori();