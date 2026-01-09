import express from "express"
import cors from "cors"
import connectDB from "../backend/config/db.js"

import authRoutes from "../backend/routes/auth.js"
import productRoutes from "../backend/routes/products.js"
import reviewRoutes from "../backend/routes/reviews.js"
import adminRoutes from "../backend/routes/admin.js"

connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/admin", adminRoutes)

export default app
