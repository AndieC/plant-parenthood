const router = require('express').Router()
const {Product, Order, User, Order_Product} = require('../db/models')
module.exports = router

//Find or create a user's active order
//GET api/cart/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const activeOrder = await Order.findOrCreate({
      where: {
        userId: req.params.userId,
        status: 'in_cart'
      }
    })

    let products = await activeOrder[0].getProducts()

    res.send({orderId: activeOrder[0].dataValues.id, products}).status(200)
  } catch (error) {
    next(error)
  }
})

//POST api/cart/:orderId/:productId
router.post('/:orderId/:productId', async (req, res, next) => {
  try {
    const activeOrder = await Order.findByPk(req.params.orderId)
    const product = await Product.findByPk(req.params.productId)

    const throughTable = await Order_Product.findOne({
      where: {
        orderId: req.params.orderId,
        productId: req.params.productId
      }
    })

    if (throughTable) {
      throughTable.increment('quantity')
    } else {
      await activeOrder.addProduct(product)
    }

    let products = await activeOrder.getProducts()

    res.status(200).send({orderId: req.params.orderId, products})
  } catch (error) {
    next(error)
  }
})

//DELETE api/cart/:orderId/:productId
router.delete('/:orderId/:productId', async (req, res, next) => {
  try {
    const activeOrder = await Order.findByPk(req.params.orderId)
    const product = await Product.findByPk(req.params.productId)

    await activeOrder.removeProduct(product)

    let updatedProducts = await activeOrder.getProducts()

    res.status(200).send({orderId: req.params.orderId, updatedProducts})
  } catch (error) {
    next(error)
  }
})

//PUT api/cart/product/:orderId/:productId
router.put('/product/:orderId/:productId', async (req, res, next) => {
  try {
    const activeOrder = await Order.findByPk(req.params.orderId)

    const productInCart = await Order_Product.findOne({
      where: {
        orderId: req.params.orderId,
        productId: req.params.productId
      }
    })

    if (productInCart.quantity > 1) {
      productInCart.decrement('quantity')
    }

    let products = await activeOrder.getProducts()

    res.status(200).send({orderId: req.params.orderId, products})
  } catch (error) {
    next(error)
  }
})

//PUT /api/cart/:orderId
router.put('/:orderId', async (req, res, next) => {
  try {
    const activeOrder = await Order.findByPk(req.params.orderId)
    let products = await activeOrder.getProducts()
    for (let i = 0; i < products.length; i++) {
      let product = await Product.findByPk(products[i].id)
      product.inventory--
      product.save()
    }
    res.send(await activeOrder.update({status: 'completed'}))
  } catch (error) {
    next(error)
  }
})
