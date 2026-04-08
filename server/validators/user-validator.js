const { z } = require("zod");

// Update user profile schema
const updateProfileSchema = z.object({
  name: z
    .string({ required_error: "Name is Required" })
    .trim()
    .min(3, { message: "Name Must be at least of 3 characters." })
    .max(255, { message: "Name Must not be more than 255 characters." })
    .optional(),
  phone: z
    .string({ required_error: "Phone number is Required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters" })
    .max(20, { message: "Phone number Must not be more than 20 characters." })
    .optional(),
});

// Order history query parameters schema
const orderHistoryQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, { message: "Page must be greater than 0" })
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, { 
      message: "Limit must be between 1 and 100" 
    })
    .optional()
    .default("10"),
  status: z
    .enum(["Not Process", "Processing", "Delivered", "Cancelled"])
    .optional(),
});

// Session ID parameter schema
const sessionIdSchema = z.object({
  sessionId: z
    .string()
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid session ID format"
    }),
});

module.exports = {
  updateProfileSchema,
  orderHistoryQuerySchema,
  sessionIdSchema,
}; 