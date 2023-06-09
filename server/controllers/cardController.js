const Card = require('./../models/cardModel');
const Column = require('./../models/columnModel');

// POST - get all cards
exports.getAllCards = async (req, res) => {
  try {
    const { columnId } = req.params;

    const column = await Column.findOne({ _id: columnId })

    if (!column) {
      return res
        .status(404)
        .json({ message: 'column with given id was not found' });
    }

    const cards = await Card.find({ columnId })
    
    return res
      .status(200)
      .json({ cards });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET - get one card by id
exports.getOneCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findOne({ _id: cardId });

    if (!card) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {
      return res.status(200).json({ card });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST - create a card
exports.createCard = async (req, res) => {
  try {
    const { title, text, columnId } = req.body;

    const newCard = await Card.create({
      title,
      text,
      columnId,
      label: null,
      labelColor: null,
      description: null,
    });

    const column = await Column.findById(columnId);

    if (!column) {
      return res
        .status(404)
        .json({ message: "column with given id was not found" });
    } else {
      
      const newCardInfo = Array.from(column.cardInfo);
      newCardInfo.push(newCard._id);
      column.set({ cardInfo: newCardInfo });
      const columnResult = await column.save();

      return res.status(201).json({
        newCard
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH - change card title
exports.changeCardTitle = async (req, res) => {
  try {
    const { cardId } = req.params;

    const updatedCard = await Card.findOneAndUpdate({ _id: cardId }, { title: req.body.title }, { new: true })

    if (!updatedCard) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {
      return res.status(200).json({ updatedCard });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change card text
exports.changeCardText = async (req, res) => {
  try {
    const { cardId } = req.params;

    const updatedCard = await Card.findOneAndUpdate({ _id: cardId }, { text: req.body.text }, { new: true })

    if (!updatedCard) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {
      return res.status(200).json({ updatedCard });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change card label
exports.changeCardLabel = async (req, res) => {
  try {
    const { cardId } = req.params;

    const updatedCard = await Card.findOneAndUpdate({ _id: cardId }, { label: req.body.label, labelColor: req.body.labelColor }, { new: true })

    if (!updatedCard) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {
      return res.status(200).json({ updatedCard });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change card title
exports.changeCardDescription = async (req, res) => {
  try {
    const { cardId } = req.params;

    const updatedCard = await Card.findOneAndUpdate({ _id: cardId }, { description: req.body.description }, { new: true })

    if (!updatedCard) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {
      return res.status(200).json({ updatedCard });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - change card comments
exports.addCardComment = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text } = req.body;

    const card = await Card.findOne({ _id: cardId })

    if (!card) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {

      const updatedCardComment = Array.from(card.comments);
      updatedCardComment.push({
        text: text,
        createdAt: new Date().toISOString(),
      });

      card.set({ comments: updatedCardComment });
      const cardResult = await card.save();

      const updatedCard = await Card.findById({ _id: cardId });

      return res.status(200).json({ updatedCard });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - reorder cards in the same column
exports.reorderSameColumn = async (req, res) => {
  try {
    const { sameColumnId, sameColumnCardIds } = req.body;
  
    const column = await Column.findOne({ _id: sameColumnId });
    if (!column) {
      return res
        .status(404)
        .json({ message: 'column with given id was not found' });
    }
  
    column.set({ cardInfo: sameColumnCardIds, cardInfo: sameColumnCardIds });
    const savedColumn = await column.save();
    const updatedColumn = await Column.findOne({_id :sameColumnId}).populate('cardInfo');

    return res
      .status(200)
      .json({ message: 'column reorder successful', updatedColumn });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH - reorder cards in a different column
exports.reorderDifferentColumn = async (req, res) => {
  try {
    const {
      removedColumnId,
      addedColumnId,
      removedColumnCardIds,
      addedColumnCardIds,
    } = req.body;

    if (!removedColumnId || !addedColumnId || !removedColumnCardIds || !addedColumnCardIds) {
      return res.status(400).json({ message: 'fields are missing' });
    }

    const addedColumn = await Column.findOne({ _id: addedColumnId });
    const removedColumn = await Column.findOne({ _id: removedColumnId });

    if (!addedColumn || !removedColumn) {
      return res.status(400).json({ message: 'one of the columns with given id was not found' });
    } else {
      addedColumn.set({ cardInfo: addedColumnCardIds})
      removedColumn.set({ cardInfo: removedColumnCardIds })

      const savedAddedColumn = await addedColumn.save();
      const savedRemovedColumn = await removedColumn.save()
      
      const updatedAddedColumn = await Column.findOne({ _id: addedColumnId }).populate('cardInfo');
      
      const updatedRemovedColumn = await Column.findOne({ _id: removedColumnId }).populate('cardInfo');
  
      return res
        .status(200)
        .json({ message: 'column reorder successful', updatedRemovedColumn, updatedAddedColumn });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// DELETE - delete one card by id
exports.deleteOneCard = async (req, res) => {
  try {
    const { cardId, columnId } = req.params;

    const card = await Card.findOneAndDelete({ _id: cardId });
    const column = await Column.findOne({_id: columnId});

    column.set({cardInfo: column.cardInfo.filter((card) => {
      return card !== cardId;
    })});

    if (!card) {
      return res
        .status(404)
        .json({ message: 'card with given id was not found' });
    } else {
      return res.status(200).json({ message: "card deleted" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};