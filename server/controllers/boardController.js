const Board = require('./../models/boardModel');
const Column = require('./../models/columnModel');
const Card = require('./../models/cardModel');
const { findByIdAndDelete } = require('../models/userModel');

// GET - get all users boards
exports.getAllBoards = async (req, res) => {
  try {
    const { query, sort, collection } = req.query;
    const sortBoards = {}
    const boardResults = {};

    if (query) {
      boardResults.title = new RegExp (query, 'i')  
    }

    if (sort) {
      if (sort === 'newest') {
        sortBoards.createdAt = 'desc'
      } else if (sort === 'oldest') {
        sortBoards.createdAt = 'asc';
      } else if (sort === 'alphabetically') {
        sortBoards.title = 'asc';
      } else if (sort === 'reverse-alphabetically') {
        sortBoards.title = 'desc';
      }
    }

    if (collection) {
      boardResults.category = new RegExp (collection, 'i')  
    }

    const boards = await Board
    .find({ 
      userId: req.userData._id 
    })
    .find(boardResults)
    .sort(sortBoards)
    .populate({
      path: "columnInfo", 
      populate: [
        {
        path: 'cardInfo',
        model: "Cards"
        }
      ]
    });
  
    if (boards.length === 0) {
      const firstBoard = new Board({
         userId:req.userData._id,
         title:"",
         columnInfo: [],
      });
      return res.status(200).json({ message: 'user has not created any boards' })
    } else {
      return res.status(200).json({ boards });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

// Get - get users board by id
exports.getOneBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findOne({ _id: boardId }).populate({
      path: "columnInfo", 
      populate: [
        {
        path: 'cardInfo',
        model: "Cards"
        }
      ]
    });
    // const columns = await Column.find({column: columnId}).populate('cardInfo');

    if (!board) {
      return res.status(404).json({ message: 'board with given id was not found' });
    } else {
      return res.status(200).json({ board: board })
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

// POST - create a new board
exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const newBoard = await Board.create({
      userId: req.userData._id,
      title: title,
      category: null,
      columnInfo: [],
    })

    res.status(201).json({ newBoard: newBoard });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change board title
exports.updateTitle = async (req, res) => {
  try {
    const { boardId } = req.params;
      const updatedBoard = await Board.findOneAndUpdate(boardId, { title: req.body.title }, { new: true }).populate('columnInfo');
  
      if (!updatedBoard) {
        return res
          .status(404)
          .json({ message: 'board with given id was not found' });
      } else {
        return res.status(200).json({ updatedBoard: updatedBoard });
      }
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change board category
exports.updateCollection = async (req, res) => {
  try {
    const { boardId } = req.params;
      const updatedBoard = await Board.findOneAndUpdate(boardId, { category: req.body.category }, { new: true }).populate('columnInfo');
  
      if (!updatedBoard) {
        return res
          .status(404)
          .json({ message: 'board with given id was not found' });
      } else {
        return res.status(200).json({ updatedBoard: updatedBoard });
      }
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - reorder board columns by board id
exports.updateColumnOrder = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { newColumnOrder } = req.body;

    if(boardId && newColumnOrder) {
      const board = await Board.findOneAndUpdate({ _id: boardId }, 
      { columnInfo: newColumnOrder });

      const updatedBoard = await Board.findOne({ _id: boardId}).populate('columnInfo');
  
      res.status(200).json({ 
        updatedBoard: updatedBoard,
      })
    } else {
      return res.status(500).json({message: err.message});
    }
  } catch (error) {
    return res.status(400).json({message:'required parameters missing'});
  }
}

// DELETE - delete a board by id
exports.deleteOneBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { columnId } = req.query;

    const board = await Board.findOne({ _id: boardId });

    if (!board) {
      return res.status(404).json({ message: 'board with given id was not found' });
    } else {
      if (columnId) {
        const removedBoard = await Board.findByIdAndDelete({_id: boardId})
        const deletedColumns = await Column.deleteMany({ boardId: boardId });
        const deletedCards = await Card.deleteMany({ columnId: columnId });
        
      } else {
        const removedBoard = await Board.findByIdAndDelete({_id: boardId})
        const deletedColumns = await Column.deleteMany({ boardId: boardId });
        
      }
      return res.status(200).json({ message: "board deleted" })
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}