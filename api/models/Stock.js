const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['nourriture', 'eau', 'medical', 'munitions', 'energie', 'outils', 'autre'],
      default: 'autre'
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

stockSchema.virtual('survivalIndex').get(function () {
  const priorityWeight = { low: 1, medium: 2, high: 3, critical: 5 };
  const weight = priorityWeight[this.priority] || 1;
  return this.quantity * weight;
});

stockSchema.set('toJSON', { virtuals: true });
stockSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Stock', stockSchema);