const Product = require("../models/product");

exports.getProducts = (req, res) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res) => {

  console.log(req.session);
  Product.find().then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

const stripe = require("stripe")(process.env.STRIPE_KEY);
exports.getCheckout = (req, res, next) => {
  let products;
  let sum;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      sum = 0;
      products.forEach((p) => {
        sum += p.quantity * p.productId.price;
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        Total: sum,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};
