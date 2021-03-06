import { fromEvent } from 'graphcool-lib';

module.exports = event =>
  new Promise((resolve, reject) => {
    console.log(event);

    const { basketId, productId, quantity = 1 } = event.data;

    const graphcool = fromEvent(event);
    const api = graphcool.api('simple/v1');

    const checkBasketItemExists = (basketId, productId) => {
      return api.request(
        `
        query isItemInBasket($basketId:ID!, $productId:ID!) {
          allBasketItems(filter: {
            basket: {
              id: $basketId
            },
            orderedItem: {
              id: $productId
            }
          }) {
            id
            quantity
          }
        }
      `,
        {
          basketId,
          productId,
        },
      );
    };

    const createBasketItem = (basketId, productId, quantity) => {
      return api.request(
        `
        mutation createBasketItem($basketId: ID!, $productId: ID!, $quantity: Int) {
          BasketItem: createBasketItem(basketId: $basketId, orderedItemId: $productId, quantity: $quantity) {
      			id
            quantity
          }
        }
      `,
        {
          basketId,
          productId,
          quantity,
        },
      );
    };

    const updateBasketItemQuantity = (id, quantity) => {
      return api.request(
        `
        mutation updateBasketItem($id: ID!, $quantity: Int!) {
          BasketItem: updateBasketItem(id: $id, quantity: $quantity) {
            id
            quantity
          }
        }
      `,
        {
          id,
          quantity,
        },
      );
    };

    return checkBasketItemExists(basketId, productId)
      .then(({ allBasketItems }) => {
        // if (!allBasketItems) {
        return createBasketItem(basketId, productId, quantity);
        // } else {
        //   return updateBasketItemQuantity(
        //     allBasketItems[0].id,
        //     allBasketItems[0].quantity + quantity
        //   )
        // }
      })
      .then(data => {
        console.log(data);

        // const {BasketItem: {id, quantity}} = data

        const id = 'abc';
        const quantity = 1;

        resolve({
          data: {
            id,
            quantity,
          },
        });
      })
      .catch(error => resolve({ error: error.message }));
  });
