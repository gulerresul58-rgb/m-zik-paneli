const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const dbFile = path.join(__dirname, 'veriler.json');
let veriler = { kullanicilar: { "admin": "admin123" }, ayarlari: {} };

if (fs.existsSync(dbFile)) {
    veriler = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function save() { fs.writeFileSync(dbFile, JSON.stringify(veriler, null, 2)); }

const upload = multer({ dest: 'public/uploads/' });

const layout = (content, user, isMenu = true) => `
    <html>
    <head>
        <style>
            body { background: #fafafa; font-family: sans-serif; margin: 0; display: flex; }
            .sidebar { width: 220px; background: white; border-right: 1px solid #dbdbdb; height: 100vh; padding: 20px; }
            .card { background: white; border: 1px solid #dbdbdb; width: 450px; padding: 30px; border-radius: 3px; }
            input, select { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #dbdbdb; }
            button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; font-weight: bold; cursor: pointer; }
            .user-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
        </style>
    </head>
    <body>
        ${isMenu ? `<div class="sidebar"><h3>≡ RESUL MÜZİK</h3><a href="${user === 'admin' ? '/admin-paneli' : '/panel?user=' + user}">🏠 Panel</a><br><br><a href="/">🚪 Çıkış</a></div>` : ''}
        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
            <div class="card">${content}</div>
        </div>
    </body>
    </html>
`;

app.get('/', (req, res) => res.send(layout(`<h3>Giriş</h3><form action="/login" method="POST"><input type="text" name="user" placeholder="Kullanıcı"><input type="password" name="pass" placeholder="Şifre"><button type="submit">Giriş</button></form>`, "Giriş", false)));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (veriler.kullanicilar[user] === pass) res.redirect(user === 'admin' ? '/admin-paneli' : '/panel?user=' + user);
    else res.send("Yanlış Kulanıcı Adı Veya Şifre Girdiniz Lütfen Tekrar Deneyiniz!");
});

app.get('/admin-paneli', (req, res) => {
    let list = Object.keys(veriler.kullanicilar).map(u => `
        <div class="user-item"><span>${u}</span> ${u !== 'admin' ? `<form action="/sil" method="POST"><input type="hidden" name="user" value="${u}"><button style="background:red; width:auto; padding:5px 10px;">Sil</button></form>` : 'Admin'}</div>
    `).join('');
    res.send(layout(`<h1>Yönetim</h1><form action="/kisi-ekle" method="POST"><input type="text" name="yeniUser" placeholder="Kullanıcı"><input type="text" name="yeniPass" placeholder="Şifre"><button type="submit">Ekle</button></form><h3>Kullanıcılar:</h3>${list}`, "admin"));
});

app.post('/kisi-ekle', (req, res) => {
    veriler.kullanicilar[req.body.yeniUser] = req.body.yeniPass;
    save(); res.redirect('/admin-paneli');
});

app.post('/sil', (req, res) => {
    delete veriler.kullanicilar[req.body.user];
    save(); res.redirect('/admin-paneli');
});

app.get('/panel', (req, res) => {
    const user = req.query.user;
    if(!veriler.ayarlari[user]) veriler.ayarlari[user] = {metin:"Resul Müzik Mix Panel", renk:"#ffffff", boyut:40, konum:"bottom: 50px; left: 50px;", font:"Arial"};
    const d = veriler.ayarlari[user];
    res.send(layout(`<h3>${user} Paneli</h3>
        <form action="/upload" method="POST" enctype="multipart/form-data"><input type="file" name="resim"><button type="submit">Yükle</button></form>
        <form action="/update-yayin" method="POST">
            <input type="hidden" name="user" value="${user}">
            <input type="text" name="metin" value="${d.metin}">
            <input type="color" name="renk" value="${d.renk}">
            <label>Boyut: ${d.boyut}px</label>
            <input type="range" name="boyut" min="10" max="100" value="${d.boyut}">
            <label>Yazı Stili:</label>
            <select name="font">
                <option value="Arial" ${d.font=="Arial"?"selected":""}>Arial</option>
                <option value="Courier New" ${d.font=="Courier New"?"selected":""}>Courier New</option>
                <option value="Georgia" ${d.font=="Georgia"?"selected":""}>Georgia</option>
                <option value="cursive" ${d.font=="cursive"?"selected":""}>El Yazısı</option>
                <option value="fantasy" ${d.font=="fantasy"?"selected":""}>Modern</option>
            </select>
            <select name="konum">
                <option value="bottom: 50px; left: 50px;" ${d.konum.includes("bottom") && d.konum.includes("left")?"selected":""}>Sol Alt</option>
                <option value="top: 50px; left: 50px;" ${d.konum.includes("top") && d.konum.includes("left")?"selected":""}>Sol Üst</option>
                <option value="bottom: 50px; right: 50px;" ${d.konum.includes("bottom") && d.konum.includes("right")?"selected":""}>Sağ Alt</option>
            </select>
            <button type="submit">Kaydet</button>
        </form>`, user));
});

app.post('/update-yayin', (req, res) => {
    veriler.ayarlari[req.body.user] = req.body;
    save(); res.redirect('/panel?user=' + req.body.user);
});

app.post('/upload', upload.single('resim'), (req, res) => res.redirect('/panel?user=' + req.body.user));

app.get('/yayin/:user', (req, res) => {
    const d = veriler.ayarlari[req.params.user] || { metin: "Yayında", boyut: 40, renk: "#fff", konum: "", font: "Arial" };
    res.send(`<body style="margin:0; background:black;"><img src="/uploads/${req.params.user}_son.jpg" style="width:100%;"><div style="position:absolute; ${d.konum} color:${d.renk}; font-size:${d.boyut}px; font-family:${d.font};">${d.metin}</div></body>`);
});

app.listen(process.env.PORT || 10000);
