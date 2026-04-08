const { Schema, model } = require("mongoose");

const tableSchema = new Schema(
  {
    tableNo: {
      type: Number,
      required: true,
    },
    tableEngage: {
      type: Boolean,
      default: false, // True when occupied
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      default: null, // Link to active session
    },
  },
  { timestamps: true }
);

const Table = new model("Table", tableSchema);

module.exports = Table;
