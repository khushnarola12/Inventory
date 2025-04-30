const express = require('express');
const { createProduct, getProducts, getProduct, deleteProduct ,updateProduct} = require('../controllers/productController');
const protect = require("../MiddleWare/authMiddleware");
const { upload } = require('../utils/fileUpload');
const cloudinary=require("cloudinary").v2
const router = express.Router(); 
require('dotenv').config();


router.post("/",protect,upload.single("image"),createProduct)
router.patch("/:id",protect,upload.single("image"),updateProduct)
router.get("/",protect,getProducts)
router.get("/:id",protect,getProduct)
router.delete("/:id",protect,deleteProduct)

module.exports = router 