const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); 

const dbPath = path.join(__dirname, 'database', 'example.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});
function authentication(username, password) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT id FROM HCMUT_SSO WHERE username = ? AND password = ?',
            [username, password],
            (err, row) => {
                if (err) {reject(err);}
                else if (row) {resolve(row.id);} 
                else {resolve(null);}
            }
        );
    });
}


// 2. Endpoint POST: Thêm người dùng mới
app.post('/authen', async (req, res) => {
    const { username, password } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
        res.status(400).json({"error": "Vui lòng cung cấp username và password."});
        return;
    }

    const id= await authentication(username,password);
    return res.status(200).json({
        message: 'Đăng nhập thành công!',
        user_id: id,
        token: 'generated_jwt_token_for_session' 
    });
});

// Khởi động Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});