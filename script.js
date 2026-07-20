const formular = document.getElementById('formularColaboratori');
const butonSalvare = formular.querySelector('button[type="submit"]');
const idAscuns = document.getElementById('colaboratorId'); // Câmpul tău hidden din HTML

// Salvăm datele temporar în memorie pentru a le putea introduce ușor în formular când dăm "Editează"
let listaGlobalaColaboratori = []; 

// --- 1. LOGICA PENTRU TRIMITEREA FORMULARULUI (POST sau PUT) ---
formular.onsubmit = async function(eveniment) {
    eveniment.preventDefault();
    butonSalvare.disabled = true;
    butonSalvare.innerText = "Se procesează...";

    const dateColaborator = {
        id: idAscuns.value, // Transmitem ID-ul către server pentru a ști ce rând să editeze
        nume: document.getElementById('nume').value,
        sdgProiect: document.getElementById('sdgProiect').value,
        reminder: document.getElementById('reminder').value,
        postari: document.getElementById('postari').value,
        feedback: document.getElementById('feedback').value,
        contactat: document.getElementById('contactat').checked,
        dorinte: document.getElementById('dorinte').value,
        ideea: document.getElementById('ideea').value
    };

    const metoda = idAscuns.value ? 'PUT' : 'POST';
    const url = '/api/colaboratori'; 


    try {
        const raspuns = await fetch(url, {
            method: metoda,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dateColaborator)
        });

        if (raspuns.ok) {
            alert(idAscuns.value ? 'Actualizat cu succes!' : 'Salvat cu succes!');
            
            // Resetăm formularul la starea inițială (modul Creare)
            formular.reset();
            idAscuns.value = '';
            butonSalvare.classList.replace('btn-warning', 'btn-primary');
            
            await incarcaColaboratori();
        } else {
            alert('Eroare la comunicarea cu baza de date.');
        }
    } catch (eroare) {
        console.error('Eroare:', eroare);
    } finally {
        butonSalvare.disabled = false;
        butonSalvare.innerText = "Salvează Colaboratorul";
    }
};

// --- 2. LOGICA PENTRU CITIRE (GET) ȘI CONSTRUIRE TABEL ---
async function incarcaColaboratori() {
    try {
        const raspuns = await fetch('/api/colaboratori');
        listaGlobalaColaboratori = await raspuns.json(); // Salvăm lista global
        const tabel = document.getElementById('tabelDate');
        tabel.innerHTML = '';

        listaGlobalaColaboratori.forEach(colab => {
            const rand = document.createElement('tr');
            const textContactat = colab.contactat ? 'Da' : 'Nu';
            const clasaContactat = colab.contactat ? 'bg-success' : 'bg-secondary';
            
            let dataReminderFormatata = '-';
            let clasaCuloareData = ''; 

            if (colab.reminder_feedback) {
                const dataObj = new Date(colab.reminder_feedback);
                dataReminderFormatata = dataObj.toLocaleDateString('ro-RO');
                
                const azi = new Date();
                const dataAziFormatata = azi.toLocaleDateString('ro-RO');
                azi.setHours(0, 0, 0, 0);
                
                const dataComparare = new Date(dataObj);
                dataComparare.setHours(0, 0, 0, 0);

                if (dataReminderFormatata === dataAziFormatata) {
                    clasaCuloareData = 'bg-warning text-dark fw-bold';
                } else if (dataComparare < azi) {
                    clasaCuloareData = 'bg-danger text-white fw-bold'; 
                }
            }

            // Am adăugat coloana cu cele două butoane noi (Editează și Șterge) care apelează funcțiile de mai jos
            rand.innerHTML = `
               <td>${colab.nume}</td>
                <td><span class="badge ${clasaContactat}">${textContactat}</span></td>
                <td>${colab.sdg_proiect}</td>
                <td>${colab.dorinte || '-'}</td>
                <td>${colab.postari_publicate || '-'}</td>
                <td>${colab.feedback_colaboratori || '-'}</td>
                <td class="${clasaCuloareData}">${dataReminderFormatata}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editeazaColaborator(${colab.id})">Editează</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="stergeColaborator(${colab.id})">Șterge</button>
                </td>
            `;
            tabel.appendChild(rand);
        });
    } catch (eroare) {
        console.error('Eroare:', eroare);
    }
}

// --- 3. LOGICA PENTRU EDITARE ---
// Această funcție este chemată direct din butonul "Editează" din tabel
window.editeazaColaborator = function(id) {
    // Căutăm colaboratorul în lista descărcată anterior
    const colab = listaGlobalaColaboratori.find(c => c.id === id);
    if (!colab) return;

    // Introducem datele înapoi în formular
    idAscuns.value = colab.id; // Secretul care îi spune serverului că edităm, nu creăm
    document.getElementById('nume').value = colab.nume;
    document.getElementById('sdgProiect').value = colab.sdg_proiect;
    document.getElementById('postari').value = colab.postari_publicate || '';
    document.getElementById('feedback').value = colab.feedback_colaboratori || '';
    document.getElementById('contactat').checked = !!colab.contactat;
    document.getElementById('dorinte').value = colab.dorinte || '';
    document.getElementById('ideea').value = colab.ideea_principala || '';

    // Inputul de tip "date" acceptă strict formatul YYYY-MM-DD
    if (colab.reminder_feedback) {
        const d = new Date(colab.reminder_feedback);
        document.getElementById('reminder').value = d.toISOString().split('T')[0];
    } else {
        document.getElementById('reminder').value = '';
    }

    // Semnalizăm vizual că am intrat în modul Editare
    butonSalvare.innerText = "Actualizează Colaboratorul";
    butonSalvare.classList.replace('btn-primary', 'btn-warning');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Ducem vizitatorul înapoi sus la formular
};

// --- 4. LOGICA PENTRU ȘTERGERE ---
window.stergeColaborator = async function(id) {
    // Măsură de siguranță pentru a preveni ștergerile accidentale
    if (!confirm('Ești sigur că vrei să ștergi definitiv acest colaborator?')) return;

    try {
        const raspuns = await fetch(`/api/colaboratori/${id}`, { method: 'DELETE' });
        if (raspuns.ok) {
            await incarcaColaboratori(); // Reîmprospătăm tabelul
        } else {
            alert('Nu am putut șterge colaboratorul.');
        }
    } catch (eroare) {
        console.error('Eroare la ștergere:', eroare);
    }
};

incarcaColaboratori();