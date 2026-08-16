import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
  eventName: string;
  eventType: 'Movie' | 'Concert' | 'Sports' | 'College' | 'Other';
  date: string;
  venue: string;
  ticketNumber: string;
  imageUrl?: string;
  notes?: string;
  favorite: boolean;
  createdAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Movie', 'Concert', 'Sports', 'College', 'Other'],
      default: 'Other',
    },
    date: {
      type: String,
      required: [true, 'Event date and time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent mongoose OverwriteModelError during reload
export const TicketModel: Model<ITicket> =
  (mongoose.models.Ticket as Model<ITicket>) ||
  mongoose.model<ITicket>('Ticket', TicketSchema);
