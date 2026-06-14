const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const app = express();

const uri = process.env.MONGO_URI || "mongodb+srv://resul3402:resul0234@cluster0.9jn6f7f.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function getDb() {
    try {
        if (!client.topology || !client.topology.isConnected()) await client.connect();
        const db = client.db("resul_muzik").collection("data");
        const doc = await db.findOne({ id: "veriler" });
        if (!doc) await db.insertOne({ id: "veriler", kullanicilar: { "admin": "admin123" }, ayarlari: {} });
        return db;
    } catch (e) { return null; }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const upload = multer({ dest: 'public/uploads/' });

const layout = (content, user, isSidebar = false, isLogin = false, msg = "") => `
    <html>
    <head>
        <title>Resul Müzik Mix</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f0f2f5; display: flex; ${isLogin ? 'justify-content: center; align-items: center; height: 100vh;' : ''} }
            .sidebar { width: 250px; background: #fff; height: 100vh; padding: 25px; border-right: 1px solid #ddd; }
            .content { flex: 1; padding: 40px; display: flex; justify-content: center; align-items: flex-start; }
            .card { background: white; padding: 30px; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; }
            .bubble-btn { display: block; padding: 15px; margin: 10px 0; border-radius: 50px; background: #0095f6; color: white; text-decoration: none; font-weight: bold; transition: 0.3s; }
            .bubble-btn:hover { background: #0077c2; transform: scale(1.02); }
            input, select { width: 100%; padding: 15px; margin: 10px 0; border: 2px solid #eee; border-radius: 50px; box-sizing: border-box; outline: none; }
            button { width: 100%; padding: 15px; background: #0095f6; color: white; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; }
            #toast { visibility: hidden; background: #333; color: white; padding: 15px 30px; border-radius: 50px; position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); }
            #toast.show { visibility: visible; }
        </style>
    </head>
    <body>
        ${isSidebar ? `<div class="sidebar"><h3>≡ PANEL</h3>
            ${user !== 'admin' ? `<a href="/panel?user=${user}" class="bubble-btn">🏠 Ana Sayfa</a>` : ''}
            <a href="/panel?user=${user}&view=resim" class="bubble-btn">🖼 Resim Yükle</a>
            <a href="/panel?user=${user}&view=yazi" class="bubble-btn">✍ Yazı Ayarları</a>
            ${user === 'admin' ? '<a href="/admin-paneli" class="bubble-btn" style="background:#e1306c;">👤 Kullanıcı Yönetimi</a>' : ''}
            <br><a href="/" style="color:red; text-decoration:none;">Çıkış Yap</a>
        </div>` : ''}
        <div class="content"><div class="card">${content}</div></div>
        <div id="toast">${msg}</div>
        <script>${msg ? "var x=document.getElementById('toast'); x.className='show'; setTimeout(()=>{x.className=''},3000);" : ""}</script>
    </body>
    </html>
`;

app.get('/', (req, res) => res.send(layout(`<h2>Resul Müzik</h2><form action="/login" method="POST"><input name="user" placeholder="Kullanıcı Adı" required><input name="pass" type="password" placeholder="Şifre" required><button type="submit">Giriş Yap</button></form>`, "", false, true)));

app.post('/login', async (req, res) => {
    const db = await getDb();
    const doc = await db.findOne({ id: "veriler" });
    if (doc?.kullanicilar?.[req.body.user] === req.body.pass) res.redirect('/panel?user=' + req.body.user);
    else res.send("Hatalı giriş!");
});

app.get('/panel', async (req, res) => {
    const { user, view, msg } = req.query;
    const db = await getDb();
    const doc = await db.findOne({ id: "veriler" });
    const d = doc?.ayarlari?.[user] || { metin: "Resul Müzik", boyut: 40, renk: "#000000", dikey: 50, yatay: 50, font: "Arial" };
    
    let content = !view ? `<h2>Hoş geldin, ${user}</h2>${user === 'admin' ? `<p>OBS Yayın Linkin:<br><input value="https://${req.headers.host}/yayin/${user}" readonly onclick="this.select()"></p>` : ''}` 
        : (view === 'yazi' ? `<h3>Yazı Ayarları</h3><form action="/update-yayin" method="POST"><input type="hidden" name="user" value="${user}"><input name="metin" value="${d.metin}"><input name="renk" type="color" value="${d.renk}"><button type="submit">Kaydet</button></form>` 
        : `<h3>Resim Yükle</h3><form action="/upload" method="POST" enctype="multipart/form-data"><input type="hidden" name="user" value="${user}"><input type="file" name="resim"><button type="submit">Yükle</button></form>`);
    res.send(layout(content, user, true, false, msg));
});

// ... (upload, update-yayin, yayin, api-ayarlar, admin-paneli rotaları aynı şekilde kalabilir)
// Sadece admin-paneli kısmında user !== 'admin' kontrolü ile "Ana Sayfa" butonunu kapattım.

app.listen(process.env.PORT || 10000);
