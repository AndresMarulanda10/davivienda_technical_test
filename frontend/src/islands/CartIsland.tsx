import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  Button,
  Card,
  CardBody,
  Image,
  Divider,
  addToast,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { apiFetch } from '@lib/api';
import {
  $cartItems,
  $cartTotal,
  $cartCount,
  setCartItems,
  type CartItem,
} from '@stores/cart.store';
import Providers from '@components/Providers';
import type { CartResponse } from '@/types';

function mapCartItems(response: CartResponse): CartItem[] {
  return response.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: parseFloat(item.price),
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    stock: 0,
  }));
}

function CartIslandInner() {
  const items = useStore($cartItems);
  const total = useStore($cartTotal);
  const count = useStore($cartCount);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchCart() {
      try {
        const cart = await apiFetch<CartResponse>('/cart');
        setCartItems(mapCartItems(cart));
      } catch {
        // Cart may be empty
      } finally {
        setFetching(false);
      }
    }
    fetchCart();
  }, []);

  async function handleUpdateQuantity(productId: string, quantity: number) {
    setLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const cart = await apiFetch<CartResponse>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      setCartItems(mapCartItems(cart));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      addToast({ title: 'Error', description: message, color: 'danger' });
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }

  async function handleRemove(productId: string) {
    setLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const cart = await apiFetch<CartResponse>(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
      setCartItems(mapCartItems(cart));
      addToast({ title: 'Removed', description: 'Item removed from cart', color: 'success' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Remove failed';
      addToast({ title: 'Error', description: message, color: 'danger' });
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <Icon icon="solar:spinner-line-duotone" className="animate-spin text-primary" width={32} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Icon icon="solar:cart-large-minimalistic-bold" className="text-default-300" width={64} />
        <h2 className="text-xl font-semibold text-default-500">Your cart is empty</h2>
        <Button as="a" href="/" color="primary" variant="flat">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.productId} shadow="sm">
            <CardBody className="flex flex-row gap-4 p-4">
              <Image
                src={item.imageUrl || '/placeholder.png'}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-cover"
                fallbackSrc="https://via.placeholder.com/96"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-default-500">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-divider">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      isDisabled={item.quantity <= 1 || loading[item.productId]}
                      onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Icon icon="solar:minus-circle-bold" width={18} />
                    </Button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      isDisabled={loading[item.productId]}
                      onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Icon icon="solar:add-circle-bold" width={18} />
                    </Button>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    isDisabled={loading[item.productId]}
                    onPress={() => handleRemove(item.productId)}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" width={18} />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div>
        <Card shadow="sm">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-default-500">Items ({count})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Shipping</span>
                <span className="text-success">Free</span>
              </div>
            </div>
            <Divider className="my-4" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              as="a"
              href="/checkout"
              color="primary"
              fullWidth
              className="mt-4"
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function CartIsland() {
  return (
    <Providers>
      <CartIslandInner />
    </Providers>
  );
}
