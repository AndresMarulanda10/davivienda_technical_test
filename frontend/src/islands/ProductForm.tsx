import { useState, useEffect } from 'react';
import {
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Switch,
  addToast,
} from '@heroui/react';
import { apiFetch } from '@lib/api';
import Providers from '@components/Providers';
import type { Product, Category } from '@/types';

interface Props {
  product?: Product;
  categories: Category[];
}

function ProductFormInner({ product, categories }: Props) {
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? parseFloat(product.price).toString() : '');
  const [stock, setStock] = useState(product?.stock?.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const body = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      imageUrl: imageUrl || undefined,
      categoryId,
      isActive,
    };

    try {
      if (isEdit) {
        await apiFetch(`/products/${product!.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        addToast({ title: 'Updated', description: 'Product updated successfully', color: 'success' });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        addToast({ title: 'Created', description: 'Product created successfully', color: 'success' });
        window.location.href = '/admin/products';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!product || !confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      await apiFetch(`/products/${product.id}`, { method: 'DELETE' });
      addToast({ title: 'Deleted', description: 'Product deleted', color: 'success' });
      window.location.href = '/admin/products';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">{error}</div>
      )}

      <Input
        label="Name"
        value={name}
        onValueChange={setName}
        isRequired
        placeholder="Product name"
      />

      <Textarea
        label="Description"
        value={description}
        onValueChange={setDescription}
        isRequired
        placeholder="Product description"
        minRows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          value={price}
          onValueChange={setPrice}
          isRequired
          placeholder="0.00"
          startContent={<span className="text-default-400 text-sm">$</span>}
          step="0.01"
          min="0"
        />
        <Input
          label="Stock"
          type="number"
          value={stock}
          onValueChange={setStock}
          isRequired
          placeholder="0"
          min="0"
        />
      </div>

      <Input
        label="Image URL"
        value={imageUrl}
        onValueChange={setImageUrl}
        placeholder="https://example.com/image.jpg"
      />

      <Select
        label="Category"
        placeholder="Select a category"
        selectedKeys={categoryId ? new Set([categoryId]) : new Set()}
        isRequired
        onSelectionChange={(keys) => {
          const selected = typeof keys === 'string' ? keys : [...keys][0];
          if (selected) setCategoryId(String(selected));
        }}
      >
        {categories.map((cat) => (
          <SelectItem key={cat.id}>{cat.name}</SelectItem>
        ))}
      </Select>

      <Switch isSelected={isActive} onValueChange={setIsActive}>
        Active
      </Switch>

      <div className="flex gap-3">
        <Button type="submit" color="primary" isLoading={loading}>
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
        {isEdit && (
          <Button color="danger" variant="flat" onPress={handleDelete} isDisabled={loading}>
            Delete
          </Button>
        )}
        <Button as="a" href="/admin/products" variant="flat">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ProductForm(props: Props) {
  return (
    <Providers>
      <ProductFormInner {...props} />
    </Providers>
  );
}
