const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));

// KULLANICILAR VE ŞİFRELER
const kullanicilar = { "resul": "12345", "ahmet": "sifre" };
let veritabani = {};

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, req.body.user + '_son.jpg'); }
});
const upload = multer({ storage: storage });

// TASARIM ŞABLONU
const layout = (content, user) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; margin: 0; display: flex; }
            .sidebar { width: 220px; background: white; border-right: 1px solid #dbdbdb; height: 100vh; padding: 20px; }
            .card { background: white; border: 1px solid #dbdbdb; width: 400px; padding: 30px; border-radius: 3px; }
            input, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; cursor: pointer; }
            .menu-icon { font-size: 24px; cursor: pointer; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div class="menu-icon">≡</div>
            <div style="font-weight:bold; margin-bottom:20px;">${user.toUpperCase()} PANEL</div>
            <a href="/panel?user=${user}" style="display:block; margin-bottom:10px;">🖼 Resim</a>
            <a href="/yazi?user=${user}" style="display:block;">✍ Yazı Ayarları</a>
        </div>
        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
            <div class="card">${content}</div>
        </div>
    </body>
    </html>
`;

// GİRİŞ
app.get('/', (req, res) => res.send(`
    <body style="display:flex; justify-content:center; align-items:center; height:100vh;">
        <form action="/login" method="POST" style="padding:40px; border:1px solid #ddd; background:white;">
            <h3>Resul Müzik Giriş</h3>
            <input type="text" name="user" placeholder="Kullanıcı" required><br>
            <input type="password" name="pass" placeholder="Şifre" required><br>
            <button type="submit">Giriş Yap</button>
        </form>
    </body>
`));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] === pass) res.redirect('/panel?user=' + user);
    else res.send("Hatalı!");
});

// PANEL
app.get('/panel', (req, res) => {
    const user = req.query.user;
    res.send(layout(`<h3>Resim Yükle</h3><form action="/upload" method="POST" enctype="multipart/form-data"><input type="hidden" name="user" value="${user}"><input type="file" name="resim" required><button type="submit">Yükle</button></form>`, user));
});

// YAZI AYARLARI (SLIDER'LI)
app.get('/yazi', (req, res) => {
    const user = req.query.user;
    if(!veritabani[user]) veritabani[user] = {metin:"Resul Müzik", boyut:40};
    res.send(layout(`
        <h3>Yazı Düzenle</h3>
        <form action="/set-yazi" method="POST">
            <input type="hidden" name="user" value="${user}">
            <input type="text" name="metin" value="${veritabani[user].metin}">
            <label>Boyut: ${veritabani[user].boyut}px</label>
            <input type="range" name="boyut" min="10" max="100" value="${veritabani[user].boyut}">
            <button type="submit">Kaydet</button>
        </form>
    `, user));
});

app.post('/set-yazi', (req, res) => {
    veritabani[req.body.user] = { metin: req.body.metin, boyut: req.body.boyut };
    res.redirect('/yazi?user=' + req.body.user);
});

app.post('/upload', upload.single('resim'), (req, res) => res.redirect('/panel?user=' + req.body.user));

// OBS EKRANI
app.get('/yayin/:user', (req, res) => {
    const data = veritabani[req.params.user] || { metin: "Resul Müzik", boyut: 40 };
    res.send(`<body style="margin:0; background:black;"><img src="/uploads/${req.params.user}_son.jpg?t=${Date.now()}" style="width:100%;"><div style="position:absolute; bottom:50px; left:50px; color:white; font-size:${data.boyut}px;">${data.metin}</div></body>`);
});

app.listen(process.env.PORT || 10000);
