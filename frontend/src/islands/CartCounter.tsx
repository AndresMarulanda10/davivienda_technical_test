import { useStore } from '@nanostores/react';
import { Badge } from '@heroui/react';
import { Icon } from '@iconify/react';
import { $cartCount } from '@stores/cart.store';

export default function CartCounter() {
  const count = useStore($cartCount);

  return (
    <a href="/cart" className="relative">
      <Badge
        content={count}
        color="danger"
        size="sm"
        isInvisible={count === 0}
        shape="circle"
      >
        <Icon
          icon="solar:cart-large-2-bold"
          className="text-default-600"
          width={24}
        />
      </Badge>
    </a>
  );
}
