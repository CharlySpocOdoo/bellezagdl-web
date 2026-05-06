import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getVitrina } from '../../api/vitrina'
import type { VitrinaProduct, VitrinaVariant } from '../../types'

const WHATSAPP_NUMBERS = [
  { name: 'Diana Larios', number: '523332507661' },
  { name: 'Judith Trujillo', number: '523334882895' },
  { name: 'Victor Yuya', number: '523331794362' },
]

export function VitrinaPage() {
  const { brand_slug } = useParams()
  const [products, setProducts] = useState<VitrinaProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<VitrinaProduct | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<VitrinaVariant | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVitrina(brand_slug!)
        setProducts(data)
      } catch (err) {
        console.error('Error cargando vitrina:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [brand_slug])

  const openProduct = (product: VitrinaProduct) => {
    setSelectedProduct(product)
    setSelectedVariant(product.variants.find(v => v.active) || null)
  }

  const closeProduct = () => {
    setSelectedProduct(null)
    setSelectedVariant(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFF5F9', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ background: '#1F3864', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'white', fontSize: '20px', fontWeight: 700, letterSpacing: '1px' }}>
          ROSA DE LIMA COSMETICOS
        </span>
      </div>

      <div style={{ background: '#C44B8A', color: 'white', textAlign: 'center', padding: '10px', fontSize: '18px', fontWeight: 700, letterSpacing: '3px' }}>
        OFERTA
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>Cargando productos...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>No se encontraron productos.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => openProduct(product)}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid #F0D0E0', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(196,75,138,0.08)' }}
              >
                <div style={{ height: '160px', background: '#FFF0F5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '40px' }}>*</span>
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1F3864', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#C44B8A', margin: '4px 0 0' }}>
                    ${Number(product.sale_price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '16px 16px 0', marginTop: '24px', borderTop: '1px solid #F0D0E0' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#555', margin: '0 0 12px' }}>
          Contacta a tu vendedor
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', padding: '24px 16px', marginTop: '24px' }}>
        {WHATSAPP_NUMBERS.map((contact) => (
          <a
            key={contact.number}
            href={`https://wa.me/${contact.number}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#25D366', color: 'white', padding: '12px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {contact.name}
          </a>
        ))}
      </div>

      {selectedProduct && (
        <div onClick={closeProduct} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px 20px' }}>
            <div style={{ width: '40px', height: '4px', background: '#E0E0E0', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ height: '240px', background: '#FFF0F5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '16px' }}>
              {(selectedVariant?.image_url || selectedProduct.image_url) ? (
                <img src={selectedVariant?.image_url || selectedProduct.image_url || undefined} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '80px' }}>*</span>
              )}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F3864', margin: '0 0 8px' }}>{selectedProduct.name}</h2>
            {selectedProduct.description && (
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px' }}>{selectedProduct.description}</p>
            )}
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#C44B8A', margin: '0 0 16px' }}>
              ${Number(selectedProduct.sale_price).toFixed(2)}
            </p>
            {selectedProduct.variants.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#555', margin: '0 0 8px' }}>Presentacion</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProduct.variants.filter(v => v.active).map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: `1px solid ${selectedVariant?.id === v.id ? '#C44B8A' : '#E0E0E0'}`, background: selectedVariant?.id === v.id ? '#FFF0F5' : 'transparent', color: selectedVariant?.id === v.id ? '#C44B8A' : '#333', fontWeight: selectedVariant?.id === v.id ? 600 : 400 }}
                    >
                      {v.variant_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={closeProduct} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'transparent', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', color: '#888', cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
