const asyncHandler = require('express-async-handler');
const Product = require("../models/productModel");
const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require("cloudinary").v2;
require('dotenv').config(); 

 // Adjust path if needed
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  

const createProduct = asyncHandler(async(req,res)=>{
    const {name,sku,category,quantity,price,description,image} = req.body

    //validation
    if(!name || !category || !price || !description){
        console.log({ name, category, quantity, price, description });
        
        res.status(400)
        throw new Error("Please fill in all fields")
    }

    //create Product
    const product = await Product.create({
        user : req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image
    })

    res.status(201).json(product)
})

//get All PRODUCTS

const getProducts = asyncHandler(async(req,res)=>{
    const products = await Product.find({user:req.user.id}).sort("-createdAt")
    res.status(200).json(products)
}) 

//get single Product
const getProduct = asyncHandler(async(req,res)=>{
   const product = await Product.findById(req.params.id)
   
   //product does not exist
   if(!product){
    res.status(404)
    throw new Error("Product not found")
   }

   //user not exist
   if(product.user.toString()!== req.user.id){
    res.status(401)
    throw new Error("User not authorized")
   }

   res.status(200).json(product)
})

const deleteProduct = asyncHandler(async(req,res)=>{
  const product = await Product.findById(req.params.id)
  
  //product does not exist
  if(!product){
   res.status(404)
   throw new Error("Product not found")
  }

  //user not exist
  if(product.user.toString()!== req.user.id){
   res.status(401)
   throw new Error("User not authorized")
  }

  await product.deleteOne()

  res.status(200).json({
    message : "product deleted "
  })
})

// update Products

const updateProduct = asyncHandler(async(req,res)=>{
  const {name,sku,category,quantity,price,description,image} = req.body

  const {id} = req.params
  const product = await Product.findById(id)

  //product not found
  if(!product){
    res.status(404)
    throw new Error("Product not found")
   }

   //match product to user
   if(product.user.toString()!== req.user.id){
    res.status(401)
    throw new Error("User not authorized")
   }

  
  //update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    {_id:id},
    {
      name,
      category,
      quantity,
      price,
      description,
      image : image|| product.image
    },
    {
      new : true,
      runValidators : true
    }
  )

  res.status(201).json(updatedProduct) 
})

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct
}