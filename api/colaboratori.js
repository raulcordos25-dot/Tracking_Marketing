// Importăm uneltele pe care le-am instalat anterior
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Inițializăm serverul
const app = express();

// Setăm serverul să accepte cereri de la browserul tău și să poată citi date JSON
app.use(cors());
app.use(express.json());

// Configurăm conexiunea la baza de date MySQL
// ATENȚIE: Aici va trebui să modifici cu datele tale reale!
const db = mysql.createConnection({
   host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Necesită o conexiune securizată (obligatoriu pentru Aiven)
    } 
});

// Verificăm dacă ne-am conectat cu succes la MySQL
db.connect((eroare) => {
    if (eroare) {
        console.error('Eroare la conectarea cu MySQL:', eroare.message);
        return;
    }
    console.log('Te-ai conectat cu succes la baza de date MySQL!');
});

// Creăm ruta care primește datele de la frontend (corespunde cu fetch-ul din script.js)
app.post('/api/colaboratori', (req, res) => {
    // Extragem datele primite din frontend
    const dateFrontend = req.body;

    // Pregătim comanda SQL de inserare
    // Semnele de întrebare (?) sunt un sistem de securitate pentru a preveni atacurile de tip SQL Injection
    const sql = `INSERT INTO colaboratori 
                (nume, sdg_proiect, reminder_feedback, postari_publicate, feedback_colaboratori, contactat, dorinte, ideea_principala) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // Punem datele într-un array, exact în ordinea semnelor de întrebare de mai sus
    const valori = [
        dateFrontend.nume,
        dateFrontend.sdgProiect,
        dateFrontend.reminder || null, // Dacă nu s-a selectat o dată, trimitem valoarea NULL
        dateFrontend.postari,
        dateFrontend.feedback,
        dateFrontend.contactat,        // true sau false
        dateFrontend.dorinte,
        dateFrontend.ideea
    ];

    // Executăm comanda în baza de date
    db.query(sql, valori, (eroare, rezultat) => {
        if (eroare) {
            console.error('Eroare la inserarea datelor:', eroare);
        // Returnăm și mesajul tehnic detaliat (eroare.message) către browser
        return res.status(500).json({ 
            mesaj: "Eroare la salvarea în baza de date",
            detalii_tehnice: eroare.message 
        });
        }
        
        console.log('Un nou colaborator a fost adăugat cu succes!');
        // Trimitem confirmarea de succes către browser
        res.status(200).json({ mesaj: "Colaboratorul a fost salvat cu succes!" });
    });
});

// Pornim serverul să asculte pe portul 3000
// Dacă rulăm local, pornim serverul normal. Dacă rulăm pe Vercel, doar exportăm aplicația.
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server local pornit pe http://localhost:${PORT}`);
    });
}

// Exportăm aplicația pentru funcțiile Serverless de la Vercel
module.exports = app;