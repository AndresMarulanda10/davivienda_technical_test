import { atom, computed } from 'nanostores';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

export const $cartItems = atom<CartItem[]>([]);

export const $cartCount = computed($cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);

export const $cartTotal = computed($cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

export function setCartItems(items: CartItem[]) {
  $cartItems.set(items);
}

export function clearCart() {
  $cartItems.set([]);
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const items = $cartItems.get();
  $cartItems.set(
    items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    ),
  );
}

export function removeCartItem(productId: string) {
  const items = $cartItems.get();
  $cartItems.set(items.filter((item) => item.productId !== productId));
}
