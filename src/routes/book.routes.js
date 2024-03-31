const express = require('express')
const route = express.Router()
const Book = require('../models/book.model')

//Middelware
const getBook = async (req, res, next) => {
    let book;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json(
            {
                message: 'El ID del libro no es valido'
            }
        )
    }

    try {
        book = await Book.findById(id);
        if (!book) {
            return res.status(404).json(
                {
                    message: "El libro no fue encontrado"
                }
            )
        }
    } catch (error) {
        return res.status(500).json(
            {
                message: error.message

            }
        )
    }

    res.book = book;
    next()
}

//Obtener todos los libros [GET ALL]
route.get('/', async (req, res) => {
    try {
        const books = await Book.find()
        console.log('GET ALL', books)
        if (books.length === 0) {
            return res.status(204).json([])
        }
        res.json(books)
    } catch (error) {
        res.status(500).json({ mesasge: error.message })

    }

})

//Crear un nuevo libro (recurso) [POST]

route.post('/', async (req, res) => {
    const { title, author, genre, publication_date } = req?.body
    if (!title || !author || !genre || !publication_date) {
        return res.status(400).json({
            message: "Los campos titulo, autor, genero y fecha son obligatorios"
        })
    }

    const book = new Book(
        {
            title,
            author,
            genre,
            publication_date
        }
    )

    try {
        const newBook = await book.save()
        res.status(201).json(newBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }

})

route.get('/:id', getBook, async (req, res) => {
    res.json(res.book);
})

route.put('/:id', getBook, async (req, res) => {
    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.publication_date || book.publication_date;
        const updatedBook = await book.save()
        res.json(updatedBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })

    }
})

route.patch('/:id', getBook, async (req, res) => {

    if (!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date) {
        res.status(400).json({
            message: "Al menos de uno de estos campos debe ser enviado: Titulo, Autor, Genero o Fecha de Publicacion"
        })
    }

    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.publication_date || book.publication_date;
        const updatedBook = await book.save()
        res.json(updatedBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })

    }
})

route.delete('/:id', getBook, async (req, res) => {
    try {
        const book = res.book
        await book.deleteOne({
            _id: book._id
        })
        res.json({
            message: `El libro ${book.title} fue eliminado correctamente`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})
module.exports = route