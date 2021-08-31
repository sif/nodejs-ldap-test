var express = require('express');
const ldap = require('ldapjs');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	//response.send("username = " + username + ", password = " + password);
  //response.end();

	if (username && password) {
		const client = ldap.createClient({
  		url: ['ldap://localhost:10389']
		});

    client.on('error', (err) => {
  		response.send("This doesn't work: " + err.message);
      response.end();
		})

		client.bind("cn=" + username + ",ou=Users,dc=example,dc=com", password, function(error) {
      if(error){
				response.send("The bind does not work: " + error.message);
        response.end();
      } else{
				response.send("The login works.");
      }
    })

	//	connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
	//		if (results.length > 0) {
	//			request.session.loggedin = true;
	//			request.session.username = username;
	//			response.redirect('/home');
	//		} else {
	//			response.send('Incorrect Username and/or Password!');
	//		}
	//		response.end();
	//	});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);
