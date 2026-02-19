import { useState } from 'react';
import { Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { apiFetch } from '@lib/api';
import { $isAuthenticated } from '@stores/auth.store';
import { setCartItems, type CartItem } from '@stores/cart.store';
import Providers from '@components/Providers';
import type { CartResponse } from '@/types';

interface Props {
  productId: string;
  stock: number;
}

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

function AddToCartInner({ productId, stock }: Props) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isAuth = $isAuthenticated.get();

  async function handleAdd() {
    if (!isAuth) {
      window.location.href = '/auth/login';
      return;
    }

    setLoading(true);
    try {
      const cart = await apiFetch<CartResponse>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      setCartItems(mapCartItems(cart));
      addToast({
        title: 'Added to cart',
        description: `${quantity} item(s) added successfully`,
        color: 'success',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      addToast({
        title: 'Error',
        description: message,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  const outOfStock = stock <= 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-divider">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          isDisabled={quantity <= 1}
        >
          <Icon icon="solar:minus-circle-bold" width={20} />
        </Button>
        <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => setQuantity(Math.min(stock, quantity + 1))}
          isDisabled={quantity >= stock}
        >
          <Icon icon="solar:add-circle-bold" width={20} />
        </Button>
      </div>

      <Button
        color="primary"
        size="lg"
        isLoading={loading}
        onPress={handleAdd}
        isDisabled={outOfStock}
        startContent={!loading && <Icon icon="solar:cart-plus-bold" width={22} />}
        className="flex-1"
      >
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
}

export default function AddToCartButton(props: Props) {
  return (
    <Providers>
      <AddToCartInner {...props} />
    </Providers>
  );
}
