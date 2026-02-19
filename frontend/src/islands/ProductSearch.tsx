import { useState, useCallback } from 'react';
import { Input, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import Providers from '@components/Providers';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
}

function ProductSearchInner({ categories, initialSearch = '', initialCategory = '' }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const navigateWithParams = useCallback(
    (newSearch: string, newCategory: string) => {
      const params = new URLSearchParams();
      if (newSearch) params.set('search', newSearch);
      if (newCategory) params.set('categoryId', newCategory);
      params.set('page', '1');
      window.location.href = `/?${params.toString()}`;
    },
    [],
  );

  // Trigger navigation on Enter key for search
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      navigateWithParams(search, category);
    }
  }

  function handleCategoryChange(keys: Set<string> | string) {
    const value = typeof keys === 'string' ? keys : [...keys][0] ?? '';
    setCategory(value);
    navigateWithParams(search, value);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Input
        className="flex-1"
        placeholder="Search products..."
        value={search}
        onValueChange={setSearch}
        onKeyDown={handleKeyDown}
        startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={20} />}
        isClearable
        onClear={() => {
          setSearch('');
          navigateWithParams('', category);
        }}
      />
      <Select
        className="w-full sm:w-48"
        placeholder="All categories"
        selectedKeys={category ? new Set([category]) : new Set()}
        onSelectionChange={(keys) => handleCategoryChange(keys as Set<string>)}
      >
        {categories.map((cat) => (
          <SelectItem key={cat.id}>{cat.name}</SelectItem>
        ))}
      </Select>
    </div>
  );
}

export default function ProductSearch(props: Props) {
  return (
    <Providers>
      <ProductSearchInner {...props} />
    </Providers>
  );
}
