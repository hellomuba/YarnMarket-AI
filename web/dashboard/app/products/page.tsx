'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Upload, Plus, Search, Download, FileUp } from 'lucide-react'
import { dashboardAPI, type Product, type ProductVariant } from '@/lib/api'
import SimpleProductForm from '@/components/SimpleProductForm'
import AdvancedProductForm from '@/components/AdvancedProductForm'

export default function ProductsPage() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [productType, setProductType] = useState<'simple' | 'advanced'>('simple')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    base_price: '',
    currency: 'NGN',
    ean: '',
    image_url: ''
  })

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [])

  // Close template menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTemplateMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.relative')) {
          setShowTemplateMenu(false)
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showTemplateMenu])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await dashboardAPI.getProducts(1) // TODO: Get merchant_id from auth
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSimpleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const productData: Omit<Product, 'id' | 'created_at'> = {
        merchant_id: 1,
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        category: formData.category as any,
        product_type: 'simple',
        base_price: parseFloat(formData.base_price),
        currency: formData.currency,
        ean: formData.ean,
        image_url: formData.image_url,
        is_active: true,
        variants: []
      }

      await dashboardAPI.createProduct(productData)
      alert('Product created successfully!')

      // Reset form
      setFormData({
        name: '',
        description: '',
        brand: '',
        category: '',
        base_price: '',
        currency: 'NGN',
        ean: '',
        image_url: ''
      })
      setShowUploadForm(false)

      // Reload products
      await loadProducts()
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdvancedSubmit = async (e: React.FormEvent, variants: ProductVariant[]) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const productData: Omit<Product, 'id' | 'created_at'> = {
        merchant_id: 1,
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        category: formData.category as any,
        product_type: 'advanced',
        base_price: parseFloat(formData.base_price),
        currency: formData.currency,
        ean: formData.ean,
        image_url: formData.image_url,
        is_active: true,
        variants: variants.map(v => ({
          ...v,
          price: parseFloat(v.price as any),
          stock_quantity: parseInt(v.stock_quantity as any) || 0,
          availability: true
        }))
      }

      await dashboardAPI.createProduct(productData)
      alert('Product with variants created successfully!')

      // Reset form
      setFormData({
        name: '',
        description: '',
        brand: '',
        category: '',
        base_price: '',
        currency: 'NGN',
        ean: '',
        image_url: ''
      })
      setShowUploadForm(false)

      // Reload products
      await loadProducts()
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowUploadForm(false)
    setFormData({
      name: '',
      description: '',
      brand: '',
      category: '',
      base_price: '',
      currency: 'NGN',
      ean: '',
      image_url: ''
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

  const downloadSimpleTemplate = () => {
    const csvContent = `name,description,brand,category,base_price,currency,ean,image_url
"Cotton T-Shirt","Premium quality cotton t-shirt, comfortable and breathable","LocalBrand","Clothing",5000,NGN,1234567890123,https://example.com/tshirt.jpg
"Wireless Mouse","Ergonomic wireless mouse with USB receiver","TechGear","Electronics",8500,NGN,2345678901234,https://example.com/mouse.jpg
"Organic Honey","Pure organic honey from local farms, 500g jar","NaijaNatural","Food & Groceries",3500,NGN,3456789012345,https://example.com/honey.jpg`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'simple_products_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAdvancedTemplate = () => {
    const csvContent = `product_name,product_description,product_brand,product_category,product_base_price,product_currency,product_ean,product_image_url,variant_name,variant_colour,variant_size,variant_price,variant_stock_quantity,variant_sku
"Designer Sneakers","Premium designer sneakers available in multiple colors and sizes","UrbanFit","Clothing",25000,NGN,4567890123456,https://example.com/sneakers.jpg,"Black Sneakers - Size 40","Black","40",25000,10,SNK-BLK-40
"Designer Sneakers","Premium designer sneakers available in multiple colors and sizes","UrbanFit","Clothing",25000,NGN,4567890123456,https://example.com/sneakers.jpg,"Black Sneakers - Size 42","Black","42",25000,15,SNK-BLK-42
"Designer Sneakers","Premium designer sneakers available in multiple colors and sizes","UrbanFit","Clothing",25000,NGN,4567890123456,https://example.com/sneakers.jpg,"White Sneakers - Size 40","White","40",27000,12,SNK-WHT-40
"Designer Sneakers","Premium designer sneakers available in multiple colors and sizes","UrbanFit","Clothing",25000,NGN,4567890123456,https://example.com/sneakers.jpg,"White Sneakers - Size 42","White","42",27000,20,SNK-WHT-42
"Designer Sneakers","Premium designer sneakers available in multiple colors and sizes","UrbanFit","Clothing",25000,NGN,4567890123456,https://example.com/sneakers.jpg,"Red Sneakers - Size 42","Red","42",28000,5,SNK-RED-42`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'advanced_products_template.csv')
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
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            {showTemplateMenu && (
              <div className="absolute top-full mt-2 right-0 bg-background border rounded-lg shadow-lg z-10 min-w-[200px]">
                <button
                  onClick={() => {
                    downloadSimpleTemplate()
                    setShowTemplateMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded-t-lg transition-colors"
                >
                  <div className="font-medium">Simple Products</div>
                  <div className="text-xs text-muted-foreground">Single variant products</div>
                </button>
                <button
                  onClick={() => {
                    downloadAdvancedTemplate()
                    setShowTemplateMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded-b-lg transition-colors border-t"
                >
                  <div className="font-medium">Advanced Products</div>
                  <div className="text-xs text-muted-foreground">Multiple variants (size, color)</div>
                </button>
              </div>
            )}
          </div>
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
        <div className="space-y-4">
          {/* Product Type Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Select Product Type</CardTitle>
              <CardDescription>Choose between simple or advanced product with variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={productType === 'simple' ? 'default' : 'outline'}
                  onClick={() => setProductType('simple')}
                  className="flex-1"
                >
                  Simple Product
                </Button>
                <Button
                  type="button"
                  variant={productType === 'advanced' ? 'default' : 'outline'}
                  onClick={() => setProductType('advanced')}
                  className="flex-1"
                >
                  Advanced Product (Variants)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Render appropriate form */}
          {productType === 'simple' ? (
            <SimpleProductForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSimpleSubmit}
              onCancel={handleCancel}
              submitting={submitting}
            />
          ) : (
            <AdvancedProductForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleAdvancedSubmit}
              onCancel={handleCancel}
              submitting={submitting}
            />
          )}
        </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg border-2 border-primary/20">
                <h4 className="font-semibold mb-2">Simple Products Template</h4>
                <p className="text-xs text-muted-foreground mb-3">For products with single price and no variants</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mb-3">
                  <li>One row = one product</li>
                  <li>Fields: name, description, brand, category, base_price, currency, ean, image_url</li>
                  <li>Categories: Clothing, Electronics, Food & Groceries, etc.</li>
                </ul>
                <Button onClick={downloadSimpleTemplate} variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-3 w-3" />
                  Download Simple Template
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg border-2 border-primary/20">
                <h4 className="font-semibold mb-2">Advanced Products Template</h4>
                <p className="text-xs text-muted-foreground mb-3">For products with multiple variants (sizes, colors)</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mb-3">
                  <li>Multiple rows for same product = multiple variants</li>
                  <li>Product fields + variant fields (variant_name, colour, size, price, stock, sku)</li>
                  <li>Example: Same sneaker in different sizes and colors</li>
                </ul>
                <Button onClick={downloadAdvancedTemplate} variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-3 w-3" />
                  Download Advanced Template
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                Cancel
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products yet. Add your first product above!
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.brand && (
                            <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                          )}
                          <Badge variant={product.product_type === 'advanced' ? 'default' : 'secondary'} className="text-xs">
                            {product.product_type === 'advanced' ? 'Advanced' : 'Simple'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">
                          {product.currency === 'NGN' ? '₦' : product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : '£'}
                          {product.base_price?.toLocaleString() || product.price?.toLocaleString() || '0'}
                        </p>
                        {product.product_type === 'advanced' && Array.isArray(product.variants) && product.variants.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Show variants for advanced products */}
                  {product.product_type === 'advanced' && Array.isArray(product.variants) && product.variants.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Variants:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {product.variants.map((variant, idx) => (
                          <div key={variant.id || idx} className="text-xs p-2 bg-muted/30 rounded border">
                            <div className="font-medium">{variant.variant_name}</div>
                            <div className="text-muted-foreground flex items-center justify-between mt-1">
                              <span>
                                {variant.colour && `${variant.colour} • `}
                                {variant.size && `Size ${variant.size}`}
                              </span>
                              <span className="font-semibold">
                                {product.currency === 'NGN' ? '₦' : '$'}{variant.price?.toLocaleString()}
                              </span>
                            </div>
                            {variant.stock_quantity !== undefined && (
                              <div className="text-muted-foreground mt-1">
                                Stock: {variant.stock_quantity} • {variant.sku}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
