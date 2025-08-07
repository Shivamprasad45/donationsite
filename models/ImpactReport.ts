import mongoose, { Document, Schema } from 'mongoose'

export interface IImpactReport extends Document {
  _id: string
  charity: mongoose.Types.ObjectId
  title: string
  description: string
  reportPeriod: {
    startDate: Date
    endDate: Date
  }
  totalFundsReceived: number
  totalFundsUtilized: number
  beneficiariesReached: number
  projects: {
    name: string
    description: string
    fundsAllocated: number
    fundsUtilized: number
    status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
    beneficiaries: number
    images: string[]
    outcomes: string[]
  }[]
  financialBreakdown: {
    category: string
    amount: number
    percentage: number
    description?: string
  }[]
  images: string[]
  documents: string[]
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ImpactReportSchema = new Schema<IImpactReport>({
  charity: {
    type: Schema.Types.ObjectId,
    ref: 'Charity',
    required: [true, 'Charity is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  reportPeriod: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    }
  },
  totalFundsReceived: {
    type: Number,
    required: [true, 'Total funds received is required'],
    min: 0
  },
  totalFundsUtilized: {
    type: Number,
    required: [true, 'Total funds utilized is required'],
    min: 0
  },
  beneficiariesReached: {
    type: Number,
    required: [true, 'Beneficiaries reached is required'],
    min: 0
  },
  projects: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    fundsAllocated: {
      type: Number,
      required: true,
      min: 0
    },
    fundsUtilized: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      required: true
    },
    beneficiaries: {
      type: Number,
      required: true,
      min: 0
    },
    images: [String],
    outcomes: [String]
  }],
  financialBreakdown: [{
    category: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: String
  }],
  images: [String],
  documents: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date
}, {
  timestamps: true
})

// Set published date when publishing
ImpactReportSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

export default mongoose.models.ImpactReport || mongoose.model<IImpactReport>('ImpactReport', ImpactReportSchema)
