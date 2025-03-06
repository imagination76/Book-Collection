// Required modules
const http = require('http');
const url = require('url');
const { parse } = require('querystring');

// In-memory store for books
let books = [
    { id: 1, title: '1984', author: 'George Orwell', year: 1949 },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
];

// Function to handle incoming requests
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    
    
    // Set headers for the response
    res.setHeader('Content-Type', 'application/json');

    // Route for books collection
    if (parsedUrl.pathname === '/books') {
        if (method === 'GET') {
            // Return all books
            res.writeHead(200);
            res.end(JSON.stringify(books));
        } else if (method === 'POST') {
            // Add a new book
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });

            req.on('end', () => {
                const { title, author, year } = JSON.parse(body);
                if (title && author && year) {
                    const newBook = {
                        id: books.length + 1,
                        title,
                        author,
                        year,
                    };
                    books.push(newBook);
                    res.writeHead(201);
                    res.end(JSON.stringify(newBook));
                } else {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Missing book information' }));
                }
            });
        } else {
            res.writeHead(405);
            res.end(JSON.stringify({ message: 'Method Not Allowed' }));
        }
    } else if (parsedUrl.pathname.startsWith('/books/')) {
        const bookId = parseInt(parsedUrl.pathname.split('/')[2], 10);

        const book = books.find(b => b.id === bookId);

        if (!book) {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Book not found' }));
        } else {
            if (method === 'GET') {
                // Return a specific book
                res.writeHead(200);
                res.end(JSON.stringify(book));
            } else if (method === 'PUT') {
                // Update a book
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });

                req.on('end', () => {
                    const { title, author, year } = JSON.parse(body);
                    if (title) book.title = title;
                    if (author) book.author = author;
                    if (year) book.year = year;
                    res.writeHead(200);
                    res.end(JSON.stringify(book));
                });
            } else if (method === 'DELETE') {
                // Delete a book
                books = books.filter(b => b.id !== bookId);
                res.writeHead(204);
                res.end();
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ message: 'Method Not Allowed' }));
            }
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};

// Create HTTP server
const server = http.createServer(requestHandler);

// Set the server to listen on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
