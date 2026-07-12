const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
        if (users.find(u => u.username === username)) {
            return res.status(404).json({ message: "User already exists!" });
        }
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
        return res.status(400).json({ message: "Username and password are required" });
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const getBooks = new Promise((resolve) => {
            resolve(books);
        });
        const bookList = await getBooks;
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error getting book list" });
    }
});

// Get book details based on ISBN 
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const getBookByIsbn = new Promise((resolve, reject) => {
            const isbn = req.params.isbn;
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error("Book does not exist"));
            }
        });
        const book = await getBookByIsbn;
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});
  
// Get book details based on author 
public_users.get('/author/:author', async function (req, res) {
    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            let returnList = [];
            var currAuthor = req.params.author;

            for (let isbn in books) {
                if (books[isbn].author === currAuthor) {
                    returnList.push({
                        "isbn": isbn,
                        "title": books[isbn].title,
                        "reviews": books[isbn].reviews
                    });
                }
            }
            
            if (returnList.length > 0) {
                resolve(returnList);
            } else {
                reject(new Error("Author was not found"));
            }
        });

        const returnList = await getBooksByAuthor;
        return res.status(200).json(returnList);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const getBooksByTitle = new Promise((resolve, reject) => {
            let returnList = [];
            var title = req.params.title;
            
            for (let isbn in books) {
                if (books[isbn].title === title) {
                    returnList.push({
                        "isbn": isbn,
                        "author": books[isbn].author,
                        "reviews": books[isbn].reviews
                    });
                }
            }
            
            if (returnList.length > 0) {
                resolve(returnList);
            } else {
                reject(new Error("Title was not found"));
            }
        });

        const returnList = await getBooksByTitle;
        return res.status(200).json(returnList);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
    var isbn = req.params.isbn;
    var book = books[isbn];
    
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book was not found" });
    }
});

const getBookByAuthorAxios = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by author:", error);
    }
};
module.exports.general = public_users;
