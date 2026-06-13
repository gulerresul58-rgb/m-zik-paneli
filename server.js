const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 1. Kullanıcı Listesi
const kullanicilar = {
    "yayin1": "1234",
    "yayin2": "5678"
};

// 2. Dosya Yükleme Ayarı (Dosyayı kullanıcının isminde kaydeder)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Dosya adı: yayin1.jpg, yayin2.jpg gibi olur
        cb(null, req.body.user + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Tasarım
const style = `<style>
    body { font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 300px; text-align: center; }
    input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
    button { width: 100%; padding: 12px; background: #0095f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style>`;

// Giriş Sayfası
app.get('/', (req, res) => {
    res.send(`<html><head>${style}</head><body><div class="card">
        <h2>Yayın Paneli</h2>
        <form action="/login" method="POST">
            <input type="text" name="user" placeholder="Kullanıcı Adı" required>
            <input type="password" name="pass" placeholder="Şifre" required>
            <button type="submit">Giriş Yap</button>
        </form></div></body></html>`);
});

// Giriş Kontrolü ve Yükleme Paneli
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] && kullanicilar[user] === pass) {
        res.send(`<html><head>${style}</head><body><div class="card">
            <h2>Hoş geldin, ${user}</h2>
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="user" value="${user}">
                <input type="file" name="resim" accept="image/*" required>
                <button type="submit">Resmi Güncelle</button>
            </form></div></body></html>`);
    } else {
        res.send("Hatalı giriş! <a href='/'>Geri dön</a>");
    }
});

// Dosya Yükleme İşlemi
app.post('/upload', upload.single('resim'), (req, res) => {
    res.send(`<html><head>${style}</head><body><div class="card">
        <h2>Başarılı!</h2>
        <p>Resim güncellendi. OBS'te anında değişecektir.</p>
        <a href="/">Panele Dön</a></div></body></html>`);
});

app.listen(10000);
