import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICharity extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  phone: string;
  website?: string;
  description: string;
  mission: string;
  vision: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  logo?: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  documents?: {
    registrationCertificate: string;
    taxExemptionCertificate?: string;
    auditReport?: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
  };
  goals: {
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: Date;
    isActive: boolean;
  }[];
  impactReports: mongoose.Types.ObjectId[];
  totalReceived: number;
  donorCount: number;
  rating: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const CharitySchema = new Schema<ICharity>(
  {
    name: {
      type: String,
      required: [true, "Charity name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid website URL"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    mission: {
      type: String,
      required: [true, "Mission statement is required"],
      maxlength: [500, "Mission cannot exceed 500 characters"],
    },
    vision: {
      type: String,
      required: [true, "Vision statement is required"],
      maxlength: [500, "Vision cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Education",
        "Healthcare",
        "Environment",
        "Poverty",
        "Animal Welfare",
        "Disaster Relief",
        "Human Rights",
        "Arts & Culture",
        "Sports",
        "Other",
      ],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    logo: String,
    images: {
      type: [String],
      default: [
        "https://picsum.photos/seed/1/600/400",
        "https://picsum.photos/seed/2/600/400",
        "https://picsum.photos/seed/3/600/400",
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    documents: {
      registrationCertificate: {
        type: String,
        required: false,
      },
      taxExemptionCertificate: String,
      auditReport: String,
    },
    bankDetails: {
      accountName: {
        type: String,
        required: [true, "Account name is required"],
      },
      accountNumber: {
        type: String,
        required: [true, "Account number is required"],
      },
      bankName: {
        type: String,
        required: [true, "Bank name is required"],
      },
      ifscCode: {
        type: String,
        required: [true, "IFSC code is required"],
      },
      branch: {
        type: String,
        required: [true, "Branch is required"],
      },
    },
    goals: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        targetAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        currentAmount: {
          type: Number,
          default: 0,
          min: 0,
        },
        deadline: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    impactReports: [
      {
        type: Schema.Types.ObjectId,
        ref: "ImpactReport",
      },
    ],
    totalReceived: {
      type: Number,
      default: 0,
    },
    donorCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
CharitySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
CharitySchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update rating when reviews change
CharitySchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.rating = totalRating / this.reviews.length;
  }
  next();
});

export default mongoose.models.Charity ||
  mongoose.model<ICharity>("Charity", CharitySchema);
