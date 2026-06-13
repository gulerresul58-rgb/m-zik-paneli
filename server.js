const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const upload = multer({ dest: 'public/uploads/' });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Giriş Ekranı
app.get('/', (req, res) => {
    res.send(`<h1>Giriş</h1><form action="/login" method="POST"><input type="text" name="user"><input type="password" name="pass"><button>Giriş</button></form>`);
});

// Resim Yükleme Paneli
app.post('/login', (req, res) => {
    if(req.body.user === "yayin1" && req.body.pass === "1234") {
        res.send(`<h1>Resim Yükle</h1>
        <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="resim">
        <button type="submit">Yükle</button></form>`);
    } else { res.send("Hatalı giriş!"); }
});

// Dosyayı Kaydet
app.post('/upload', upload.single('resim'), (req, res) => {
    res.send("Yüklendi! Artık OBS'ten görebilirsin.");
});

// OBS'in Çekeceği Link
app.get('/overlay/yayin1', (req, res) => {
    // Burada son yüklenen resim gösterilecek
    res.send(`<h1>OBS Ekranı</h1><img src="/uploads/${req.file ? req.file.filename : ''}" style="width:100%;">`);
});

app.listen(10000);
