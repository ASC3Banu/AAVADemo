import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
  trackingNumber: string;
  status: string;
  origin: any;
  destination: any;
  carrier: any;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema({
  trackingNumber: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  origin: { type: Object, required: true },
  destination: { type: Object, required: true },
  carrier: { type: Object, required: true }
}, { timestamps: true });

export const Shipment = mongoose.model<IShipment>('Shipment', shipmentSchema);