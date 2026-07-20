const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Creăm bazinul de conexiuni rezistent pentru Vercel
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ruta pentru primirea datelor
app.post('/api/colaboratori', (req, res) => {
    const dateFrontend = req.body;

    const sql = `INSERT INTO colaboratori 
                (nume, sdg_proiect, reminder_feedback, postari_publicate, feedback_colaboratori, contactat, dorinte, ideea_principala) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const valori = [
        dateFrontend.nume,
        dateFrontend.sdgProiect,
        dateFrontend.reminder || null,
        dateFrontend.postari,
        dateFrontend.feedback,
        dateFrontend.contactat,
        dateFrontend.dorinte,
        dateFrontend.ideea
    ];

    // Folosim pool-ul direct pentru a executa comanda
    db.query(sql, valori, (eroare, rezultat) => {
        if (eroare) {
            console.error('Eroare baza de date:', eroare);
            return res.status(500).json({ 
                mesaj: "Eroare la salvare", 
                detalii_tehnice: eroare.message 
            });
        }
        
        console.log('Salvat cu succes!');
        res.status(200).json({ mesaj: "Colaboratorul a fost salvat cu succes!" });
    });
});

// Pornim serverul local DOAR dacă nu suntem pe Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server local pornit pe http://localhost:${PORT}`);
    });
}
// Ruta pentru extragerea datelor (citire)
app.get('/api/colaboratori', (req, res) => {
    // Comanda SQL: Selectează tot (*) din tabel și ordonează după ID descrescător (cel mai nou primul)
    const sql = 'SELECT * FROM colaboratori ORDER BY id DESC';

    db.query(sql, (eroare, rezultate) => {
        if (eroare) {
            console.error('Eroare extragere date:', eroare);
            return res.status(500).json({ mesaj: "Nu am putut încărca datele." });
        }
        // Trimitem lista de colaboratori înapoi către site
        res.status(200).json(rezultate);
    });
});
// Exportăm aplicația pentru funcțiile Serverless Vercel
module.exports = app;