import { useStore } from '@nanostores/react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Link,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import {
  $accessToken,
  $currentUser,
  $isAdmin,
  clearAuth,
} from '@stores/auth.store';
import { clearCart } from '@stores/cart.store';
import CartCounter from './CartCounter';
import Providers from '@components/Providers';

export default function NavbarIsland() {
  const user = useStore($currentUser);
  const isAdmin = useStore($isAdmin);

  async function handleLogout() {
    try {
      const token = $accessToken.get();
      await fetch(
        `${import.meta.env.PUBLIC_BACKEND_URL ?? 'http://localhost:4000'}/api/auth/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
    } catch {
      // Logout best-effort
    }
    clearAuth();
    clearCart();
    window.location.href = '/';
  }

  return (
    <Providers>
      <Navbar maxWidth="xl" isBordered>
        <NavbarBrand>
          <Link href="/" className="font-bold text-inherit gap-2 flex items-center">
            <Icon icon="solar:shop-2-bold" width={28} className="text-primary" />
            <span className="text-lg">Davivienda Store</span>
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/" color="foreground">
              Products
            </Link>
          </NavbarItem>
          {user && (
            <NavbarItem>
              <Link href="/orders" color="foreground">
                Orders
              </Link>
            </NavbarItem>
          )}
          {isAdmin && (
            <NavbarItem>
              <Link href="/admin/products" color="foreground">
                Admin
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarContent justify="end">
          {user && (
            <NavbarItem>
              <CartCounter />
            </NavbarItem>
          )}
          <NavbarItem>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-default-500 hidden sm:inline">
                  {user.firstName}
                </span>
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={handleLogout}
                  startContent={<Icon icon="solar:logout-2-bold" width={18} />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  as="a"
                  href="/auth/login"
                  size="sm"
                  variant="flat"
                  color="primary"
                >
                  Login
                </Button>
                <Button
                  as="a"
                  href="/auth/register"
                  size="sm"
                  variant="bordered"
                  color="primary"
                >
                  Register
                </Button>
              </div>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </Providers>
  );
}
