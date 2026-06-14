const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let kullanicilar = { "admin": "admin123" }; 
let veritabani = {}; // { user: { metin, renk, boyut, konum } }

const upload = multer({ dest: 'public/uploads/' });

// ORTAK TASARIM (Menü ve Özelliklerin hepsi burada)
const layout = (content, user) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; margin: 0; display: flex; }
            .sidebar { width: 220px; background: white; border-right: 1px solid #dbdbdb; height: 100vh; padding: 20px; }
            .card { background: white; border: 1px solid #dbdbdb; width: 450px; padding: 30px; border-radius: 3px; }
            input, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div style="font-weight:bold; margin-bottom:20px;">≡ RESUL MÜZİK</div>
            <a href="${user === 'admin' ? '/admin-paneli' : '/panel?user=' + user}" style="display:block; margin-bottom:10px;">🏠 Panel</a>
            <a href="/">🚪 Çıkış</a>
        </div>
        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
            <div class="card">${content}</div>
        </div>
    </body>
    </html>
`;

app.get('/', (req, res) => res.send(`
    <body style="display:flex; justify-content:center; align-items:center; height:100vh;">
        <form action="/login" method="POST" style="padding:40px; border:1px solid #ddd; background:white;">
            <h3>Resul Müzik Giriş</h3>
            <input type="text" name="user" placeholder="Kullanıcı Adı" required><br>
            <input type="password" name="pass" placeholder="Şifre" required><br>
            <button type="submit">Giriş Yap</button>
        </form>
    </body>
`));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (kullanicilar[user] === pass) res.redirect(user === 'admin' ? '/admin-paneli' : '/panel?user=' + user);
    else res.send("Hatalı!");
});

// ADMIN PANELİ
app.get('/admin-paneli', (req, res) => {
    res.send(layout(`<h1>Admin Paneli</h1>
        <form action="/kisi-ekle" method="POST">
            <input type="text" name="yeniUser" placeholder="Yeni Yayıncı">
            <input type="text" name="yeniPass" placeholder="Şifre">
            <button type="submit">Kullanıcı Ekle</button>
        </form>`, "admin"));
});

app.post('/kisi-ekle', (req, res) => {
    kullanicilar[req.body.yeniUser] = req.body.yeniPass;
    res.redirect('/admin-paneli');
});

// YAYINCI PANELİ (Tüm özelliklerin olduğu yer)
app.get('/panel', (req, res) => {
    const user = req.query.user;
    if(!veritabani[user]) veritabani[user] = {metin:"Resul Müzik", renk:"#ffffff", boyut:40, konum:"bottom: 50px; left: 50px;"};
    const d = veritabani[user];
    res.send(layout(`
        <h3>${user} Yayın Paneli</h3>
        <form action="/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="resim" required><button type="submit">Resim Yükle</button>
        </form>
        <hr>
        <form action="/update-yayin" method="POST">
            <input type="hidden" name="user" value="${user}">
            <input type="text" name="metin" value="${d.metin}">
            <input type="color" name="renk" value="${d.renk}">
            <label>Boyut: ${d.boyut}px</label>
            <input type="range" name="boyut" min="10" max="100" value="${d.boyut}">
            <select name="konum">
                <option value="bottom: 50px; left: 50px;">Sol Alt</option>
                <option value="top: 50px; left: 50px;">Sol Üst</option>
                <option value="bottom: 50px; right: 50px;">Sağ Alt</option>
            </select>
            <button type="submit">Kaydet</button>
        </form>
    `, user));
});

app.post('/update-yayin', (req, res) => {
    veritabani[req.body.user] = req.body;
    res.redirect('/panel?user=' + req.body.user);
});

app.listen(10000);
