const mongoose = require('mongoose');

const crewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['medecin', 'ingenieur', 'soldat', 'cuisinier', 'scientifique', 'eclaireur', 'autre'],
      default: 'autre'
    },
    skillLevel: { type: Number, min: 1, max: 10, default: 5 },
    state: {
      type: String,
      enum: ['ok', 'injured', 'missing'],
      default: 'ok'
    }
  },
  { timestamps: true }
);

crewSchema.virtual('survivalProbability').get(function () {
  const stateMultiplier = { ok: 1, injured: 0.6, missing: 0.2 };
  const multiplier = stateMultiplier[this.state] ?? 0.5;
  return Math.round(this.skillLevel * 10 * multiplier);
});

crewSchema.set('toJSON', { virtuals: true });
crewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Crew', crewSchema);