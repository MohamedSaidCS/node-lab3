const http = require('http');
const fs = require('fs');


http.createServer(function (req, res) {
    if(req.url === '/') {
        res.writeHead(200, {'content-type': "text/html"});
        const html = fs.readFileSync('index.html');
        res.write(html);
        res.end();
    }
    else if (req.url === '/api/signup' && req.method === 'POST') {
        let data = [];
        req.on('data', (chunk) => {
            data.push(chunk);
        }).on('end', () => {
            data = Buffer.concat(data).toString();
            let result = signup(JSON.parse(data));
            if(result.success)
                res.writeHead(200, {'content-type': "application/json"});
            else
                res.writeHead(400, {'content-type': "application/json"});

            res.end(JSON.stringify(result));
        });
    } else if (req.url === '/api/login' && req.method === 'POST') {
        let data = [];
        req.on('data', (chunk) => {
            data.push(chunk);
        }).on('end', () => {
            data = Buffer.concat(data).toString();
            let result = login(JSON.parse(data));
            if(result.success) {
                res.writeHead(200, {'content-type': "application/json"});
                let html = fs.readFileSync('profile.html', 'utf-8');
                html = html.replace('{username}', result.user.username);
                res.write(html);
                res.end();
            }
            else {
                res.writeHead(400, {'content-type': "application/json"});
                res.end(JSON.stringify(result));
            }
        });
    } else {
        res.writeHead(404, {'content-type': "application/json"});
        const result = {
            message: 'Not found.'
        }
        res.end(JSON.stringify(result));
    }
}).listen(3000);


const signup = (data) => {
    const users = JSON.parse(fs.readFileSync('users.json'));
    if(users.find((user) => user.username === data.username)) {
        return {
            success: false,
            message: 'Username already exists.'
        }
    } else if (users.find((user) => user.email === data.email)) {
        return {
            success: false,
            message: 'Email already exists.'
        }
    } else {
        users.push(data);
        fs.writeFileSync('users.json', JSON.stringify(users));
        return {
            success: true,
            message: 'Signup successful.'
        }
    }
}


const login = (data) => {
    const users = JSON.parse(fs.readFileSync('users.json'));
    let index = users.findIndex((user) => user.email === data.email);
    if(index !== -1 && users[index].password === data.password) {
        return {
            success: true,
            message: 'Login successful.',
            user: users[index]
        }
    } else if(index !== -1 && users[index].password !== data.password) {
        return {
            success: false,
            message: 'Incorrect password.'
        }
    } else {
        return {
            success: false,
            message: 'Incorrect email.'
        }
    }
}