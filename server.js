const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const kullanicilar = { "yayin1": "1234", "yayin2": "5678" };

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

// ORTAK TASARIM (Hem giriş hem yükleme için şablon)
const renderPage = (content) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; border: 1px solid #dbdbdb; width: 350px; padding: 40px; text-align: center; border-radius: 3px; }
            .logo { font-size: 1.8em; font-weight: bold; color: #333; margin-bottom: 25px; }
            input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; box-sizing: border-box; border-radius: 3px; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; margin-top: 10px; cursor: pointer; border-radius: 3px; }
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

// GİRİŞ PANELİ
app.get('/', (req, res) => {
    res.send(renderPage(`
        <form action="/login" method="POST">
            <input type="text" name="user" placeholder="Kullanıcı Adı">
            <input type="password" name="pass" placeholder="Şifre">
            <button type="submit">Giriş Yap</button>
        </form>
    `));
});

// GİRİŞ İŞLEMİ
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] && kullanicilar[user] === pass) {
        res.send(renderPage(`
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="user" value="${user}">
                <input type="file" name="resim" required style="border:none;">
                <button type="submit">Resmi Yükle</button>
            </form>
        `));
    } else { res.send(renderPage("Hatalı Giriş!")); }
});

// YÜKLEME İŞLEMİ
app.post('/upload', upload.single('resim'), (req, res) => {
    res.send(renderPage("Başarıyla Yüklendi! <br><br> <a href='/'>Geri dön</a>"));
});

// OBS EKRANI
app.get('/son-resim/:user', (req, res) => {
    const user = req.params.user;
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) return res.send("Klasör yok");
    const files = fs.readdirSync(dir).filter(f => f.startsWith(user + '_')).sort();
    
    if (files.length > 0) {
        const sonDosya = files[files.length - 1];
        res.send(`
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                    img { max-width: 100%; max-height: 100%; object-fit: contain; }
                </style>
                <script>
                    setInterval(() => {
                        const img = document.querySelector('img');
                        img.src = '/uploads/${sonDosya}?t=' + new Date().getTime();
                    }, 1000);
                </script>
            </head>
            <body>
                <img src="/uploads/${sonDosya}?t=${Date.now()}">
            </body>
            </html>
        `);
    } else {
        res.send("<h1 style='color:white; text-align:center;'>Resim bekleniyor...</h1>");
    }
});

app.listen(10000);
