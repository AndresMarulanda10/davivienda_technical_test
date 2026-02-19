import { useState } from 'react';
import { Input, Button, Link, Card, CardBody, CardHeader } from '@heroui/react';
import { Icon } from '@iconify/react';
import { apiFetch } from '@lib/api';
import { setAuth } from '@stores/auth.store';
import Providers from '@components/Providers';
import type { LoginResponse } from '@/types';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        auth: false,
      });

      setAuth(result.accessToken, result.user);
      window.location.href = '/';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Providers>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-default-500">Sign in to your account</p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                placeholder="you@example.com"
                isRequired
                startContent={<Icon icon="solar:letter-bold" className="text-default-400" width={20} />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onValueChange={setPassword}
                placeholder="Enter your password"
                isRequired
                startContent={<Icon icon="solar:lock-bold" className="text-default-400" width={20} />}
                endContent={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    <Icon
                      icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                      className="text-default-400"
                      width={20}
                    />
                  </button>
                }
              />

              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="mt-2"
                fullWidth
              >
                Sign In
              </Button>

              <p className="text-center text-sm text-default-500">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" size="sm">
                  Create one
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </Providers>
  );
}
