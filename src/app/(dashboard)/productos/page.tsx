'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductTable, type ProductWithDepts } from '@/components/products/ProductTable'
import { ProductForm } from '@/components/products/ProductForm'

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductWithDepts[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [departmentCode, setDepartmentCode] = useState('all')
  const [editingProduct, setEditingProduct] = useState<ProductWithDepts | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (departmentCode !== 'all') params.set('departmentCode', departmentCode)

      const res = await fetch(`/api/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } finally {
      setLoading(false)
    }
  }, [category, departmentCode])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function handleToggleActive(product: ProductWithDepts) {
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive }),
    })
    fetchProducts()
  }

  function handleEdit(product: ProductWithDepts) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleNew() {
    setEditingProduct(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona los ítems monitoreados
          </p>
        </div>
        <Button onClick={handleNew}>+ Nuevo producto</Button>
      </div>

      <ProductFilters
        category={category}
        departmentCode={departmentCode}
        onCategoryChange={(v) => setCategory(v ?? 'all')}
        onDepartmentChange={(v) => setDepartmentCode(v ?? 'all')}
      />

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Cargando productos...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />
      )}

      <ProductForm
        open={showForm}
        product={editingProduct}
        departmentOptions={[]}
        onClose={() => setShowForm(false)}
        onSaved={fetchProducts}
      />
    </div>
  )
}
