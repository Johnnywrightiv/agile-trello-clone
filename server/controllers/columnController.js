const Board = require('./../models/boardModel');
const Column = require('./../models/columnModel');
const Card = require('./../models/cardModel');


// GET - get all columns of a specific board
exports.getAllColumns = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { sort } = req.query;
    const sortColumns = {}

    if (sort) {
      if (sort === 'newest') {
        sortColumns.createdAt = 'desc'
      } else if (sort === 'oldest') {
        sortColumns.createdAt = 'asc';
      } else if (sort === 'alphabetically') {
        sortColumns.title = 'asc';
      } else if (sort === 'reverse-alphabetically') {
        sortColumns.title = 'desc';
      }
    }

    const board = await Board.findOne({ _id: boardId })

    if (!board) {
      return res
        .status(404)
        .json({ message: 'board with given id was not found' });
    }

    const columns = await Column.find({ boardId: boardId }).populate('cardInfo').sort(sortColumns)
    
    return res
      .status(200)
      .json({ columns: columns });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET - get one column by id
exports.getOneColumn = async (req, res) => {
  try {
    const { columnId } = req.params;

    const column = await Column.findOne({ _id: columnId }).populate('cardInfo');

    if (!column) {
      return res
        .status(404)
        .json({ message: 'column with given id was not found' });
    } else {
      return res.status(200).json({ column: column });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST - create a new column
exports.createColumn = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    const newColumn = await Column.create({
      boardId: boardId,
      title,
      cardInfo: [],
    });

    const board = await Board.findById(boardId)

    if (!board) {
      res.status(404).json({ message: 'board with given id was not found' });
    } else {

      const newColumnInfo = Array.from(board.columnInfo);
      newColumnInfo.push(newColumn._id);
      board.set({ columnInfo: newColumnInfo });
      const boardResult = await board.save();

      return res.status(201).json({
        newColumn,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change column title
exports.changeColumnTitle = async (req, res) => {
  try {
    const { columnId } = req.params;

    const updatedColumn = await Column.findOneAndUpdate({ _id: columnId }, { title: req.body.title }, { new: true }).populate('cardInfo');

    if (!updatedColumn) {
      return res
        .status(404)
        .json({ message: 'column with given id was not found' });
    } else {
      return res.status(200).json({ updatedColumn: updatedColumn });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// DELETE - delete one card by id
exports.deleteOneColumn = async (req, res) => {
  try {
    const { columnId, boardId } = req.params;

    const column = await Column.findOneAndDelete({ _id: columnId });
    const cards = await Card.deleteMany({ columnId: columnId });
    const board = await Board.findOne({_id: boardId});

    board.set({columnInfo: board.columnInfo.filter((column) => {
      return column !== columnId;
    })});
    
    if (!column) {
      return res
        .status(404)
        .json({ message: 'column with given id was not found' });
    } else {
      return res.status(200).json({ message: "column deleted" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};