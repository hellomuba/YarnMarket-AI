'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

interface SimpleProductFormProps {
  formData: any
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitting: boolean
}

export default function SimpleProductForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitting
}: SimpleProductFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Simple Product</CardTitle>
        <CardDescription>
          Single product with one price and stock level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
                placeholder="e.g., Cotton T-Shirt"
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
                placeholder="e.g., Nike"
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

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="base_price" className="text-sm font-medium">
                Price *
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

            {/* EAN / Barcode */}
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
                Image URL
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Detailed product description..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={submitting}>
              <Upload className="h-4 w-4" />
              {submitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
