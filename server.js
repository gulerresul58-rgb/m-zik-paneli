const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));

// --- BURAYA KULLANICILARI VE ŞİFRELERİNİ EKLE ---
const kullanicilar = {
    "resul": "12345",
    "ahmet": "sifre678",
    "dj_mustafa": "admin99"
};
// ---

let veritabani = {};

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, req.body.user + '_son.jpg'); }
});
const upload = multer({ storage: storage });

// GİRİŞ EKRANI
app.get('/', (req, res) => res.send(`
    <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
        <form action="/login" method="POST" style="text-align:center; padding:20px; border:1px solid #ccc;">
            <h3>Resul Müzik Giriş</h3>
            <input type="text" name="user" placeholder="Kullanıcı Adı" required style="padding:10px; width:200px;"><br>
            <input type="password" name="pass" placeholder="Şifre" required style="padding:10px; width:200px; margin-top:10px;"><br>
            <button type="submit" style="margin-top:10px; padding:10px 20px; background:#0095f6; color:white; border:none;">Giriş Yap</button>
        </form>
    </body>
`));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] && kullanicilar[user] === pass) {
        res.redirect('/panel?user=' + user);
    } else {
        res.send("Hatalı Giriş! <a href='/'>Tekrar dene</a>");
    }
});

// PANEL (Kullanıcı giriş yaptıktan sonra)
app.get('/panel', (req, res) => {
    const user = req.query.user;
    if (!kullanicilar[user]) return res.redirect('/');
    
    // Eğer kullanıcı verisi yoksa oluştur
    if (!veritabani[user]) veritabani[user] = { metin: "Resul Müzik Yayını", boyut: "40px", renk: "#ffffff" };

    res.send(`
        <body style="font-family:sans-serif; padding:40px;">
            <h2>${user} - Kontrol Paneli</h2>
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="user" value="${user}">
                <input type="file" name="resim" required>
                <button type="submit">Resmi Yükle</button>
            </form>
            <form action="/set-yazi" method="POST" style="margin-top:20px;">
                <input type="hidden" name="user" value="${user}">
                <input type="text" name="metin" value="${veritabani[user].metin}">
                <button type="submit">Yazıyı Güncelle</button>
            </form>
            <br><a href="/">Çıkış Yap</a>
        </body>
    `);
});

app.post('/set-yazi', (req, res) => {
    const { user, metin } = req.body;
    veritabani[user] = { ...veritabani[user], metin };
    res.redirect('/panel?user=' + user);
});

app.post('/upload', upload.single('resim'), (req, res) => res.redirect('/panel?user=' + req.body.user));

// OBS YAYIN EKRANI
app.get('/yayin/:user', (req, res) => {
    const user = req.params.user;
    const data = veritabani[user] || { metin: "" };
    res.send(`
        <body style="margin:0; background:black;">
            <img id="img" src="/uploads/${user}_son.jpg?t=${Date.now()}" style="width:100%;">
            <div id="yazi" style="position:absolute; bottom:50px; left:50px; color:white; font-size:40px;">${data.metin}</div>
            <script>
                setInterval(() => {
                    document.getElementById('img').src = '/uploads/${user}_son.jpg?t=' + Date.now();
                }, 1000);
            </script>
        </body>
    `);
});

app.listen(process.env.PORT || 10000);
