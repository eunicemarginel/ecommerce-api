const express = require("express");
const productController = require("../controllers/product");
const auth = require("../auth");
const router = express.Router();
const {verify, verifyAdmin} = auth;

router.post("/", verify, verifyAdmin, productController.addProduct); 

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/", productController.getAllActive);

router.get("/:productId", productController.getProduct);

router.patch("/:productId", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post('/search', productController.searchProductByName);


module.exports = router;