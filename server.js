const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Tasarım kodları (CSS)
const style = `
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fafafa; margin: 0; }
        .card { background: white; padding: 40px; border: 1px solid #dbdbdb; border-radius: 5px; width: 300px; text-align: center; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #dbdbdb; border-radius: 3px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #0095f6; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        h1 { font-family: cursive; margin-bottom: 30px; }
    </style>
`;

// 1. Giriş Sayfası (Tema Ekli)
app.get('/', (req, res) => {
    res.send(`
        <html><head>${style}</head><body>
        <div class="card">
            <h1>M-Zik</h1>
            <form action="/login" method="POST">
                <input type="text" name="user" placeholder="Kullanıcı adı" required>
                <input type="password" name="pass" placeholder="Şifre" required>
                <button type="submit">Giriş Yap</button>
            </form>
        </div></body></html>
    `);
});

// 2. Panel (Giriş sonrası görünen kısım)
app.post('/login', (req, res) => {
    if(req.body.user === "yayin1" && req.body.pass === "1234") {
        res.send(`
            <html><head>${style}</head><body>
            <div class="card">
                <h2>Panel</h2>
                <p>Resim Linki Yükle:</p>
                <form action="/guncelle" method="POST">
                    <input type="text" name="yeniLink" placeholder="Link buraya...">
                    <button type="submit">Güncelle</button>
                </form>
            </div></body></html>
        `);
    } else { res.send("Hatalı giriş!"); }
});

app.listen(10000);
