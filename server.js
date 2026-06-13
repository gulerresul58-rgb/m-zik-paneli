const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// --- KULLANICILAR BURADA ---
const kullanicilar = {
    "yayin1": "1234",
    "yayin2": "5678"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, req.body.user + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const style = `<style>
    body { font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 320px; text-align: center; }
    input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
    button { width: 100%; padding: 12px; background: #0095f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style>`;

// --- GİRİŞ VE PANEL SAYFALARI ---
app.get('/', (req, res) => {
    res.send(`<html><head>${style}</head><body><div class="card">
        <h2>Resul Müzik Mix Panel</h2>
        <form action="/login" method="POST">
            <input type="text" name="user" placeholder="Kullanıcı Adı" required>
            <input type="password" name="pass" placeholder="Şifre" required>
            <button type="submit">Giriş Yap</button>
        </form></div></body></html>`);
});

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] && kullanicilar[user] === pass) {
        res.send(`<html><head>${style}</head><body><div class="card">
            <h2>Resul Müzik Mix Panel</h2>
            <p>Hoş geldin, ${user}</p>
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="user" value="${user}">
                <input type="file" name="resim" accept="image/*,video/*" required>
                <button type="submit">Resmi Güncelle</button>
            </form></div></body></html>`);
    } else {
        res.send("Hatalı giriş! <a href='/'>Geri dön</a>");
    }
});

app.post('/upload', upload.single('resim'), (req, res) => {
    res.send(`<html><head>${style}</head><body><div class="card">
        <h2>Resul Müzik Mix Panel</h2>
        <p>Resim başarıyla güncellendi!</p>
        <a href="/">Panele Dön</a></div></body></html>`);
});

// --- OBS İÇİN OTOMATİK YENİLEYEN SİSTEM ---
app.get('/son-resim/:user', (req, res) => {
    const user = req.params.user;
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) return res.status(404).send('Klasör yok');
    
    const files = fs.readdirSync(dir);
    const userFiles = files.filter(f => f.startsWith(user + '_')).sort();
    
    if (userFiles.length > 0) {
        const sonDosya = userFiles[userFiles.length - 1];
        res.send(`
            <html>
            <body style="margin:0; padding:0; overflow:hidden;">
                <img id="resim" src="/uploads/${sonDosya}" style="width:100%; height:100%; object-fit:contain;">
                <script>
                    setInterval(() => {
                        const img = document.getElementById('resim');
                        img.src = '/uploads/${sonDosya}?t=' + new Date().getTime();
                    }, 2000);
                </script>
            </body>
            </html>
        `);
    } else {
        res.send('Henüz resim yüklenmemiş.');
    }
});

app.listen(10000);
