const express = require("express");
const router = express.Router();
const Imageup = require("../models/Image")

//cloudinsry
const cloudinary = require("cloudinary");
require('dotenv').config()
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});







// const multer = require("multer")
// const fs = require('fs');
// const { promisify } = require('util') // used to delete img in folder
// const unlinkAsync = promisify(fs.unlink)// used to delete img in folder
// const path = require('path');
var fetchuser = require("../Middleware/fetchuser");


// var storage = multer.diskStorage({
//     destination:  (req, file, cb) => {
//         cb(null, 'uploads') // upload folder m save ho gayegi
//     },
//     filename: (req, file, cb) => {
//         cb(null,  Date.now()+path.extname(file.originalname))
//     }
// });

// const fileFilter=(req,file,cb)=>{
//     const allowedFileTypes = ['image/jpeg','image/png','image/jpg']
//     if (allowedFileTypes.includes(file.mimetype)) {
//         cb(null,true)
//     }else{
//         cb(null,false)
//     }
// }
 
// var upload = multer({ storage , fileFilter });


// router.post('/img',fetchuser,upload.single('photo'),  async (req, res) => { 

router.post('/img',fetchuser,  async (req, res) => { 

  
  //  console.log(req.files.photo)
    const img = req.files.photo;
    delete img.data
    delete img.mv
   
     

    const upload = cloudinary.uploader.upload(img.tempFilePath, {public_id: img.name})

    upload.then((data) => {
      let url = data.secure_url
      Imageup.create({
            user: req.user.id,
            img:url

        }).then(
          res.json({message:"Added Successfully"})
        )
     
    }).catch((err) => {
      res.json({message:err.message})
    });
  

    }
    );
  
      

            
        

// get all images

router.get("/allimg", fetchuser, async (req, res) => {
    try {
      user = req.user;
      const alls = await Imageup.find({ user: user.id });
      res.send(alls);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });


  //delete img
  router.delete("/delete/:id", fetchuser, async (req, res) => {
    try {
      const find = await Imageup.findById(req.params.id);
      if (!find) {
        return res.status(404).json("Not Found");
      }
  
      if (find.user.toString() !== req.user.id) {
        res.status(401).json("Not Allowed");
      }
    
     

      const note = await Imageup.findByIdAndDelete(req.params.id);

      //for extract name of image
      let a = find.img.slice(62,82)
     

     
      
      cloudinary.uploader.destroy(a, function(result) {
        res.json("Delete Successfully");
         });
      
     
      
    } catch (error) {
      console.error(error.message);
      res.json("Internal Server Occura");
    }
  });


module.exports = router;