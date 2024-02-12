const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();
const auth = require("../middlewares/isAuthenticated");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", auth, shopController.getCart);

router.post("/cart", auth, shopController.postCart);

router.post("/cart-delete-item", auth, shopController.postCartDeleteProduct);

router.get("/checkout", shopController.getCheckout);

module.exports = router;
