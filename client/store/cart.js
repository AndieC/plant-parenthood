import axios from 'axios'

// Action Type
const ADD_PRODUCT = 'ADD_PRODUCT'
const GET_CART = 'GET_CART'

// Action Creator
const addedProduct = product => ({
  type: ADD_PRODUCT,
  product
})

const fetchCart = activeOrder => ({
  type: GET_CART,
  activeOrder
})

// Thunk
export const addProduct = (orderId, productId) => async dispatch => {
  try {
    const product = await axios.put(
      `/api/cart/addproduct/${orderId}/${productId}`
    )
    dispatch(addedProduct(product.data))
  } catch (error) {
    console.error(error)
  }
}

export const findOrCreateCart = userId => async dispatch => {
  try {
    const activeOrder = await axios.get(`/api/cart/${userId}`)
    dispatch(fetchCart(activeOrder.data))
  } catch (error) {
    console.error(error)
  }
}

// Initial State
let initialState = []

// Reducer
const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_PRODUCT:
      return [...action.product]
    default:
      return state
  }
}

export default cartReducer
