const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// ROUTE:1 get all notesusing :GET /api/auth/getuser  Login required
router.get("/fetchnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal serve r error");
  }
});
// ROUTE:2  add new note using note :POST /api/auth/addnote  Login required
router.post("/addnote", fetchuser,
  [
    body("title", "enter a valid name ").isLength({ min: 3 }),
    body("description", "edescriptio atlest 5 character").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      // if there are error, return bad request and the error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const notes = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await notes.save();

      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal serve r error");
    }
  }
);

// ROUTE:3 update axisting note using: DELETE /api/auth/deletenote  Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //create newNotee obj
    const newNote = {};
    if (title) {
      newNote.title = title;
      if (description) newNote.description = description;
      if (tag) newNote.tag = tag;
    }

    //find the note to be updated
    let note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).send("not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal serve r error");
  }
});

// ROUTE:4 delete axisting note using: PUT /api/auth/updatenote  Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    //find the note to be delete and deleted
    let note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).send("not found");
    }

    // Allow deletion only if user Owns this NOTE
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note hhas ben deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal serve r error");
  }
});
module.exports = router;
