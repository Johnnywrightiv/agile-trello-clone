const mongoose = require( "mongoose");
const Schema = mongoose.Schema;

const boardSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  title: { 
    type: String, 
    required: true, 
  },
  category: {
    type: String
  },
  columnInfo: [
    { 
    type: String, 
    ref: 'Columns',
    }
  ],
},  {timestamps: true});

module.exports = mongoose.model('Boards', boardSchema);
