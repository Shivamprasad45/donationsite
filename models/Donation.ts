import mongoose, { Document, Schema } from 'mongoose'

export interface IDonation extends Document {
  _id: string
  donor: mongoose.Types.ObjectId
  charity: mongoose.Types.ObjectId
  amount: number
  currency: string
  paymentMethod: 'stripe' | 'razorpay'
  paymentId: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  isAnonymous: boolean
  message?: string
  dedicatedTo?: string
  receiptUrl?: string
  receiptNumber: string
  taxDeductible: boolean
  refundReason?: string
  refundedAt?: Date
  metadata: {
    campaignId?: string
    source?: string
    utm?: {
      source?: string
      medium?: string
      campaign?: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

const DonationSchema = new Schema<IDonation>({
  donor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  charity: {
    type: Schema.Types.ObjectId,
    ref: 'Charity',
    required: [true, 'Charity is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['USD', 'INR', 'EUR', 'GBP'],
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['stripe', 'razorpay']
  },
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  dedicatedTo: {
    type: String,
    maxlength: [100, 'Dedication cannot exceed 100 characters']
  },
  receiptUrl: String,
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  taxDeductible: {
    type: Boolean,
    default: true
  },
  refundReason: String,
  refundedAt: Date,
  metadata: {
    campaignId: String,
    source: String,
    utm: {
      source: String,
      medium: String,
      campaign: String
    }
  }
}, {
  timestamps: true
})

// Generate receipt number before saving
DonationSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.receiptNumber = `RCP-${timestamp}-${random}`
  }
  next()
})

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema)
