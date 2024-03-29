const Product = require("../models/product");
// const file = require("../util/fileDelete");

exports.getAddProduct = (req, res) => {
  const error = req.flash("error");
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    error: error,
    isAdmin: req.session.isAdmin === "True" ? true : false,
  });
};

exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const image = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: image,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;
  const error = req.flash("error");
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        error: error,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.body.imageUrl;
  const updatedDesc = req.body.description;
  console.log(req.body);
  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImage;
      return product.save();
    })
    .then((result) => {
      //console.log("UPDATED PRODUCT!")
      res.redirect("/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res) => {
  console.log(req.user._id);
  isAdmin = req.session.isAdmin === "True" ? true : false;
  console.log(isAdmin);
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin === "True" ? true : false,
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;

  Product.findByIdAndRemove(prodId)
    .then(() => {
      //console.log("DESTROYED PRODUCT");
      res.redirect("/products");
    })
    .catch((err) => console.log(err));
};