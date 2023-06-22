// Complete Events Exercise
const { EventEmitter } = require('events');
// const http = require('http');

const { createServer } = require('http');
const path = require('path');
const fs = require('fs');


const NewsLetter = new EventEmitter();

const server = createServer((req, res) =>{
    const chunks = [];
    const { url, method } = req;
    req.on('data', (chunk) => {
        chunks.push(chunk);
        //console.log(chunks);
    });

    req.on('end', () => {
        if(url === "/newsletter_signup" && method === "POST"){
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const newContact = `${body.name}, ${body.email}\n`;
            
            NewsLetter.emit("signup", newContact, res);
            res.setHeader('Content-Type', 'application/json');
            
            res.write(
                JSON.stringify({ message: "Signed up successfully"})
            )
            res.end();
        
        }
        else if(url === "/newsletter_signup" && method === "GET"){
            res.setHeader("Content-Type", "text/html");
            const readStream = fs.createReadStream(
                path.join(__dirname, "./public/index.html")
            )
            readStream.pipe(res);
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({ message: "Not a valid url"}));
            res.end();
        }
    });
});
 
NewsLetter.on("signup", (newContact, res) => {
    fs.appendFile(
        path.join(__dirname, "./assets/newsletter.csv"),
        newContact,
        (err)=>{
            if(err) {
                NewsLetter.emit("error", err, res);
                return;
            }
            console.log("You have been added to the newsletter");
        }
    )
})

NewsLetter.on("error", (err, res) => { 
        
        res.statusCode = (500);
        console.log(err);   
        res.setHeader('Content-Type', 'application/json');
        res.write(
            JSON.stringify({ message: "Error adding contact"})
        )
        res.end();
    
})

server.listen(3000, () => {
    console.log("Server listening on port 3000");
})