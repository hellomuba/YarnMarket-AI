'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Plus, Trash2 } from 'lucide-react'

interface Variant {
  variant_name: string
  colour: string
  size: string
  price: string
  stock_quantity: string
  sku: string
}

interface AdvancedProductFormProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent, variants: Variant[]) => void
  onCancel: () => void
  submitting: boolean
}

export default function AdvancedProductForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitting
}: AdvancedProductFormProps) {
  const [variants, setVariants] = useState<Variant[]>([
    { variant_name: '', colour: '', size: '', price: '', stock_quantity: '', sku: '' }
  ])

  const addVariant = () => {
    setVariants([...variants, { variant_name: '', colour: '', size: '', price: '', stock_quantity: '', sku: '' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value

    // Auto-generate SKU if name, color, and size are filled
    if (field === 'variant_name' || field === 'colour' || field === 'size') {
      const variant = newVariants[index]
      if (variant.colour && variant.size) {
        const colorCode = variant.colour.substring(0, 3).toUpperCase()
        const sizeCode = variant.size.toUpperCase()
        newVariants[index].sku = `${formData.name ? formData.name.substring(0, 3).toUpperCase() : 'PRD'}-${colorCode}-${sizeCode}`
      }
    }

    setVariants(newVariants)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e, variants)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Advanced Product</CardTitle>
        <CardDescription>
          Product with multiple variants (colors, sizes, prices)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Designer Sneakers"
                />
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <label htmlFor="brand" className="text-sm font-medium">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., UrbanFit"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select category</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food & Groceries">Food & Groceries</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Books & Media">Books & Media</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Base Price */}
              <div className="space-y-2">
                <label htmlFor="base_price" className="text-sm font-medium">
                  Base Price * (Reference)
                </label>
                <input
                  id="base_price"
                  name="base_price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_price}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label htmlFor="currency" className="text-sm font-medium">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* EAN */}
              <div className="space-y-2">
                <label htmlFor="ean" className="text-sm font-medium">
                  EAN / Barcode
                </label>
                <input
                  id="ean"
                  name="ean"
                  type="text"
                  value={formData.ean}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="1234567890123"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="image_url" className="text-sm font-medium">
                  Product Image URL
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com/product.jpg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Product Variants</h3>
                <p className="text-sm text-muted-foreground">Add different sizes, colors, and prices</p>
              </div>
              <Badge variant="outline">{variants.length} variant{variants.length !== 1 ? 's' : ''}</Badge>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Variant Name *</label>
                      <input
                        type="text"
                        required
                        value={variant.variant_name}
                        onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                        placeholder="e.g., Red Sneakers - Size 42"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Color</label>
                      <input
                        type="text"
                        value={variant.colour}
                        onChange={(e) => updateVariant(index, 'colour', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                        placeholder="e.g., Red"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Size</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                        placeholder="e.g., 42"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Stock Quantity</label>
                      <input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">SKU (Auto-generated)</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg bg-muted"
                        placeholder="AUTO"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addVariant} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={submitting}>
              <Upload className="h-4 w-4" />
              {submitting ? 'Creating...' : 'Create Product with Variants'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
