const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));

const kullanicilar = { "yayin1": "1234", "yayin2": "5678" };

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, req.body.user + '_son.jpg'); }
});
const upload = multer({ storage: storage });

// ORTAK TASARIM ŞABLONU (Tüm sayfalar aynı kutunun içinde)
const renderPage = (content) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; border: 1px solid #dbdbdb; width: 350px; padding: 40px; text-align: center; border-radius: 3px; }
            .logo { font-size: 1.8em; font-weight: bold; color: #333; margin-bottom: 25px; }
            input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; box-sizing: border-box; border-radius: 3px; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; margin-top: 10px; cursor: pointer; border-radius: 3px; }
            a { color: #0095f6; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">Resul Müzik Mix Panel</div>
            ${content}
        </div>
    </body>
    </html>
`;

// GİRİŞ SAYFASI
app.get('/', (req, res) => {
    res.send(renderPage(`
        <form action="/login" method="POST">
            <input type="text" name="user" placeholder="Kullanıcı Adı">
            <input type="password" name="pass" placeholder="Şifre">
            <button type="submit">Giriş Yap</button>
        </form>
    `));
});

// YÜKLEME SAYFASI (Giriş yapınca bu görünecek)
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] && kullanicilar[user] === pass) {
        res.send(renderPage(`
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="user" value="${user}">
                <input type="file" name="resim" required style="border:none; margin-bottom:10px;">
                <button type="submit">Resmi Yükle</button>
            </form>
        `));
    } else { res.send(renderPage("Hatalı Giriş!")); }
});

// YÜKLEME SONUCU
app.post('/upload', upload.single('resim'), (req, res) => {
    res.send(renderPage("Başarıyla Yüklendi! <br><br> <a href='/'>Geri dön</a>"));
});

// OBS EKRANI
app.get('/son-resim/:user', (req, res) => {
    const filePath = path.join(uploadDir, req.params.user + '_son.jpg');
    if (fs.existsSync(filePath)) {
        res.send(`
            <html><head><meta http-equiv="refresh" content="1"></head>
            <body style="margin:0; background:black; display:flex; justify-content:center; align-items:center; height:100vh;">
                <img src="/uploads/${req.params.user + '_son.jpg'}?t=${Date.now()}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </body></html>
        `);
    } else {
        res.send("<h1 style='color:white; text-align:center;'>Resim bekleniyor...</h1>");
    }
});

app.listen(process.env.PORT || 10000);
