const username_input = document.querySelector('.username');
const password_input = document.querySelector('.password');
const login_button = document.querySelector('.login-button');

login_button.addEventListener('click',async () => {
    const username = username_input.value;
    const password = password_input.value;
    const API_URL = 'http://localhost:3000/authen';
    const userData = { username, password };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();

        if (data.error) {
            alert('Lỗi: ' + data.error);
        } else {
            alert('user id: '+ data.user_id); 
        }

    } catch (error) {
        alert('Lỗi kết nối Server: ' + error.message);
    }
});
