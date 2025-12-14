'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Upload, Plus, Search, Download, FileUp } from 'lucide-react'

export default function ProductsPage() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'NGN',
    category: '',
    in_stock: true,
    stock_quantity: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API call to upload product
    console.log('Product data:', formData)
    alert('Product uploaded successfully!')
    setShowUploadForm(false)
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'NGN',
      category: '',
      in_stock: true,
      stock_quantity: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement CSV parsing and bulk upload to API
      console.log('Uploading file:', file.name)
      alert(`Processing ${file.name}... (Feature coming soon)`)
      setShowBulkUpload(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `name,description,price,currency,category,in_stock,stock_quantity
"Cotton Shirt","High quality cotton shirt, available in multiple colors",15000,NGN,clothing,true,50
"Jeans","Durable denim jeans, perfect fit",25000,NGN,clothing,true,30
"Smartphone","Latest Android smartphone with great camera",150000,NGN,electronics,true,15`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'product_upload_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(!showBulkUpload)} className="gap-2">
            <FileUp className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={() => setShowUploadForm(!showUploadForm)} className="gap-2">
            {showUploadForm ? 'Cancel' : <><Plus className="h-4 w-4" /> Add Product</>}
          </Button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Fill in the product details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., Cotton Shirt"
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
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select category</option>
                    <option value="clothing">Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="food">Food & Groceries</option>
                    <option value="beauty">Beauty & Personal Care</option>
                    <option value="home">Home & Living</option>
                    <option value="sports">Sports & Outdoors</option>
                    <option value="books">Books & Media</option>
                    <option value="toys">Toys & Games</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-2">
                  <label htmlFor="stock_quantity" className="text-sm font-medium">
                    Stock Quantity
                  </label>
                  <input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>

                {/* In Stock */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="in_stock"
                      name="in_stock"
                      type="checkbox"
                      checked={formData.in_stock}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring"
                    />
                    <label htmlFor="in_stock" className="text-sm">
                      In Stock
                    </label>
                  </div>
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
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Detailed product description..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload */}
      {showBulkUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload Products</CardTitle>
            <CardDescription>Upload multiple products at once using a CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your CSV file here or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                className="hidden"
                id="bulk-upload"
              />
              <label htmlFor="bulk-upload">
                <Button asChild variant="outline">
                  <span className="cursor-pointer">Choose File</span>
                </Button>
              </label>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>First row must be headers: name, description, price, currency, category, in_stock, stock_quantity</li>
                <li>All fields are required except stock_quantity</li>
                <li>in_stock should be true or false</li>
                <li>currency should be NGN, USD, EUR, or GBP</li>
                <li>Download the template above for a sample format</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                Cancel
              </Button>
              <Button onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>All your products</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample products */}
            {[
              { name: 'Cotton Shirt', category: 'clothing', price: 15000, currency: 'NGN', inStock: true, quantity: 50 },
              { name: 'Jeans', category: 'clothing', price: 25000, currency: 'NGN', inStock: true, quantity: 30 },
              { name: 'Smartphone', category: 'electronics', price: 150000, currency: 'NGN', inStock: true, quantity: 15 },
              { name: 'Rice (50kg)', category: 'food', price: 35000, currency: 'NGN', inStock: false, quantity: 0 },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">
                      {product.currency === 'NGN' ? '₦' : '$'}{product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{product.quantity} units</p>
                  </div>
                  <Badge variant={product.inStock ? 'default' : 'secondary'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
