const Note = require('../models/Note');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.listByUser(req.user.id);
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findByIdForUser(req.params.id, req.user.id);
    if (!note) {
      res.status(404);
      return next(new Error('Note not found'));
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  const { title, content, folder } = req.body;

  try {
    const note = await Note.create({
      userId: req.user.id,
      title: title || 'Untitled Note',
      content: content || '',
      folder: folder || 'General'
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  const { title, content, folder } = req.body;

  try {
    let note = await Note.findByIdForUser(req.params.id, req.user.id);
    if (!note) {
      res.status(404);
      return next(new Error('Note not found'));
    }

    const updatedNote = await Note.update(req.params.id, req.user.id, { title, content, folder });
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const deleted = await Note.remove(req.params.id, req.user.id);
    if (!deleted) {
      res.status(404);
      return next(new Error('Note not found'));
    }
    res.json({ message: 'Note removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};
