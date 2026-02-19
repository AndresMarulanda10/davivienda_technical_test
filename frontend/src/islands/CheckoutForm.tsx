import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  Button,
  Card,
  CardBody,
  Divider,
  Spinner,
  addToast,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { apiFetch } from '@lib/api';
import { $cartItems, $cartTotal, $cartCount, clearCart } from '@stores/cart.store';
import { setCartItems, type CartItem } from '@stores/cart.store';
import Providers from '@components/Providers';
import type { CartResponse, CheckoutResponse } from '@/types';

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

function CheckoutFormInner() {
  const items = useStore($cartItems);
  const total = useStore($cartTotal);
  const count = useStore($cartCount);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState<CheckoutResponse | null>(null);

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

  async function handleCheckout() {
    setLoading(true);
    try {
      const order = await apiFetch<CheckoutResponse>('/checkout', {
        method: 'POST',
      });
      setResult(order);
      clearCart();
      addToast({
        title: 'Order placed!',
        description: `Order #${order.id.slice(0, 8)} confirmed`,
        color: 'success',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      addToast({ title: 'Error', description: message, color: 'danger' });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="rounded-full bg-success-100 p-4">
          <Icon icon="solar:check-circle-bold" className="text-success" width={48} />
        </div>
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <Card shadow="sm" className="w-full max-w-md">
          <CardBody className="space-y-3 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Order ID</span>
              <span className="font-mono text-xs">{result.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Status</span>
              <span className="font-semibold text-success">{result.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Payment</span>
              <span>{result.paymentStatus}</span>
            </div>
            <Divider />
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Subtotal</span>
              <span>${parseFloat(result.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Discount</span>
              <span>-${parseFloat(result.discountAmount).toFixed(2)}</span>
            </div>
            <Divider />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${parseFloat(result.total).toFixed(2)}</span>
            </div>
          </CardBody>
        </Card>
        <div className="flex gap-3">
          <Button as="a" href={`/orders/${result.id}`} variant="flat" color="primary">
            View Order
          </Button>
          <Button as="a" href="/" variant="flat">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
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
      <div className="lg:col-span-2">
        <Card shadow="sm">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Review Items ({count})</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-default-500">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div>
        <Card shadow="sm">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-default-500">Subtotal</span>
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
              color="primary"
              fullWidth
              className="mt-4"
              size="lg"
              isLoading={loading}
              onPress={handleCheckout}
              startContent={!loading && <Icon icon="solar:card-bold" width={22} />}
            >
              Place Order
            </Button>
            <p className="mt-3 text-center text-xs text-default-400">
              Payment is processed via mock gateway
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutForm() {
  return (
    <Providers>
      <CheckoutFormInner />
    </Providers>
  );
}
